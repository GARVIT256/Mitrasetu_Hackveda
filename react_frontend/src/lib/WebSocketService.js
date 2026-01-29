// Gemini Live WebSocket Service integrated version
// Simplified from provided sample; heavy debug logs trimmed. Add logs as needed.
import { API_KEY as API_KEY_BASE, WEBSOCKET_HOST, WEBSOCKET_PATH, MODEL_NAME, AUDIO_SAMPLE_RATE, AEC_ENABLED, AGC_ENABLED, NS_ENABLED } from '../config';

let ws = null;
let statusCb, errorCb, transcriptCb, messageCb, interruptionCb, turnCompleteCb;
let setupCompleted = false;
let audioChunkCounter = 0;
let attempt = 0;
const MAX_ATTEMPTS = 2; // keep low; upstream hook does fallback
let backoffTimer = null;

export function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return; // guard
  if (attempt >= MAX_ATTEMPTS) { errorCb?.('Live WS: max attempts reached'); return; }
  attempt++;
  if (!API_KEY_BASE) { errorCb?.('Missing API key'); return; }
  const url = `wss://${WEBSOCKET_HOST}${WEBSOCKET_PATH}?key=${API_KEY_BASE}`;
  ws = new WebSocket(url);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => { setupCompleted = false; audioChunkCounter = 0; sendInitialSetup(); statusCb?.('connected'); };
  ws.onclose = (evt) => {
    const { code, reason, wasClean } = evt;
    const detail = `closed code=${code} clean=${wasClean} reason="${reason || 'n/a'}"`;
    statusCb?.('disconnected');
    if (!setupCompleted) errorCb?.(`WebSocket ${detail}`);
    ws = null;
    if (!setupCompleted && attempt < MAX_ATTEMPTS) {
      const delay = 300 * attempt; // simple backoff
      backoffTimer && clearTimeout(backoffTimer);
      backoffTimer = setTimeout(()=> connect(), delay);
    }
  };
  ws.onerror = (e) => { errorCb?.(e?.message || 'WebSocket error'); statusCb?.('error'); };
  ws.onmessage = (evt) => handleIncoming(evt);
}

export function disconnect() { if (backoffTimer) { clearTimeout(backoffTimer); backoffTimer = null; } attempt = 0; if (ws) { try { ws.close(); } catch {} ws = null; } }
export const isConnected = () => !!ws && ws.readyState === WebSocket.OPEN;
export const isSetupComplete = () => setupCompleted;

export function setOnStatusUpdateCallback(cb){ statusCb = cb; }
export function setOnErrorCallback(cb){ errorCb = cb; }
export function setOnTranscriptCallback(cb){ transcriptCb = cb; }
export function setOnMessageCallback(cb){ messageCb = cb; }
export function setOnInterruptionCallback(cb){ interruptionCb = cb; }
export function setOnTurnCompleteCallback(cb){ turnCompleteCb = cb; }

function sendInitialSetup() {
  if (!isConnected()) return;
  const setupMessage = {
    setup: {
      model: MODEL_NAME,
      systemInstruction: { parts: [{ text: 'You are a compassionate mental health assistant. Provide empathetic, concise, safe support.' }] },
  inputAudioTranscription: {},
  outputAudioTranscription: {},
  // Placeholders for future model config flags (if supported by API)
  audioFeatures: { aec: AEC_ENABLED, agc: AGC_ENABLED, ns: NS_ENABLED }
    }
  };
  ws.send(JSON.stringify(setupMessage));
}

function handleIncoming(evt) {
  const data = evt.data;
  if (data instanceof ArrayBuffer) {
    // try decode as JSON else treat as audio
    try {
      const txt = new TextDecoder().decode(data);
      if (txt[0] === '{' || txt[0] === '[') {
        const json = JSON.parse(txt);
        processJson(json); return;
      }
    } catch { /* fallthrough */ }
    messageCb?.({ type: 'raw-pcm', data });
    return;
  }
  if (typeof data === 'string') {
    try { const json = JSON.parse(data); processJson(json); } catch { errorCb?.('Parse error'); }
  }
}

function processJson(message) {
  if (message.setupComplete !== undefined) { setupCompleted = true; return; }
  if (message.event) {
    const t = message.event.transcript; if (t && transcriptCb) transcriptCb({ text: t.text, isFinal: !!t.is_final, type: 'model' });
    if (message.event.turnComplete) turnCompleteCb?.();
    return;
  }
  if (message.serverContent) {
    const sc = message.serverContent;
    if (sc.inputTranscription?.text) transcriptCb?.({ text: sc.inputTranscription.text, isFinal: !!sc.inputTranscription.is_final, type: 'user' });
    if (sc.outputTranscription?.text) transcriptCb?.({ text: sc.outputTranscription.text, isFinal: !!sc.outputTranscription.is_final, type: 'model' });
    if (sc.modelTurn?.parts) {
      sc.modelTurn.parts.forEach(p => {
        if (p.transcript?.text) transcriptCb?.({ text: p.transcript.text, isFinal: !!p.transcript.is_final, type: 'model' });
        if (p.text) transcriptCb?.({ text: p.text, isFinal: false, type: 'model' });
        if (p.inlineData?.data && p.inlineData?.mimeType) {
          try { const buf = Uint8Array.from(atob(p.inlineData.data), c=>c.charCodeAt(0)).buffer; messageCb?.({ type: 'audio', data: buf, mimeType: p.inlineData.mimeType }); } catch {}
        }
      });
    }
    if (sc.interrupted) interruptionCb?.();
    if (sc.turnComplete) turnCompleteCb?.();
    return;
  }
  if (message.error) errorCb?.(message.error.message || 'Server error');
}

export function sendTextInput(text) {
  if (!isConnected()) return;
  const payload = { clientContent: { turns: [{ role: 'USER', parts: [{ text }] }], turnComplete: true } };
  ws.send(JSON.stringify(payload));
}

export function sendAudioChunk(pcmArrayBuffer) {
  if (!isConnected()) return;
  if (!(pcmArrayBuffer instanceof ArrayBuffer)) return;
  // Convert PCM to base64
  const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmArrayBuffer)));
  const msg = { realtimeInput: { audio: { mimeType: `audio/pcm;rate=${AUDIO_SAMPLE_RATE}`, data: base64 } } };
  audioChunkCounter++; ws.send(JSON.stringify(msg));
}
