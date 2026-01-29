// Record a short mic clip and POST to backend turn endpoint, returning a Blob URL to play
export async function recordAndSendTurn({ durationMs = 3000, endpoint = '/api/gemini/live/turn' } = {}) {
  // Request mic
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  const chunks = [];
  const stopped = new Promise(resolve => { recorder.onstop = resolve; });
  recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  recorder.start();
  await new Promise(r => setTimeout(r, durationMs));
  recorder.stop();
  await stopped;
  // Stop tracks
  stream.getTracks().forEach(t => t.stop());

  // Convert WebM/Opus to PCM WAV on server? For simplicity, we send as webm; if server expects wav, transcode client-side is heavy.
  // Here we optimistically send as-is; backend currently expects WAV. If needed, switch MediaRecorder mimeType to 'audio/wav' when supported.
  const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
  if (!res.ok) throw new Error(`Turn failed: ${res.status}`);
  const wav = await res.blob();
  return URL.createObjectURL(wav);
}
