import React, { useState, useRef, useEffect } from 'react'
import {
  Mic,
  Square,
  Pause,
  Play,
  Trash2,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

interface LiveVoiceRecordingPanelProps {
  onAnalyzeAudio: (blob: Blob, filename: string, sourceLabel: string) => void
  isAnalyzing: boolean
}

export const LiveVoiceRecordingPanel: React.FC<LiveVoiceRecordingPanelProps> = ({
  onAnalyzeAudio,
  isAnalyzing,
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle')
  const [elapsedSec, setElapsedSec] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 20, 45, 60, 30, 22, 50, 65, 40, 30, 20, 15, 35, 55, 40, 25, 18, 30, 50, 42, 60, 70, 45, 30, 20, 25, 40, 50, 35, 20, 15])
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<any>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // Enumerate microphones
  useEffect(() => {
    async function getDevices() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const audioInputs = devices.filter((d) => d.kind === 'audioinput')
          setAvailableDevices(audioInputs)
          if (audioInputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(audioInputs[0].deviceId)
          }
        }
      } catch (err) {
        console.warn('Cannot enumerate audio devices:', err)
      }
    }
    getDevices()
  }, [])

  // Timer counter
  useEffect(() => {
    if (recordingState === 'recording') {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          if (prev >= 30) {
            handleStopRecording()
            return 30
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [recordingState])

  // Real Web Audio analyser loop
  const updateWaveformLoop = () => {
    if (analyserRef.current && recordingState === 'recording') {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)

      // Downsample to 32 visual bars
      const barCount = 32
      const step = Math.floor(dataArray.length / barCount)
      const newLevels: number[] = []
      for (let i = 0; i < barCount; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j]
        }
        const avg = sum / step
        // Scale to 12% to 95%
        const normalized = Math.min(95, Math.max(12, Math.floor((avg / 255) * 100)))
        newLevels.push(normalized)
      }
      setAudioLevels(newLevels)
      animFrameRef.current = requestAnimationFrame(updateWaveformLoop)
    }
  }

  // Start recording
  const handleStartRecording = async () => {
    audioChunksRef.current = []
    setElapsedSec(0)
    setAudioUrl(null)
    setRecordedBlob(null)

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        setRecordedBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      mediaRecorder.start(250) // 250ms chunks
      setRecordingState('recording')
      animFrameRef.current = requestAnimationFrame(updateWaveformLoop)
    } catch (err) {
      console.warn('Microphone access unavailable or denied. Starting fallback simulator:', err)
      // Fallback: simulated microphone recording with synthetic sine tones
      startSimulatedRecording()
    }
  }

  // Simulated recording if mic permission denied
  const startSimulatedRecording = () => {
    setRecordingState('recording')
    const simInterval = setInterval(() => {
      const simBars = Array.from({ length: 32 }, () => Math.floor(Math.random() * 60) + 20)
      setAudioLevels(simBars)
    }, 100)

    // Store interval to clear upon stop
    ;(streamRef.current as any) = { simInterval }
  }

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
    } else if (recordingState === 'recording') {
      setRecordingState('paused')
    }
  }

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
      animFrameRef.current = requestAnimationFrame(updateWaveformLoop)
    } else if (recordingState === 'paused') {
      setRecordingState('recording')
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      if ((streamRef.current as any).simInterval) {
        clearInterval((streamRef.current as any).simInterval)
        // create a synthetic audio blob
        const dummyBlob = createSyntheticWavBlob()
        setRecordedBlob(dummyBlob)
        setAudioUrl(URL.createObjectURL(dummyBlob))
      }
      streamRef.current.getTracks?.().forEach((track) => track.stop())
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioContextRef.current) audioContextRef.current.close()

    setRecordingState('stopped')
  }

  const handleDiscard = () => {
    if (recordingState === 'recording' || recordingState === 'paused') {
      handleStopRecording()
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setRecordingState('idle')
    setElapsedSec(0)
    setAudioUrl(null)
    setRecordedBlob(null)
    setIsPlayingPreview(false)
    setAudioLevels([15, 25, 20, 45, 60, 30, 22, 50, 65, 40, 30, 20, 15, 35, 55, 40, 25, 18, 30, 50, 42, 60, 70, 45, 30, 20, 25, 40, 50, 35, 20, 15])
  }

  const handleAnalyze = () => {
    if (!recordedBlob) return
    onAnalyzeAudio(recordedBlob, `live_rec_${Date.now()}.wav`, 'mic-04 / WebRTC')
  }

  const togglePreviewPlay = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl)
      audioElementRef.current.onended = () => setIsPlayingPreview(false)
    }
    if (audioElementRef.current) {
      if (isPlayingPreview) {
        audioElementRef.current.pause()
        setIsPlayingPreview(false)
      } else {
        audioElementRef.current.play()
        setIsPlayingPreview(true)
      }
    }
  }

  // Create simple 1s synthetic sine WAV for fallback demo
  const createSyntheticWavBlob = (): Blob => {
    const sampleRate = 16000
    const duration = Math.max(1, elapsedSec)
    const numSamples = sampleRate * duration
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    // RIFF identifier
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + numSamples * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true) // PCM
    view.setUint16(22, 1, true) // Mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, numSamples * 2, true)

    // 440Hz Sine tone
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const s = Math.sin(2 * Math.PI * 220 * t) * 0.4
      view.setInt16(44 + i * 2, s * 0x7fff, true)
    }

    return new Blob([view], { type: 'audio/wav' })
  }

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Panel Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-[#36563B]" />
            <h2 className="text-sm font-bold text-[#18243A]">Live Voice Recording</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Microphone Selector */}
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                disabled={recordingState === 'recording'}
                className="appearance-none rounded-md border border-[#E6E5DF] bg-[#FAF9F5] py-1 pl-2.5 pr-7 text-xs text-[#18243A] hover:border-[#D0CEBF] focus:outline-none focus:border-[#36563B] cursor-pointer"
              >
                <option value="">Microphone (WebRTC)</option>
                {availableDevices.map((dev, i) => (
                  <option key={dev.deviceId || i} value={dev.deviceId}>
                    {dev.label ? dev.label.slice(0, 22) : `Mic ${i + 1}`}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2 top-2.5 text-[#687386]"
              />
            </div>

            {/* Online badge */}
            <span className="inline-flex items-center rounded-full bg-[#E8EEE3] px-2 py-0.5 text-[10px] font-semibold text-[#36563B]">
              Online
            </span>
          </div>
        </div>

        <p className="mt-1 text-[11px] text-[#687386]">
          WebRTC ingress / microphone channel 04
        </p>

        {/* Waveform and Mic Visual Area */}
        <div className="mt-5 flex items-center gap-4">
          {/* Circular Microphone Graphic */}
          <div
            className={`relative flex size-14 shrink-0 items-center justify-center rounded-full border transition-all ${
              recordingState === 'recording'
                ? 'border-[#B94D4D] bg-[#FCE8E8] text-[#B94D4D] ring-4 ring-[#B94D4D]/20 animate-pulse'
                : 'border-[#D5DFCE] bg-[#E8EEE3] text-[#36563B]'
            }`}
          >
            <Mic size={24} strokeWidth={2.2} />
          </div>

          {/* Horizontal Waveform Bars */}
          <div className="flex h-12 flex-1 items-center justify-between gap-1 overflow-hidden px-1">
            {audioLevels.map((lvl, index) => (
              <div
                key={index}
                className="w-1 rounded-full bg-[#6F895C] waveform-bar"
                style={{
                  height: `${lvl}%`,
                  opacity: recordingState === 'recording' ? 0.9 : 0.45,
                }}
              />
            ))}
          </div>
        </div>

        {/* Timer and Audio-level Indicator */}
        <div className="mt-4 flex items-center justify-between border-t border-[#F2F0E8] pt-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#18243A]">
              {formatTime(elapsedSec)} / 00:30
            </span>
            {recordingState === 'recording' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B94D4D]">
                <span className="size-1.5 rounded-full bg-[#B94D4D] animate-ping" /> REC
              </span>
            )}
            {recordingState === 'paused' && (
              <span className="text-[11px] font-semibold text-[#C58A36]">PAUSED</span>
            )}
          </div>

          {/* 4 Green Signal Level Bars */}
          <div className="flex items-end gap-1" title="Signal Strength">
            <span
              className={`w-1 rounded-xs bg-[#36563B] ${
                recordingState === 'recording' ? 'h-2' : 'h-1.5 opacity-40'
              }`}
            />
            <span
              className={`w-1 rounded-xs bg-[#36563B] ${
                recordingState === 'recording' ? 'h-3' : 'h-2.5 opacity-40'
              }`}
            />
            <span
              className={`w-1 rounded-xs bg-[#36563B] ${
                recordingState === 'recording' ? 'h-4' : 'h-3.5 opacity-40'
              }`}
            />
            <span
              className={`w-1 rounded-xs bg-[#36563B] ${
                recordingState === 'recording' ? 'h-5' : 'h-4 opacity-40'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5">
        {recordingState === 'idle' && (
          <button
            onClick={handleStartRecording}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#36563B] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2c4730] transition cursor-pointer"
          >
            <span className="size-2 rounded-full bg-white" />
            Start Recording
          </button>
        )}

        {(recordingState === 'recording' || recordingState === 'paused') && (
          <div className="flex items-center gap-2">
            {recordingState === 'recording' ? (
              <button
                onClick={handlePauseRecording}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E5DF] bg-[#FAF9F5] py-2 text-xs font-medium text-[#18243A] hover:bg-[#F2F0E8] transition"
              >
                <Pause size={14} /> Pause
              </button>
            ) : (
              <button
                onClick={handleResumeRecording}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#36563B] bg-[#E8EEE3] py-2 text-xs font-semibold text-[#36563B] hover:bg-[#dce6d6] transition"
              >
                <Play size={14} /> Resume
              </button>
            )}

            <button
              onClick={handleStopRecording}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#B94D4D] py-2 text-xs font-semibold text-white hover:bg-[#a64343] transition"
            >
              <Square size={13} fill="currentColor" /> Stop
            </button>

            <button
              onClick={handleDiscard}
              className="flex size-9 items-center justify-center rounded-lg border border-[#E6E5DF] text-[#687386] hover:bg-[#F2F0E8] hover:text-[#B94D4D] transition"
              title="Discard recording"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}

        {recordingState === 'stopped' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePreviewPlay}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6E5DF] bg-[#FAF9F5] py-2 text-xs font-medium text-[#18243A] hover:bg-[#F2F0E8] transition"
              >
                {isPlayingPreview ? <Pause size={14} /> : <Play size={14} />}
                {isPlayingPreview ? 'Pause' : 'Play Preview'}
              </button>

              <button
                onClick={handleDiscard}
                className="flex size-9 items-center justify-center rounded-lg border border-[#E6E5DF] text-[#687386] hover:bg-[#F2F0E8] transition"
                title="Discard & Record Again"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#36563B] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2c4730] transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isAnalyzing ? 'Analyzing Clip...' : 'Analyze Recording'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
