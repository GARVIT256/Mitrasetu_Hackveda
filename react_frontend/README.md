# Live with Mitra – Gemini Realtime (WebRTC)

This app integrates Gemini Realtime via WebRTC using a server-side SDP offer proxy to keep your API key secure.

Quick notes:
- Do not put `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY` in the frontend `.env`. Use the server `.env` only.
- Backend provides `POST /api/gemini/webrtc/offer` which forwards the SDP offer to Google and returns the SDP answer.
- Frontend posts the local SDP offer to `API_BASE` (configured in `src/config.js`).

Env (server):
- `GEMINI_API_KEY`=your key (server only)
- `ALLOWED_ORIGINS`=http://localhost:5173 (and your prod origin)
- Optional: `GEMINI_REALTIME_MODEL` (default: models/gemini-2.5-flash)
- Optional: `GEMINI_REALTIME_SDP_URL` to override upstream URL.

Run:
1. Start backend server (port 5001 default)
2. Start frontend (Vite dev server)
3. Open Live page, allow mic/camera, click Connect.

Troubleshooting:
- 404 on offer: ensure backend is on :5001 and `API_BASE` matches.
- 401/403: verify `GEMINI_API_KEY` configured server-side and not in browser.
- No audio: check mic permission, ensure remote audio element is attached.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Gemini Live (Experimental Scaffold)

This repo includes an experimental UI + hook scaffolding for a future Google Gemini Live real-time session (audio, video, screen share). It mirrors the Python sample structure you provided.

### Added Files

- `src/lib/geminiLiveClient.js` – Placeholder WebSocket client wrapper (protocol subject to change).
- `src/hooks/useGeminiLive.js` – React hook orchestrating connection, mic/camera/screen capture, transcript, audio playback queue.
- `src/components/GeminiLiveControls.jsx` – UI controls (connect, mic, camera, screen, transcript).
- `server/index.js` – Express proxy that currently returns the raw API key (DO NOT use as-is in production).
- `.env.example` – Environment variable template.

### Setup Instructions
1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
2. Install backend dependencies:
	```bash
	npm install express cors dotenv
	```
3. Start the proxy server:
	```bash
	node server/index.js
	```
4. In another terminal run the frontend:
	```bash
	npm run dev
	```
5. Navigate to the chat page; you'll see the Gemini Live controls beneath the AI Assistant.

### Security Warning
Never expose a permanent API key to the browser. Replace the token endpoint with logic that issues short‑lived, restricted tokens or move streaming logic to the server (e.g. via WebRTC relay or server-side WS).

### Limitations / TODO
- WebSocket endpoint + message schema are placeholders; adjust once official browser Live API spec is published.
- Audio capture uses deprecated `ScriptProcessorNode`; migrate to `AudioWorklet` for lower latency.
- No moderation / safety filters included.
- Playback assumes server sends raw PCM or decodable encoded audio; adjust when actual format known.
- Token endpoint must be redesigned (ephemeral / signed).

### Extending
- Merge transcripts with existing assistant messages for unified conversation.
- Add adaptive frame rate (e.g., reduce when user idle to save bandwidth).
- Implement interruption (clear queued audio when user speaks) once protocol supports it.

Use this scaffold only for experimentation until the official API contract stabilizes.

## Production Hardening Additions

Recent enhancements:
- Unified conversation context (`ConversationContext`) shared by AI Assistant + Gemini Live.
- Safety utilities (`utils/safety.js`) for basic profanity masking and crisis phrase detection (placeholder only).
- Hardened proxy server: token bucket rate limiting, origin filtering, simulated ephemeral token endpoint `/api/gemini/live-token`.
- AudioWorklet-based low-latency microphone capture with fallback to ScriptProcessor.
- Centralized token usage via `GeminiLiveControls` now calling `/api/gemini/live-token`.

### Deploy Checklist
- Replace simulated ephemeral token with genuine short-lived credentials (when provider offers) or move streaming server-side.
- Add robust moderation (self-harm, abuse, medical, personal data) before forwarding to model.
- Implement logging & audit trails (mask PII before storage).
- Add retry / backoff for transient network failures.
- Serve over HTTPS; enforce HSTS & secure cookies if session-based auth added.
- CSP headers & subresource integrity for critical scripts.
- Replace placeholder WebSocket protocol with official schema mapping once released.

### Crisis Handling (Planned)
- When `detectRiskPhrases` flags risk, surface a distinct UI banner with helplines (e.g., Tele-MANAS) and encourage professional help.
- Optionally throttle model responses until user acknowledges safety resources.

### Performance Ideas
- Batch video frames adaptively (reduce to 0.2 fps when no speech detected).
- Silence detection to suspend audio send during long quiet periods.
- Client-side ring buffer for smoother playback (jitters currently unhandled).


