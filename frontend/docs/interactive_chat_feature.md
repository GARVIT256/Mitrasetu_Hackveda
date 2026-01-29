# Interactive Chat (Audio + Video + Screen Share + AI)

Status: INITIAL SKELETON (Client-side only)

## Goals
Unify real-time human conversation (WebRTC: camera, mic, optional screen) with an AI assistant (Gemini via Firebase Vertex AI) inside a single Flutter screen.

## Architecture Overview
Layers:
1. UI (`InteractiveChatScreen`) – orchestrates layout, user controls.
2. Realtime Media (`WebRTCService`) – handles peer connection & signaling over Firestore.
3. AI (`InteractiveAIService`) – streams Gemini responses for user prompts (text + future multimodal frames).
4. Signaling (Firestore) – `rooms/{id}` doc stores SDP offer/answer; subcollections store ICE candidates.

```
User <-> UI Widgets <-> WebRTCService <-> Firestore (signaling) <-> Remote Peer
					   \-> InteractiveAIService <-> Firebase Vertex AI (Gemini)
```

## Data Model (Firestore)
Collection: `rooms`
- Fields: offer {sdp,type}, answer {sdp,type}, createdAt, answeredAt, active
Subcollections: callerCandidates, calleeCandidates (ICE records)

## Current Capabilities
- Create / join 1:1 room (multi-remote display grid stands ready for >1 if bridged).
- Local video preview & remote streams rendering.
- Start/stop screen share (web only; native placeholder).
- Toggle mic/video, hang up.
- Send text prompts to Gemini model (streamed partial text rendering).

## Deferred / Next Steps
- True multi-party rooms (mesh or SFU integration e.g., livekit / ion-sfu).
- Audio input -> AI real-time (needs server bridge or official Live API client once available via Firebase SDK).
- AI audio output streaming + TTS voice selection.
- Frame sampling pipeline (e.g., every N seconds capture still frame to multimodal prompt for context).
- User auth integration for secure room access.
- Moderation: content safety checks on outbound/inbound messages.
- Screen share on mobile (need platform-specific capture).

## Security & Privacy Considerations
- Restrict room doc read/write by user claims (Firestore rules).
- Avoid storing raw media; only transient signaling state in Firestore.
- Log AI prompts/responses with PII minimization for analytics.

## Implementation Notes
- WebRTC constraints target 720p@30fps; adjust for bandwidth.
- ICE servers currently only public STUN; production should add TURN for NAT traversal.
- AI service uses `gemini-1.5-flash`; can switch to `gemini-1.5-pro` for richer reasoning.

## Usage
Navigate to route `/interactiveChat`. Use Create Room then share Room ID with a peer (who uses Join Room).
Open AI prompt box to chat with Gemini while call ongoing.

## Limitations
No persistence of chat logs yet.
No reconnection logic on network drop.
No adaptive bitrate / track replace on device switch.

---
Generated initial skeleton on (2025-09-10).
