// Gemini Live WebSocket client adapted from the demo repository logic.
// Handles setup, sending text/audio/image, and parsing streamed responses (text + audio PCM)

import { REALTIME_MODEL } from '../config';

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function blobToJSON(blobOrBuffer) {
  try {
    if (blobOrBuffer instanceof Blob) {
      const text = await blobOrBuffer.text();
      return JSON.parse(text);
    }
    if (blobOrBuffer instanceof ArrayBuffer) {
      const text = new TextDecoder().decode(blobOrBuffer);
      return JSON.parse(text);
    }
    // Fallback for string
    if (typeof blobOrBuffer === 'string') {
      return JSON.parse(blobOrBuffer);
    }
  } catch (e) {
    throw new Error('Invalid JSON in WebSocket frame');
  }
}

function base64ToArrayBuffer(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
  return bytes.buffer;
}

export class GeminiWebsocketClient {
  constructor({ name = 'GeminiWS', tokenProvider, url, config, onOpen, onClose, onError, onText, onAudioChunk, debug = false } = {}) {
    this.name = name;
    this.tokenProvider = tokenProvider; // async () => token
    this.url = url; // optional; if not provided, build from token
    this.config = config || { setup: { model: REALTIME_MODEL } };
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.onText = onText;
    this.onAudioChunk = onAudioChunk;
    this.debug = debug;
    this.ws = null;
    this._connecting = false;
  }

  async connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    if (this._connecting) return;
    this._connecting = true;
    try {
      let wsUrl = this.url;
      if (!wsUrl) {
        const token = await (this.tokenProvider ? this.tokenProvider() : Promise.resolve(''));
        if (!token) throw new Error('Missing token for Gemini Live WebSocket');
        wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(token)}`;
      }

      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';

      ws.addEventListener('open', () => {
        this.debug && console.info(`[${this.name}] WebSocket open`);
        this.ws = ws;
        this._connecting = false;
        try { this._sendJSON(this.config); } catch {}
        this.onOpen && this.onOpen();
      });

      ws.addEventListener('close', (evt) => {
        this.debug && console.info(`[${this.name}] WebSocket closed`, evt?.code, evt?.reason);
        this.ws = null;
        this._connecting = false;
        this.onClose && this.onClose();
      });

      ws.addEventListener('error', (err) => {
        this.debug && console.error(`[${this.name}] WebSocket error`, err);
        this.onError && this.onError(err instanceof Error ? err : new Error('WebSocket error'));
      });

      ws.addEventListener('message', async (evt) => {
        // Some servers respond with binary blobs. Support Blob, ArrayBuffer and string.
        const payload = evt.data;
        try {
          const json = await blobToJSON(payload);
          this._processIncoming(json);
        } catch {
          // If not JSON, try treat as audio bytes
          if (payload instanceof ArrayBuffer) {
            this.onAudioChunk && this.onAudioChunk(payload);
          } else if (payload instanceof Blob) {
            try { this.onAudioChunk && this.onAudioChunk(await payload.arrayBuffer()); } catch {}
          } else {
            // ignore
          }
        }
      });
    } catch (e) {
      this._connecting = false;
      this.onError && this.onError(e);
      throw e;
    }
  }

  close() {
    try { this.ws && this.ws.close(); } catch {}
    this.ws = null;
    this._connecting = false;
  }

  _processIncoming(response) {
    if (!response) return;

    // serverContent parsing based on demo repo
    if (response.serverContent) {
      const sc = response.serverContent;
      if (sc.interrupted) return; // could surface via callback if desired
      if (sc.modelTurn && Array.isArray(sc.modelTurn.parts)) {
        const parts = sc.modelTurn.parts;
        // emit audio first so playback begins quickly
        parts.forEach((p) => {
          if (p.inlineData && typeof p.inlineData.data === 'string' && (p.inlineData.mimeType || '').startsWith('audio/pcm')) {
            try {
              const buf = base64ToArrayBuffer(p.inlineData.data);
              this.onAudioChunk && this.onAudioChunk(buf);
            } catch {}
          }
        });
        parts.forEach((p) => {
          if (typeof p.text === 'string' && p.text) {
            this.onText && this.onText(p.text);
          }
          if (p.transcript && typeof p.transcript.text === 'string') {
            this.onText && this.onText(p.transcript.text);
          }
        });
      }
      return;
    }

    // Some servers wrap events differently
    if (response.event && response.event.transcript && typeof response.event.transcript.text === 'string') {
      this.onText && this.onText(response.event.transcript.text);
      return;
    }
  }

  sendText(text, endOfTurn = true) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload = {
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }]}],
        turnComplete: !!endOfTurn
      }
    };
    this._sendJSON(payload);
  }

  sendAudioPcm(pcmArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (!(pcmArrayBuffer instanceof ArrayBuffer)) return;
    const base64 = arrayBufferToBase64(pcmArrayBuffer);
    const payload = { realtimeInput: { mediaChunks: [{ mimeType: 'audio/pcm', data: base64 }] } };
    this._sendJSON(payload);
  }

  sendImage(base64Jpeg) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (!base64Jpeg) return;
    const payload = { realtimeInput: { mediaChunks: [{ mimeType: 'image/jpeg', data: base64Jpeg }] } };
    this._sendJSON(payload);
  }

  _sendJSON(obj) {
    try { this.ws && this.ws.send(JSON.stringify(obj)); } catch (e) { this.onError && this.onError(e); }
  }
}
