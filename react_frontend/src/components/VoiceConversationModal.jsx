import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, MonitorUp, Bot, AlertCircle } from 'lucide-react';
import Orb from './Orb';
import { useConversation } from '../context/ConversationContext';

// Speech recognition (Web Speech API) wrapper detection
function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const inst = new SR();
  inst.continuous = true;
  inst.onstart = () => {
    // Attempt to set document body font color for better contrast when speech recognition starts
    document.body.style.color = '#22223b'; // dark slate for better contrast
  };
  inst.onend = () => {
    // Optionally reset color when speech recognition ends
    document.body.style.color = '';
  };
  inst.interimResults = true;
  inst.lang = 'en-US'; // TODO: dynamic language detection
  return inst;
}

export default function VoiceConversationModal({ open, onClose, dark=false }) {
  const { addMessage } = useConversation();
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [level, setLevel] = useState(0);
  const [permissionError, setPermissionError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const speechRef = useRef(null);

  // Cleanup on close
  useEffect(()=>{
    if (!open) {
      stopMic();
      stopScreen();
      stopCam();
    }
  }, [open]);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const loop = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    // compute rough amplitude
    let sum=0; for (let i=0;i<data.length;i++){ const v=(data[i]-128)/128; sum += Math.abs(v); }
    const avg = sum / data.length; // 0..1
    setLevel(avg * 2); // amplify visual a bit
    rafRef.current = requestAnimationFrame(loop);
  };

  const startMic = async () => {
    if (micOn) return;
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = ensureAudio();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;
      loop();
      setMicOn(true);
      initSpeechRecognition();
    } catch (e) {
      setPermissionError('Microphone denied');
    }
  };

  const stopMic = () => {
    mediaStreamRef.current?.getAudioTracks().forEach(t=>t.stop());
    mediaStreamRef.current = null;
    analyserRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setLevel(0);
    setMicOn(false);
    if (speechRef.current){ speechRef.current.stop(); speechRef.current = null; }
    setRecognizing(false);
  };

  const initSpeechRecognition = () => {
    const sr = getSpeechRecognition();
    if (!sr) return; // gracefully degrade
    speechRef.current = sr;
    sr.onstart = ()=> setRecognizing(true);
    sr.onerror = (e)=> { console.warn('Speech error', e.error); };
    sr.onend = ()=> { setRecognizing(false); if (micOn) { try { sr.start(); } catch{} } }; // auto-restart
    sr.onresult = (evt) => {
      let interimStr = '';
      let finalStr = '';
      for (let i = evt.resultIndex; i < evt.results.length; ++i) {
        const r = evt.results[i];
        if (r.isFinal) finalStr += r[0].transcript; else interimStr += r[0].transcript;
      }
      if (finalStr) {
        const text = finalStr.trim();
        if (text) {
          addMessage({ role:'user', text, timestamp: new Date().toLocaleTimeString() });
          setTranscript(prev => prev + (prev? '\n':'') + text);
            // Call Gemini API for AI response
            fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini2.5-flash:generateContent?key=' + process.env.NEXT_PUBLIC_GEMINI_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text }] }]
            })
            })
            .then(res => res.json())
            .then(data => {
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not understand.';
            addMessage({ role:'ai', text: aiText, timestamp: new Date().toLocaleTimeString() });
            })
            .catch(() => {
            addMessage({ role:'ai', text: 'Error contacting Gemini API.', timestamp: new Date().toLocaleTimeString() });
            });
        }
      }
      setInterim(interimStr);
    };
    try { sr.start(); } catch {}
  };

  const toggleMic = () => { micOn ? stopMic() : startMic(); };
  const toggleCam = () => { camOn ? stopCam() : startCam(); };
  const toggleScreen = () => { screenOn ? stopScreen() : startScreen(); };

  const startCam = async () => {
    try { await navigator.mediaDevices.getUserMedia({ video:true }); setCamOn(true); } catch { setPermissionError('Camera denied'); }
  };
  const stopCam = () => setCamOn(false);
  const startScreen = async () => {
    try { await navigator.mediaDevices.getDisplayMedia({ video:true }); setScreenOn(true); } catch { setPermissionError('Screen share denied'); }
  };
  const stopScreen = () => setScreenOn(false);

  if (!open) return null;

  return (
  <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 backdrop-blur-xl bg-[#fdfcfe]/90 text-slate-700">
      <div className="relative w-full max-w-5xl h-[640px] grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main stage */}
  <div className="relative col-span-2 rounded-3xl bg-white border border-purple-100 shadow-lg flex flex-col overflow-hidden">
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-white/60 hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/20 transition"><X className="w-4 h-4"/></button>
          <div className="p-6 flex flex-col items-center gap-6">
            <Orb size={240} hue={260} hoverIntensity={0.3} forceHoverState={micOn || recognizing} />
            <div className="text-xs uppercase tracking-wider font-medium text-purple-700">{recognizing? 'Listening' : micOn? 'Active Mic' : 'Mic Off'}</div>
            <div className="w-full">
              <div className="text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">Live Transcript</div>
              <div className="h-44 w-full overflow-y-auto text-sm rounded-xl p-4 bg-purple-50/70 border border-purple-100 shadow-inner">
                {transcript.split('\n').map((l,i)=>(<div key={i} className="mb-1">{l}</div>))}
                {interim && <div className="italic opacity-60">{interim}</div>}
                {!transcript && !interim && <div className="opacity-40">Start speaking to build transcript...</div>}
              </div>
            </div>
            {permissionError && <div className="flex items-center gap-2 text-red-500 text-xs"><AlertCircle className="w-4 h-4"/>{permissionError}</div>}
          </div>
          <div className="mt-auto px-6 pb-6 flex flex-wrap gap-5 items-center justify-center">
            <button onClick={toggleMic} className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition shadow-md ${micOn? 'bg-gradient-to-br from-fuchsia-400 to-rose-400':'bg-gradient-to-br from-violet-400 to-indigo-400 hover:brightness-110'} text-white`}
              title={micOn? 'Stop Mic':'Start Mic'}>
              {micOn? <MicOff className="w-6 h-6"/>:<Mic className="w-6 h-6"/>}
              <span className="absolute inset-0 rounded-full ring-2 ring-white/50 opacity-0 group-hover:opacity-100 transition"/>
            </button>
            <button disabled className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-slate-300 border border-purple-100 cursor-not-allowed" title="Camera (soon)"><Video className="w-6 h-6"/></button>
            <button disabled className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-slate-300 border border-purple-100 cursor-not-allowed" title="Share (soon)"><MonitorUp className="w-6 h-6"/></button>
          </div>
        </div>
        {/* Side panel */}
  <div className="rounded-3xl bg-white border border-purple-100 shadow flex flex-col overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300"><Bot className="w-4 h-4"/> Conversation Log</div>
          <div className="flex-1 overflow-y-auto px-5 pb-6 text-xs text-slate-500 dark:text-slate-400 space-y-3">
            <div className="opacity-60">Full chat remains in main window.</div>
            <div className="opacity-40">Prototype voice UI (no realtime model connected)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
