import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import type { AudioMetadata } from '../types'

interface AudioPreviewSignalPanelProps {
  metadata: AudioMetadata
  audioBlob?: Blob | null
  audioUrl?: string | null
  label?: string
}

export const AudioPreviewSignalPanel: React.FC<AudioPreviewSignalPanelProps> = ({
  metadata,
  audioBlob,
  audioUrl,
  label = 'Current Evaluation Stream',
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const [waveHeights] = useState(() =>
    [24, 38, 52, 45, 68, 80, 58, 72, 90, 84, 65, 48, 56, 74, 88, 92, 70, 55, 62, 78, 85, 68, 54, 42, 60, 75, 82, 64, 50, 36, 48, 62, 74, 58, 44, 32, 45, 58, 40, 28]
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animRef = useRef<any>(null)

  useEffect(() => {
    // If audioUrl provided
    if (audioUrl) {
      if (audioRef.current) audioRef.current.pause()
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setPlaybackProgress(0)
      }
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          setPlaybackProgress(audioRef.current.currentTime / audioRef.current.duration)
        }
      }
    }
    return () => {
      if (audioRef.current) audioRef.current.pause()
      if (animRef.current) clearInterval(animRef.current)
    }
  }, [audioUrl, audioBlob])

  const togglePlayback = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setPlaybackProgress(0)
      }
    }

    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(() => {
          simulatePlayback()
        })
        setIsPlaying(true)
      }
    } else {
      simulatePlayback()
    }
  }

  const simulatePlayback = () => {
    if (isPlaying) {
      clearInterval(animRef.current)
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)
    const startTime = Date.now()
    const simDuration = (metadata.duration_sec || 4.5) * 1000

    animRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / simDuration
      if (progress >= 1) {
        clearInterval(animRef.current)
        setIsPlaying(false)
        setPlaybackProgress(0)
      } else {
        setPlaybackProgress(progress)
      }
    }, 50)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.min(1, Math.max(0, clickX / rect.width))
    setPlaybackProgress(newProgress)
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration
    }
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#18243A]">Audio Preview &amp; Signal Info</h2>
          <span className="text-[11px] text-[#687386] truncate max-w-[160px]">{label}</span>
        </div>

        {/* Muted Blue Waveform Area */}
        <div className="mt-4 rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-4">
          <div
            onClick={handleSeek}
            className="relative flex h-14 w-full items-center justify-between gap-1 cursor-pointer"
            title="Click to seek"
          >
            {waveHeights.map((h, i) => {
              const barProgress = i / waveHeights.length
              const isPassed = barProgress <= playbackProgress
              return (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${h}%`,
                    backgroundColor: isPassed ? '#36563B' : '#719EC5',
                    opacity: isPassed ? 1 : 0.65,
                  }}
                />
              )
            })}

            {/* Playhead indicator */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-[#18243A]"
              style={{ left: `${playbackProgress * 100}%` }}
            />
          </div>

          {/* Player controls */}
          <div className="mt-3 flex items-center justify-between border-t border-[#E6E5DF] pt-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayback}
                className="flex size-7 items-center justify-center rounded-full bg-[#36563B] text-white hover:bg-[#2c4730] transition shadow-2xs"
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </button>
              <span className="font-mono text-xs font-semibold text-[#18243A]">
                {metadata.duration_str || '00:04:28'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#687386]">
              <Volume2 size={13} />
              <span>Calibrated SNR</span>
            </div>
          </div>
        </div>

        {/* 4-column signal info grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#F2F0E8] pt-4">
          <div>
            <p className="text-[10px] uppercase font-semibold text-[#687386] tracking-wider">
              Sample rate
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-[#18243A]">
              {metadata.sample_rate_str || '16.0 kHz'}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-[#687386] tracking-wider">
              Bit depth
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-[#18243A]">
              {metadata.bit_depth_str || '24-bit PCM'}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-[#687386] tracking-wider">
              Signal / Noise
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-[#18243A]">
              {metadata.snr_str || '38.4 dB'}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-semibold text-[#687386] tracking-wider">
              Duration
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-[#18243A]">
              {metadata.duration_str || '00:04:28'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
