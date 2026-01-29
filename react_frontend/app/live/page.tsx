"use client"

import React, { useEffect, useRef, useState } from "react"

// Simple tailwind-based mock UI for Live with Mitra
// - Camera preview (local only)
// - Mic/camera toggle
// - Screen share toggle
// - Device selection (camera/mic)
// - Timer and connection status (mocked)
// - No network calls to Gemini or backend

function useDevices() {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [mics, setMics] = useState<MediaDeviceInfo[]>([])
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    const list = async () => {
      try {
        // Request permissions once so device labels are available
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setGranted(true)
      } catch (e) {
        console.warn("Permissions not granted yet", e)
      }
      try {
        const all = await navigator.mediaDevices.enumerateDevices()
        setCameras(all.filter((d) => d.kind === "videoinput"))
        setMics(all.filter((d) => d.kind === "audioinput"))
      } catch (e) {
        console.error("Failed to enumerate devices", e)
      }
    }
    list()

    const handleChange = () => list()
    navigator.mediaDevices.addEventListener?.("devicechange", handleChange)
    return () => navigator.mediaDevices.removeEventListener?.("devicechange", handleChange)
  }, [])

  return { cameras, mics, granted }
}

export default function LivePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const screenRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  const { cameras, mics } = useDevices()
  const [cameraId, setCameraId] = useState<string | undefined>(undefined)
  const [micId, setMicId] = useState<string | undefined>(undefined)

  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [screenOn, setScreenOn] = useState(false)

  const [status, setStatus] = useState("Ready")
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Start timer when any media is active
  useEffect(() => {
    const anyOn = camOn || micOn || screenOn
    if (!anyOn) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [camOn, micOn, screenOn])

  const startMedia = async (constraints?: MediaStreamConstraints) => {
    try {
      setStatus("Starting devices…")
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints ?? {
          video: cameraId ? { deviceId: { exact: cameraId } } : true,
          audio: micId ? { deviceId: { exact: micId } } : true,
        }
      )
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setStatus("Live (mock)")
      setError(null)
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? String(e))
      setStatus("Error")
    }
  }

  const stopMedia = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const toggleCamera = async () => {
    if (!camOn) {
      setCamOn(true)
      await startMedia()
    } else {
      setCamOn(false)
      const s = streamRef.current
      s?.getVideoTracks().forEach((t) => t.enabled = false)
    }
  }

  const toggleMic = async () => {
    if (!micOn) {
      setMicOn(true)
      if (!streamRef.current) await startMedia()
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = true))
    } else {
      setMicOn(false)
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = false))
    }
  }

  const toggleScreen = async () => {
    if (!screenOn) {
      try {
        const display = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false })
        screenStreamRef.current = display
        if (screenRef.current) {
          screenRef.current.srcObject = display
          await screenRef.current.play().catch(() => {})
        }
        setScreenOn(true)
        // Stop when user ends share from browser UI
        display.getVideoTracks()[0]?.addEventListener("ended", () => {
          setScreenOn(false)
          if (screenRef.current) screenRef.current.srcObject = null
          screenStreamRef.current?.getTracks().forEach((t) => t.stop())
          screenStreamRef.current = null
        })
      } catch (e: any) {
        setError(e?.message ?? String(e))
      }
    } else {
      setScreenOn(false)
      if (screenRef.current) screenRef.current.srcObject = null
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }
  }

  useEffect(() => {
    // auto start media on mount
    startMedia()
    return () => {
      stopMedia()
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectCam = async (id: string) => {
    setCameraId(id)
    // Restart video track with selected camera
    try {
      const current = streamRef.current
      const audioTrack = current?.getAudioTracks()?.[0]
      current?.getTracks().forEach((t) => t.stop())

      await startMedia({
        video: { deviceId: { exact: id } },
        audio: audioTrack ? true : (micId ? { deviceId: { exact: micId } } : true),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectMic = async (id: string) => {
    setMicId(id)
    // Replace only the audio track if possible
    try {
      const newAudio = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: id } } })
      const aTrack = newAudio.getAudioTracks()[0]
      const current = streamRef.current
      const senders = (videoRef.current as any)?.srcObject
      if (current) {
        // stop old audio
        current.getAudioTracks().forEach((t) => t.stop())
        current.addTrack(aTrack)
        if (videoRef.current) {
          videoRef.current.srcObject = current
        }
      } else {
        // if no stream, just start
        await startMedia()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Live with Mitra (Mock)</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded ${status === "Live (mock)" ? "bg-green-700/40" : "bg-zinc-700/40"}`}>{status}</span>
            <span className="px-2 py-1 rounded bg-zinc-800">{fmtTime(seconds)}</span>
          </div>
        </header>

        {error && (
          <div className="p-3 rounded bg-red-600/20 border border-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-black/60 rounded-xl overflow-hidden relative">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
              {!camOn && (
                <div className="absolute inset-0 grid place-items-center bg-black/60">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm text-zinc-300">Camera off</div>
                  </div>
                </div>
              )}
            </div>

            <div className="aspect-video bg-black/40 rounded-xl overflow-hidden relative">
              <video ref={screenRef} className="w-full h-full object-contain" playsInline autoPlay />
              {!screenOn && (
                <div className="absolute inset-0 grid place-items-center text-zinc-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🖥️</div>
                    <div className="text-sm">Screen share not active</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="p-4 bg-zinc-900 rounded-xl space-y-3">
              <div className="text-sm text-zinc-400">Devices</div>
              <label className="block text-xs text-zinc-400">Camera</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
                value={cameraId}
                onChange={(e) => handleSelectCam(e.target.value)}
              >
                <option value="">Default</option>
                {cameras.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>

              <label className="block text-xs text-zinc-400 mt-2">Microphone</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
                value={micId}
                onChange={(e) => handleSelectMic(e.target.value)}
              >
                <option value="">Default</option>
                {mics.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-zinc-900 rounded-xl grid grid-cols-3 gap-2">
              <button
                className={`px-3 py-2 rounded ${micOn ? "bg-emerald-700/60" : "bg-zinc-800"}`}
                onClick={toggleMic}
              >
                {micOn ? "Mic On" : "Mic Off"}
              </button>
              <button
                className={`px-3 py-2 rounded ${camOn ? "bg-emerald-700/60" : "bg-zinc-800"}`}
                onClick={toggleCamera}
              >
                {camOn ? "Camera On" : "Camera Off"}
              </button>
              <button
                className={`px-3 py-2 rounded ${screenOn ? "bg-blue-700/60" : "bg-zinc-800"}`}
                onClick={toggleScreen}
              >
                {screenOn ? "Stop Share" : "Share Screen"}
              </button>
            </div>

            <div className="p-4 bg-zinc-900 rounded-xl space-y-2">
              <div className="text-sm text-zinc-400">Mock Notes</div>
              <p className="text-sm text-zinc-300">
                This is a local-only mock. Camera/mic/screen work on your device. No calls to Gemini Live.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
