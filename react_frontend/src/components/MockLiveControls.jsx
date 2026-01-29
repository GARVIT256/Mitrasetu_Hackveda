import React, { useEffect, useRef, useState } from 'react'

// Mock Live controls: local camera/mic/screen with no network calls
export default function MockLiveControls() {
  const videoRef = useRef(null)
  const screenRef = useRef(null)
  const streamRef = useRef(null)
  const screenStreamRef = useRef(null)

  const [cameras, setCameras] = useState([])
  const [mics, setMics] = useState([])
  const [cameraId, setCameraId] = useState('')
  const [micId, setMicId] = useState('')

  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [screenOn, setScreenOn] = useState(false)

  const [status, setStatus] = useState('Ready')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const anyOn = camOn || micOn || screenOn
    if (!anyOn) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [camOn, micOn, screenOn])

  useEffect(() => {
    const list = async () => {
      try {
        // Prompt for permission so device labels are readable
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      } catch {}
      try {
        const all = await navigator.mediaDevices.enumerateDevices()
        setCameras(all.filter((d) => d.kind === 'videoinput'))
        setMics(all.filter((d) => d.kind === 'audioinput'))
      } catch (e) {
        console.error('enumerateDevices failed', e)
      }
    }
    list()
    const handleChange = () => list()
    navigator.mediaDevices.addEventListener?.('devicechange', handleChange)
    return () => navigator.mediaDevices.removeEventListener?.('devicechange', handleChange)
  }, [])

  const startMedia = async (constraints) => {
    try {
      setStatus('Starting devices…')
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
      setStatus('Live (mock)')
      setError(null)
    } catch (e) {
      console.error(e)
      setError(e?.message || String(e))
      setStatus('Error')
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
      if (!streamRef.current) await startMedia()
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = true))
    } else {
      setCamOn(false)
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = false))
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
        const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        screenStreamRef.current = display
        if (screenRef.current) {
          screenRef.current.srcObject = display
          await screenRef.current.play().catch(() => {})
        }
        setScreenOn(true)
        display.getVideoTracks()[0]?.addEventListener('ended', () => {
          setScreenOn(false)
          if (screenRef.current) screenRef.current.srcObject = null
          screenStreamRef.current?.getTracks().forEach((t) => t.stop())
          screenStreamRef.current = null
        })
      } catch (e) {
        setError(e?.message || String(e))
      }
    } else {
      setScreenOn(false)
      if (screenRef.current) screenRef.current.srcObject = null
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }
  }

  useEffect(() => {
    startMedia()
    return () => {
      stopMedia()
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectCam = async (id) => {
    setCameraId(id)
    try {
      const current = streamRef.current
      const hasAudio = !!current?.getAudioTracks()?.[0]
      current?.getTracks().forEach((t) => t.stop())
      await startMedia({
        video: { deviceId: { exact: id } },
        audio: hasAudio ? true : (micId ? { deviceId: { exact: micId } } : true),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectMic = async (id) => {
    setMicId(id)
    try {
      const newAudio = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: id } } })
      const aTrack = newAudio.getAudioTracks()[0]
      const current = streamRef.current
      if (current) {
        current.getAudioTracks().forEach((t) => t.stop())
        current.addTrack(aTrack)
        if (videoRef.current) videoRef.current.srcObject = current
      } else {
        await startMedia()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fmtTime = (s) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  }

  return (
    <div className="max-w-6xl mx-auto my-6 p-4 md:p-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Live with Mitra (Mock)</h2>
          <p className="text-xs text-slate-500">Local-only. No server or Gemini calls.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded ${status === 'Live (mock)' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{status}</span>
          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700">{fmtTime(seconds)}</span>
        </div>
      </div>

      {error && <div className="p-2 mb-3 text-sm rounded border border-rose-200 bg-rose-50 text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-black/70 rounded-xl overflow-hidden relative">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            {!camOn && (
              <div className="absolute inset-0 grid place-items-center bg-black/60">
                <div className="text-center text-zinc-200">
                  <div className="text-3xl mb-1">📷</div>
                  <div className="text-xs">Camera off</div>
                </div>
              </div>
            )}
          </div>

          <div className="aspect-video bg-black/50 rounded-xl overflow-hidden relative">
            <video ref={screenRef} className="w-full h-full object-contain" playsInline autoPlay />
            {!screenOn && (
              <div className="absolute inset-0 grid place-items-center text-zinc-400">
                <div className="text-center">
                  <div className="text-3xl mb-1">🖥️</div>
                  <div className="text-xs">Screen share not active</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs text-slate-500">Devices</div>
            <label className="block text-xs text-slate-500">Camera</label>
            <select className="w-full bg-white border border-slate-200 rounded px-2 py-1" value={cameraId} onChange={(e)=>handleSelectCam(e.target.value)}>
              <option value="">Default</option>
              {cameras.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,6)}`}</option>
              ))}
            </select>

            <label className="block text-xs text-slate-500 mt-2">Microphone</label>
            <select className="w-full bg-white border border-slate-200 rounded px-2 py-1" value={micId} onChange={(e)=>handleSelectMic(e.target.value)}>
              <option value="">Default</option>
              {mics.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0,6)}`}</option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2">
            <button onClick={toggleMic} className={`px-3 py-2 rounded text-sm ${micOn ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>{micOn ? 'Mic On' : 'Mic Off'}</button>
            <button onClick={toggleCamera} className={`px-3 py-2 rounded text-sm ${camOn ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>{camOn ? 'Camera On' : 'Camera Off'}</button>
            <button onClick={toggleScreen} className={`px-3 py-2 rounded text-sm ${screenOn ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>{screenOn ? 'Stop Share' : 'Share Screen'}</button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            This is a mock interface. Camera/mic/screen share run locally in your browser. No backend or Gemini Live calls are made.
          </div>
        </aside>
      </div>
    </div>
  )
}
