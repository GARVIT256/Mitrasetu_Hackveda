// Browser WebRTC client for Gemini Multimodal Live via backend SDP proxy
// Usage: new GeminiWebRtcClient({ offerUrl, onConnected, onDisconnected, onError, onTranscript, onAudioTrack })

import { API_BASE } from '../config';

export class GeminiWebRtcClient {
  constructor({ offerUrl = '/api/gemini/webrtc/offer', model, onConnected, onDisconnected, onError, onTranscript, onAudioTrack } = {}) {
    this.offerUrl = offerUrl;
    this.model = model;
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
    this.onError = onError;
    this.onTranscript = onTranscript;
    this.onAudioTrack = onAudioTrack;
    this.pc = null;
    this.dataChannel = null;
  this.pendingStreams = [];
  this._isNegotiating = false;
  this._hasInitialAnswer = false;
  }

  async connect() {
  if (this.pc) return;

    try {
      const pc = new RTCPeerConnection({
        // Public STUN; swap/add TURN if you need NAT traversal guarantees
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
      });
      this.pc = pc;

      console.log('[WebRTC] creating RTCPeerConnection');

      pc.onconnectionstatechange = () => {
        console.log('[WebRTC] connectionState:', pc.connectionState);
        if (pc.connectionState === 'connected') this.onConnected && this.onConnected();
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          this.onDisconnected && this.onDisconnected();
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
      };

      pc.ontrack = (evt) => {
        console.log('[WebRTC] track received:', evt.track.kind);
        if (evt.track.kind === 'audio') {
          this.onAudioTrack && this.onAudioTrack(evt.streams[0]);
        }
      };

      pc.onnegotiationneeded = async () => {
        // Avoid early renegotiation before first answer and while not stable
        if (!this._hasInitialAnswer) { console.log('[WebRTC] negotiationneeded ignored (no initial answer yet)'); return; }
        if (pc.signalingState !== 'stable') { console.log('[WebRTC] negotiationneeded ignored (signalingState:', pc.signalingState, ')'); return; }
        console.log('[WebRTC] negotiationneeded');
        try { await this._negotiate(); } catch (e) { console.error('[WebRTC] negotiation error', e); this.onError && this.onError(e); }
      };

      pc.onerror = (e) => {
        console.error('[WebRTC] peer connection error:', e);
        this.onError && this.onError(new Error('WebRTC error: ' + e));
      };

  // Datachannel for text messages and partial transcripts (if provided by server)
      this.dataChannel = pc.createDataChannel('oob-text');
      this.dataChannel.onopen = () => console.log('[WebRTC] datachannel open');
      this.dataChannel.onclose = () => console.log('[WebRTC] datachannel close');
      this.dataChannel.onerror = (e) => console.error('[WebRTC] datachannel error:', e);
      this.dataChannel.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'transcript' && msg.text) this.onTranscript && this.onTranscript(msg.text, { isFinal: !!msg.isFinal });
        } catch {
          // Plain text fallback
          const text = String(evt.data || '');
          if (text) this.onTranscript && this.onTranscript(text, { isFinal: true });
        }
      };

      // Ensure we have a receiving transceiver for audio (some browsers ignore offerToReceive flags)
      try {
        pc.addTransceiver('audio', { direction: 'recvonly' });
        console.log('[WebRTC] added audio recvonly transceiver');
      } catch (e) {
        console.warn('[WebRTC] addTransceiver failed (non-fatal):', e);
      }

      // Add any pending local streams (mic/cam) before creating the initial offer
      if (this.pendingStreams.length) {
        this.pendingStreams.forEach(stream => {
          try { stream.getTracks().forEach(t => pc.addTrack(t, stream)); } catch {}
        });
      }

      console.log('[WebRTC] creating offer');
      const offer = await Promise.race([
        pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('createOffer timeout')), 5000))
      ]);
      console.log('[WebRTC] offer created:', offer.type);
      
      try {
        await pc.setLocalDescription(offer);
        console.log('[WebRTC] setLocalDescription success');
      } catch (e) {
        console.error('[WebRTC] setLocalDescription failed:', e);
        throw e;
      }

      // Wait for ICE gathering to complete so the SDP includes candidates (no trickle)
      console.log('[WebRTC] ICE gathering state:', pc.iceGatheringState);
      if (pc.iceGatheringState !== 'complete') {
        console.log('[WebRTC] waiting for ICE gathering...');
        await new Promise((resolve) => {
          const check = () => {
            console.log('[WebRTC] ICE gathering state changed to:', pc.iceGatheringState);
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', check);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', check);
          // Safety timeout
          setTimeout(() => {
            console.log('[WebRTC] ICE gathering timeout, proceeding anyway');
            pc.removeEventListener('icegatheringstatechange', check);
            resolve();
          }, 2500);
        });
      }
      console.log('[WebRTC] ICE gathering complete, final state:', pc.iceGatheringState);

      const params = this.model ? `?model=${encodeURIComponent(this.model)}` : '';
      const url = `${API_BASE || ''}${this.offerUrl}${params}`;
      console.log('[WebRTC] POST offer to', url);
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: (pc.localDescription && pc.localDescription.sdp) || offer.sdp
      });
      const answerSdp = await resp.text();
      console.log('[WebRTC] answer status', resp.status);
      if (!resp.ok) throw new Error(`Offer proxy failed: ${answerSdp}`);
      const answer = { type: 'answer', sdp: answerSdp };
  await pc.setRemoteDescription(answer);
      console.log('[WebRTC] setRemoteDescription complete');
  this._hasInitialAnswer = true;
      
    } catch (e) {
      console.error('[WebRTC] connect failed:', e);
      this.onError && this.onError(e);
      throw e;
    }
  }

  addStream(stream) {
    if (!this.pc) {
      // Cache the stream to be added during connect
      this.pendingStreams.push(stream);
      return;
    }
    stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
    // Try renegotiation so remote can receive new tracks (only after initial connection)
    if (this._hasInitialAnswer) {
      this._negotiate().catch(err => console.warn('[WebRTC] renegotiation failed', err));
    }
  }

  async _renegotiate() {
    if (!this.pc) return;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    // NOTE: Some providers support in-band renegotiation over datachannel or REST; for Gemini Live, initial offer may suffice.
    // If upstream requires a new SDP exchange, you would POST here similarly to connect(). Leaving as no-op for now.
  }

  sendText(text) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({ type: 'user_text', text }));
    } else {
      console.warn('[WebRTC] datachannel not open; cannot send text');
    }
  }

  async _negotiate() {
    if (!this.pc) return;
    if (this._isNegotiating) {
      console.log('[WebRTC] negotiation already in progress, skipping');
      return;
    }
    this._isNegotiating = true;
    try {
      const pc = this.pc;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const params = this.model ? `?model=${encodeURIComponent(this.model)}` : '';
      const url = `${API_BASE || ''}${this.offerUrl}${params}`;
      console.log('[WebRTC] POST renegotiation offer to', url);
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: (pc.localDescription && pc.localDescription.sdp) || offer.sdp
      });
      const answerSdp = await resp.text();
      if (!resp.ok) throw new Error(`Offer proxy failed (renegotiate): ${answerSdp}`);
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      console.log('[WebRTC] renegotiation complete');
    } finally {
      this._isNegotiating = false;
    }
  }

  close() {
    try { this.dataChannel && this.dataChannel.close(); } catch {}
    if (this.pc) {
      this.pc.getSenders().forEach(s => { try { s.track && s.track.stop(); } catch {} });
      try { this.pc.close(); } catch {}
      this.pc = null;
    }
  }
}
