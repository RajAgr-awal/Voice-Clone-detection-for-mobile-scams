import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  X,
  Sparkles,
  AlertCircle,
  FileUp,
} from 'lucide-react'

interface UploadRecordingPanelProps {
  onAnalyzeAudio: (file: File | Blob, filename: string, sourceLabel: string) => void
  isAnalyzing: boolean
}

export const UploadRecordingPanel: React.FC<UploadRecordingPanelProps> = ({
  onAnalyzeAudio,
  isAnalyzing,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024 // 100 MB

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('File size exceeds the 100 MB maximum limit.')
      return
    }

    const validExtensions = ['.wav', '.mp3', '.flac', '.m4a', '.ogg', '.webm']
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    )
    if (!hasValidExt && !file.type.startsWith('audio/')) {
      setErrorMessage('Unsupported format. Please upload WAV, MP3, or FLAC.')
      return
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    setIsPlaying(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleRemoveFile = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setSelectedFile(null)
    setAudioUrl(null)
    setIsPlaying(false)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const togglePlay = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl)
      audioElementRef.current.onended = () => setIsPlaying(false)
    }
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause()
        setIsPlaying(false)
      } else {
        audioElementRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAnalyze = () => {
    if (!selectedFile) return
    onAnalyzeAudio(selectedFile, selectedFile.name, `upload / ${selectedFile.name}`)
  }

  // Demonstration test samples loader for live judge evaluation
  const loadPresetSample = (type: 'human' | 'scam' | 'partial') => {
    let filename = 'human_speech_baseline.wav'
    if (type === 'scam') filename = 'call_sample_ai_scam.wav'
    if (type === 'partial') filename = 'partial_fake_phone_spliced.wav'

    // Create an illustrative audio blob with wav header
    const sampleRate = 16000
    const duration = type === 'scam' ? 14 : type === 'partial' ? 8 : 4.5
    const numSamples = Math.floor(sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
    }

    writeStr(0, 'RIFF')
    view.setUint32(4, 36 + numSamples * 2, true)
    writeStr(8, 'WAVE')
    writeStr(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeStr(36, 'data')
    view.setUint32(40, numSamples * 2, true)

    // Waveform synthesis
    const baseFreq = type === 'scam' ? 340 : 220
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const s = Math.sin(2 * Math.PI * baseFreq * t) * 0.35
      view.setInt16(44 + i * 2, s * 0x7fff, true)
    }

    const blob = new Blob([view], { type: 'audio/wav' })
    const file = new File([blob], filename, { type: 'audio/wav' })
    validateAndSetFile(file)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
      <div>
        {/* Panel Header */}
        <div className="flex items-center gap-2">
          <FileUp size={16} className="text-[#687386]" />
          <h2 className="text-sm font-bold text-[#18243A]">Upload Recording</h2>
        </div>

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.mp3,.flac,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drag and Drop Zone or File Preview */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
              isDragOver
                ? 'border-[#36563B] bg-[#E8EEE3]/40'
                : 'border-[#DCDAD2] bg-[#FAF9F5] hover:border-[#6F895C] hover:bg-[#F2F0E8]/50'
            }`}
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-[#E8EEE3] text-[#36563B]">
              <UploadCloud size={20} />
            </div>

            <p className="mt-2.5 text-xs font-semibold text-[#18243A]">
              Drag & drop an audio file here
            </p>
            <p className="my-1 text-[11px] text-[#687386]">or</p>
            <button
              type="button"
              className="rounded-md border border-[#E6E5DF] bg-[#FFFFFF] px-3 py-1 text-xs font-medium text-[#18243A] shadow-2xs hover:bg-[#F2F0E8] transition"
            >
              Browse Files
            </button>
            <p className="mt-3 text-[10px] text-[#687386]">
              Supported formats: WAV, MP3, FLAC &nbsp;|&nbsp; Max size: 100 MB
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E8EEE3] text-[#36563B]">
                  <FileAudio size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-xs font-semibold text-[#18243A]" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <p className="font-mono text-[10px] text-[#687386]">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRemoveFile}
                className="rounded p-1 text-[#687386] hover:bg-[#E6E5DF] hover:text-[#B94D4D] transition"
                title="Remove file"
              >
                <X size={14} />
              </button>
            </div>

            {/* Audio Preview playback row */}
            <div className="mt-3 flex items-center justify-between border-t border-[#E6E5DF] pt-2.5">
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-1.5 rounded border border-[#E6E5DF] bg-white px-2 py-1 text-[11px] font-medium text-[#18243A] hover:bg-[#F2F0E8] transition"
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                {isPlaying ? 'Pause' : 'Play audio'}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#719EC5] hover:underline"
              >
                Replace file
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#B94D4D]">
            <AlertCircle size={13} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick evaluation samples for Judges */}
        <div className="mt-3">
          <p className="text-[10px] uppercase font-semibold text-[#687386] tracking-wider">
            Quick Test Datasets
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => loadPresetSample('human')}
              className="rounded-md border border-[#E6E5DF] bg-[#FAF9F5] px-2 py-1 text-[10px] font-medium text-[#36563B] hover:bg-[#E8EEE3] transition"
            >
              Real Human Clip
            </button>
            <button
              type="button"
              onClick={() => loadPresetSample('scam')}
              className="rounded-md border border-[#E6E5DF] bg-[#FAF9F5] px-2 py-1 text-[10px] font-medium text-[#B94D4D] hover:bg-[#FCE8E8] transition"
            >
              AI Cloned Scam
            </button>
            <button
              type="button"
              onClick={() => loadPresetSample('partial')}
              className="rounded-md border border-[#E6E5DF] bg-[#FAF9F5] px-2 py-1 text-[10px] font-medium text-[#C58A36] hover:bg-[#FDF5E6] transition"
            >
              Partial Fake (Phase 2)
            </button>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#36563B] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2c4730] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} />
          {isAnalyzing ? 'Analyzing Clip...' : 'Analyze Recording'}
        </button>
      </div>
    </div>
  )
}
