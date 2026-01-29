// Central front-end config for live features with safe defaults
export const API_KEY = '';
export const WEBSOCKET_HOST = 'example.com';
export const WEBSOCKET_PATH = '/ws';
export const MODEL_NAME = 'gemini-live-proto';
export const AUDIO_SAMPLE_RATE = 16000;

// Optional audio processing flags (guarded usage)
export const AEC_ENABLED = false; // Acoustic Echo Cancellation
export const AGC_ENABLED = true;  // Auto Gain Control
export const NS_ENABLED = true;   // Noise Suppression

// Token endpoint for Gemini LiveControls scaffold
// Not used with WebRTC flow; kept for compatibility if needed
export const LIVE_TOKEN_ENDPOINT = '/api/gemini/token';

// Centralized configuration & environment access
// Backend proxy base (must match backend/index.js server port)
export const API_BASE = 'http://localhost:5000';
// Optional: override the upstream model for offer proxy if server supports query passthrough
export const REALTIME_MODEL = 'models/gemini-2.5-flash-preview-native-audio-dialog';
// Presentation prototype: live WS removed. Keep only API base if needed later.
