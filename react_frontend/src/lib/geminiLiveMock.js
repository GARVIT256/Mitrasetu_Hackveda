// Mock Gemini Live client for prototype demos.
// Simulates connection latency, streaming text tokens, and optional audio chunks.

const silentMock = (import.meta.env.VITE_LIVE_SILENT_MOCK ?? 'true').toString().toLowerCase() === 'true';

export class GeminiLiveMock {
  constructor({ onOpen, onClose, onError, onText, onAudioChunk }) {
    this.onOpen = onOpen; this.onClose = onClose; this.onError = onError; this.onText = onText; this.onAudioChunk = onAudioChunk;
    this._open = false; this._timers = [];
  }
  async connect() {
    // Simulate network delay
    await new Promise(r=> setTimeout(r, 400));
    this._open = true; this.onOpen && this.onOpen();
    if (silentMock) return; // Do not emit any text in silent mock mode
    // Otherwise, emit a welcome streaming sequence
    const tokens = [
      'Hi there! ', 'I\'m a simulated realtime companion. ', 'This is a prototype demo ', 'showing how live streaming ', 'responses could appear. ', '\nHow can I support you today?'
    ];
    let delay = 0;
    tokens.forEach(tok => {
      const t = setTimeout(()=> { if(this._open) this.onText && this.onText(tok); }, delay += 250);
      this._timers.push(t);
    });
  }
  sendText(userText) {
    if(!this._open) return;
    // Echo back in streaming fashion
    const base = `You said: ${userText}. `;
    const follow = 'Here is a supportive reflection. Remember this is a mock.';
    const pieces = [...base.match(/.{1,18}/g), ...follow.match(/.{1,22}/g)];
    let delay = 0;
    pieces.forEach(p=>{
      const t=setTimeout(()=>{ if(this._open) this.onText && this.onText(p+' '); }, delay+=120);
      this._timers.push(t);
    });
  }
  sendImage() { /* ignore */ }
  sendAudioPcm() { /* ignore */ }
  close(){ this._open=false; this._timers.forEach(clearTimeout); this.onClose && this.onClose(); }
}

export function isMockMode() {
  return (import.meta.env.VITE_LIVE_MODE || '').toLowerCase() === 'mock';
}