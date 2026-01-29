// Lightweight Gemini Live WebSocket client (placeholder implementation)
// This wraps a browser WebSocket and exposes simple send helpers.
// NOTE: The Gemini Live Streaming API is in beta; this file provides a structure
// you can extend once full browser-compatible specs / SDK are available.
// For production: route all traffic through a backend proxy so your API key stays secret.

export class GeminiLiveClient {
  constructor({ model = 'models/gemini-2.5-flash-preview-native-audio-dialog', tokenProvider, onOpen, onClose, onError, onText, onAudioChunk, debug = false }) {
    this.model = model;
    this.tokenProvider = tokenProvider; // async () => { apiKey or ephemeral token }
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.onText = onText;
    this.onAudioChunk = onAudioChunk;
    this.debug = debug;
    this.ws = null;
    this.sessionOpen = false;
  }

  async connect() {
    if (this.ws) return;
    const token = await this.tokenProvider();
    // IMPORTANT: Do NOT pass raw permanent API key from the browser in production.
    // Replace with a short‑lived token from your backend.

    // Placeholder endpoint path — adjust when Google publishes a browser WS endpoint.
    const url = `wss://generativelanguage.googleapis.com/v1beta/${this.model}:live?key=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.sessionOpen = true;
      this.debug && console.log('[GeminiLive] socket open');
      this.onOpen && this.onOpen();
      // You may need to send an initial config message here depending on final protocol.
      const configMsg = {
        type: 'session.update',
        session: {
          response_modalities: ['AUDIO'],
          media_resolution: 'MEDIA_RESOLUTION_LOW'
        }
      };
      try { this.ws.send(JSON.stringify(configMsg)); } catch {}
    };

    this.ws.onmessage = (evt) => {
      try {
        if (typeof evt.data === 'string') {
          // Some backends may return HTML error pages if misconfigured.
          if (evt.data.startsWith('<')) {
            this.onError && this.onError(new Error('Server returned HTML (likely misconfigured endpoint)'));
            return;
          }
          const msg = JSON.parse(evt.data);
          this.debug && console.log('[GeminiLive] json <-', msg);
          if (msg.error) {
            this.onError && this.onError(new Error(msg.error.message || 'Model error'));
          }
          if (msg.text) this.onText && this.onText(msg.text);
        } else if (evt.data instanceof ArrayBuffer) {
          this.onAudioChunk && this.onAudioChunk(evt.data);
        }
      } catch (e) {
        this.onError && this.onError(new Error('Unexpected token in stream / invalid JSON')); 
        this.debug && console.warn('[GeminiLive] parse error', e);
      }
    };

    this.ws.onerror = (err) => {
      this.debug && console.error('[GeminiLive] error', err);
      const friendly = new Error('Realtime connection failed (placeholder implementation / invalid token or network). Text chat still works.');
      this.onError && this.onError(friendly);
    };

    this.ws.onclose = () => {
      this.debug && console.log('[GeminiLive] closed');
      this.sessionOpen = false;
      this.onClose && this.onClose();
      this.ws = null;
    };
  }

  sendText(text, { endOfTurn = true } = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload = {
      type: 'input.text',
      text: text || '.',
      end_of_turn: endOfTurn
    };
    this.ws.send(JSON.stringify(payload));
    this.debug && console.log('[GeminiLive] text ->', payload);
  }

  sendImage(base64Jpeg) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload = {
      type: 'input.image',
      mime_type: 'image/jpeg',
      data: base64Jpeg
    };
    this.ws.send(JSON.stringify(payload));
  }

  sendAudioPcm(pcmArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(pcmArrayBuffer);
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export async function captureVideoFrameToBase64(videoEl) {
  if (!videoEl) return null;
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0);
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.7);
  });
}
