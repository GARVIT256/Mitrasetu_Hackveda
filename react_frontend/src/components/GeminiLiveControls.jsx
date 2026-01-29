import React, { useEffect, useState } from 'react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PlugZap, Plug, Send } from 'lucide-react';
import { useConversation } from '../context/ConversationContext';
import { LIVE_TOKEN_ENDPOINT } from '../config';
import { recordAndSendTurn } from '../services/liveTurn';
import Orb from './Orb';
import { isMockMode } from '../lib/geminiLiveMock';
import MarkdownMessage from './MarkdownMessage';

async function fetchToken() {
  const res = await fetch(LIVE_TOKEN_ENDPOINT, { headers: { 'Accept': 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Token fetch failed (${res.status})`);
  if (text.startsWith('<')) throw new Error('Unexpected HTML response (check server URL)');
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('Token endpoint returned invalid JSON'); }
  if (!json.token) throw new Error('Token missing in response');
  return json.token;
}

export function GeminiLiveControls() {
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [level, setLevel] = useState(0);
  const { addMessage, messages } = useConversation();
  const mock = isMockMode();
  const live = useGeminiLive({
    autoConnect: false, // prevent auto-connect entirely
    tokenProvider: fetchToken,
    onUserMessage: (text, meta) => addMessage({ role: 'user', text, meta }),
    onAIMessage: (text, meta) => addMessage({ role: 'ai', text, meta })
  });
  const { connected, connecting, error, isMicOn, isCameraOn, isScreenOn, videoRef, connect, disconnect, toggleMic, toggleCamera, toggleScreen, sendUserText } = live;
  const [testAudioUrl, setTestAudioUrl] = useState(null);

  // Generate a pleasant reactive level for the orb when mic is on
  useEffect(() => {
    let id;
    if (isMicOn) {
      id = setInterval(() => {
        setLevel(prev => {
          const target = Math.random() * 0.9;
          return prev * 0.6 + target * 0.4;
        });
      }, 120);
    } else {
      setLevel(0);
    }
    return () => { if (id) clearInterval(id); };
  }, [isMicOn]);

  return (
    <div className="max-w-6xl mx-auto my-10 p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/70 backdrop-blur">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Live with Mitra</h2>
          <p className="mt-1 text-sm text-slate-500">Real-time voice. Friendly and supportive — think real mitra vibes.</p>
        </div>
        <button onClick={()=>setCollapsed(c=>!c)} className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm">
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      {error && !mock && <div className="p-2 mb-4 text-xs text-red-700 bg-red-100 rounded">{error.message || String(error)}</div>}
      {collapsed && <p className="text-xs text-gray-500">Panel collapsed.</p>}
  {!collapsed && (
  <>
  <div className="grid md:grid-cols-3 gap-6 items-stretch mb-4">
        {/* Left column: avatar, connection + mic button, video/screen preview */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="relative flex items-center justify-center h-56 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
            <Orb size={240} hue={260} hoverIntensity={0.3} />
          </div>

          <div className="flex items-center gap-2">
            {mock ? (
              <div className="flex-1 h-11 rounded-xl bg-emerald-100 text-emerald-800 font-medium shadow border border-emerald-200 grid place-items-center text-sm">Mock Mode</div>
            ) : !connected ? (
              <button onClick={()=>{ connect(); }} disabled={connecting} className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-60 transition">
                <span className="inline-flex items-center justify-center gap-2"><PlugZap size={16}/>{connecting ? 'Connecting…' : 'Connect'}</span>
              </button>
            ) : (
              <button onClick={()=>{ disconnect(); }} className="flex-1 h-11 rounded-xl bg-rose-600 text-white font-semibold shadow hover:bg-rose-700 transition">
                <span className="inline-flex items-center justify-center gap-2"><Plug size={16}/>Disconnect</span>
              </button>
            )}
            <button onClick={toggleMic} className={`h-11 w-11 rounded-xl flex items-center justify-center shadow ${isMicOn ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {isMicOn ? <Mic size={18}/> : <MicOff size={18}/>}
            </button>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!isCameraOn && !isScreenOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-slate-500 text-xs sm:text-sm flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <Video className="w-4 h-4" />
                  <span>Camera or Screen preview</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={toggleCamera} className={`h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow ${isCameraOn ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
              {isCameraOn ? <Video size={16}/> : <VideoOff size={16}/>}{isCameraOn ? 'Camera On' : 'Camera'}
            </button>
            <button onClick={toggleScreen} className={`h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow ${isScreenOn ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
              <MonitorUp size={16}/>{isScreenOn ? 'Sharing' : 'Screen Share'}
            </button>
          </div>
        </div>

        {/* Right column: conversation */}
  <div className="md:col-span-2 flex flex-col">
          <div className="flex-1 overflow-y-auto rounded-2xl p-4 md:p-5 bg-white/70 border border-slate-200 shadow-inner min-h-[16rem]">
            {messages.map(m => (
              <div key={m.id} className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' ? (
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow bg-slate-100 text-slate-800 rounded-bl-sm`}>
                    <MarkdownMessage text={m.text} />
                  </div>
                ) : (
                  <span className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow bg-indigo-600 text-white rounded-br-sm`}>{m.text}</span>
                )}
              </div>
            ))}
            {!messages.length && (
              <div className="text-slate-400 text-center text-sm">Hello! I'm here to listen and support you. How are you feeling today?</div>
            )}
          </div>
          <form onSubmit={(e)=>{e.preventDefault(); if(mock) { sendUserText(input);} else { sendUserText(input);} setInput('');}} className="mt-3 flex items-center gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} disabled={false} placeholder={mock? 'Type your message (mock)…' : 'Type your message…'} className="flex-1 h-12 rounded-full border border-slate-200 bg-white px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            <button type="submit" disabled={!input.trim()} className="h-12 px-5 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"><Send size={16}/>Send</button>
          </form>
          {!mock && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={async ()=>{
                try {
                  setTestAudioUrl(null);
                  const url = await recordAndSendTurn({ durationMs: 2500, endpoint: '/api/gemini/live/turn' });
                  setTestAudioUrl(url);
                } catch (e) { console.error('one-turn failed', e); }
              }}
              className="h-9 px-3 rounded-md border text-xs bg-white hover:bg-slate-50"
            >Try one-turn voice (server)</button>
            {testAudioUrl && (
              <audio src={testAudioUrl} controls className="h-9" />
            )}
          </div>
          )}
        </div>
      </div>
  </>
      )}
      <div className="mt-4 text-xs text-slate-500">Protocol placeholder for prototype </div>
    </div>
  );
}

export default GeminiLiveControls;
