import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import type { PageId } from './components/Sidebar'
import { Header } from './components/Header'
import type { ConceptId } from './components/Header'
import { MetricCards } from './components/MetricCards'
import { LiveVoiceRecordingPanel } from './components/LiveVoiceRecordingPanel'
import { UploadRecordingPanel } from './components/UploadRecordingPanel'
import { VoiceAssessmentPanel } from './components/VoiceAssessmentPanel'
import { RecentActivityTable } from './components/RecentActivityTable'
import { AudioPreviewSignalPanel } from './components/AudioPreviewSignalPanel'
import { ForensicDetailModal } from './components/ForensicDetailModal'
import { LiveAnalysisView } from './components/LiveAnalysisView'
import { CaseArchiveView } from './components/CaseArchiveView'
import { BenchmarksView } from './components/BenchmarksView'
import { Concept3Dashboard } from './components/Concept3Dashboard'

import type {
  ActivityRecord,
  AnalysisResult,
  AudioMetadata,
  BenchmarkMetrics,
  CaseItem,
  NotificationItem,
} from './types'
import {
  analyzeAudio,
  checkBackendHealth,
  fetchActivity,
  fetchBenchmarks,
  fetchCases,
  fetchNotifications,
} from './services/api'

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview')
  const [selectedConcept, setSelectedConcept] = useState<ConceptId>('concept-3') // Concept 3 as requested!
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [isLive, setIsLive] = useState(true)

  // Cases and active case
  const [cases, setCases] = useState<CaseItem[]>([])
  const [activeCaseId, setActiveCaseId] = useState<string>('HACK-26 / VOICE-001')

  // Top Metrics
  const [authRate] = useState(96.8)
  const [avgLatency] = useState(184)
  const [spoofCount, setSpoofCount] = useState(12)
  const [streamsCount, setStreamsCount] = useState(1284)

  // Recent Activity Records
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([])

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  // Benchmarks
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<BenchmarkMetrics | null>(null)

  // Current Active Voice Assessment
  const [currentAssessment, setCurrentAssessment] = useState<AnalysisResult>({
    verdict: 'Human',
    confidence: 96.8,
    confidence_str: '96.8%',
    human_voice_prob: 96.8,
    human_voice_str: '96.8%',
    ai_generated_prob: 3.2,
    ai_generated_str: '3.2%',
    scam_risk: 'Low',
    scam_score: 12,
    scam_indicators: [],
    transcript:
      'Hello, thank you for reaching back to confirm our scheduled appointment for tomorrow afternoon. I have attached the project notes and will see you at two.',
    inference_time_ms: 184,
    inference_time_str: '184 ms',
    audio_metadata: {
      sample_rate: 16000,
      sample_rate_str: '16.0 kHz',
      bit_depth: 24,
      bit_depth_str: '24-bit PCM',
      channels: 1,
      duration_sec: 268,
      duration_str: '00:04:28',
      snr_db: 38.4,
      snr_str: '38.4 dB',
      format: 'WAV',
    },
    acoustic_biomarkers: {
      phase_coherence: 'Natural human vocal tract response',
      pitch_jitter: '0.84% (Natural physiological variation)',
      shimmer_apq: '1.92% (Natural breathiness)',
      spectral_flux: 'Organic harmonic distribution to 15.8 kHz',
      temporal_continuity: 'Consistent glottal pulse train',
    },
    temporal_segments: [
      { index: 0, start: 0, end: 0.5, is_synthetic: false, spoof_score: 0.02, confidence: 98.0 },
      { index: 1, start: 0.5, end: 1.0, is_synthetic: false, spoof_score: 0.03, confidence: 97.0 },
      { index: 2, start: 1.0, end: 1.5, is_synthetic: false, spoof_score: 0.03, confidence: 97.0 },
      { index: 3, start: 1.5, end: 2.0, is_synthetic: false, spoof_score: 0.04, confidence: 96.0 },
    ],
    model_version: 'v1.0',
    model_id: 'VS-ENS-2026-P2',
    evaluated_resolution_sec: 0.5,
    case_id: 'HACK-26 / VOICE-001',
    source: 'mic-04 / WebRTC',
    timestamp: '14:32:08',
  })

  // Signal Info Panel Data
  const [currentAudioMeta, setCurrentAudioMeta] = useState<AudioMetadata>({
    sample_rate: 16000,
    sample_rate_str: '16.0 kHz',
    bit_depth: 24,
    bit_depth_str: '24-bit PCM',
    channels: 1,
    duration_sec: 268,
    duration_str: '00:04:28',
    snr_db: 38.4,
    snr_str: '38.4 dB',
    format: 'WAV',
  })

  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [currentAudioLabel, setCurrentAudioLabel] = useState<string>('mic-04 / WebRTC')

  // Analysis State & Modal
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<AnalysisResult | null>(null)

  // Initial load
  useEffect(() => {
    async function initData() {
      const health = await checkBackendHealth()
      setIsBackendOnline(health.online)

      const [cList, aList, nList, bData] = await Promise.all([
        fetchCases(),
        fetchActivity(),
        fetchNotifications(),
        fetchBenchmarks(),
      ])

      setCases(cList)
      setActivityRecords(aList)
      setNotifications(nList)
      setBenchmarkMetrics(bData)
    }
    initData()
  }, [])

  // Handle case creation
  const handleCreateCase = (id: string, name: string) => {
    const newCase: CaseItem = {
      id,
      name,
      opened_at: new Date().toISOString(),
      status: 'Active',
      streams_count: 0,
      spoofs_flagged: 0,
    }
    setCases((prev) => [newCase, ...prev])
    setActiveCaseId(id)
  }

  // Handle Audio Analysis from Recording Panel or Upload Panel
  const handlePerformAnalysis = async (
    fileOrBlob: Blob,
    filename: string,
    sourceLabel: string
  ) => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeAudio(fileOrBlob, filename, activeCaseId, sourceLabel)

      // Update current voice assessment
      setCurrentAssessment(result)

      // Update audio preview signal metadata
      setCurrentAudioMeta(result.audio_metadata)
      const objUrl = URL.createObjectURL(fileOrBlob)
      setCurrentAudioUrl(objUrl)
      setCurrentAudioLabel(sourceLabel)

      // Add to recent activity table
      const newRec: ActivityRecord = {
        id: `REC-${Date.now().toString().slice(-4)}`,
        time: result.timestamp || new Date().toTimeString().split(' ')[0],
        source: sourceLabel,
        case_id: activeCaseId,
        verdict: result.verdict as any,
        confidence: result.confidence_str,
        human_prob: result.human_voice_prob,
        ai_prob: result.ai_generated_prob,
        scam_risk: result.scam_risk as any,
        duration: result.audio_metadata.duration_str,
        sample_rate: result.audio_metadata.sample_rate_str,
        bit_depth: result.audio_metadata.bit_depth_str,
        snr: result.audio_metadata.snr_str,
      }
      setActivityRecords((prev) => [newRec, ...prev])

      // Update top metrics
      setStreamsCount((prev) => prev + 1)
      if (result.verdict === 'AI-Generated') {
        setSpoofCount((prev) => prev + 1)
        // Add danger notification
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: 'Synthetic Voice Flagged',
          description: `${sourceLabel} flagged as AI-generated with ${result.confidence_str} confidence.`,
          time: newRec.time,
          type: 'danger',
          read: false,
        }
        setNotifications((prev) => [newNotif, ...prev])
      }
    } catch (err) {
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle clicking a row in the activity table
  const handleSelectActivityRow = (row: ActivityRecord) => {
    // Generate an inspection result view from row
    const inspectionResult: AnalysisResult = {
      verdict: row.verdict,
      confidence: parseFloat(row.confidence),
      confidence_str: row.confidence,
      human_voice_prob: row.human_prob,
      human_voice_str: `${row.human_prob}%`,
      ai_generated_prob: row.ai_prob,
      ai_generated_str: `${row.ai_prob}%`,
      scam_risk: row.scam_risk,
      scam_score: row.scam_risk === 'High' ? 88 : 12,
      scam_indicators:
        row.scam_risk === 'High'
          ? [
              'Urgent funds / gift-card transfer demand',
              'Official authority impersonation',
              'High-pressure urgency tactics',
            ]
          : [],
      transcript:
        row.verdict === 'AI-Generated'
          ? 'This is the fraud prevention department. Your checking account has been locked due to suspicious wire attempts. You must verify your one-time PIN and wire backup funds immediately.'
          : 'Hello, thank you for reaching back to confirm our scheduled appointment for tomorrow afternoon.',
      inference_time_ms: 184,
      inference_time_str: '184 ms',
      audio_metadata: {
        sample_rate: parseFloat(row.sample_rate) * 1000 || 16000,
        sample_rate_str: row.sample_rate,
        bit_depth: 24,
        bit_depth_str: row.bit_depth,
        channels: 1,
        duration_sec: 14,
        duration_str: row.duration,
        snr_db: parseFloat(row.snr) || 38.4,
        snr_str: row.snr,
        format: 'WAV',
      },
      acoustic_biomarkers: {
        phase_coherence:
          row.verdict === 'AI-Generated'
            ? 'Distorted (Vocoder characteristic)'
            : 'Natural human vocal tract response',
        pitch_jitter:
          row.verdict === 'AI-Generated'
            ? '0.12% (Unnaturally flat / synthetic)'
            : '0.84% (Natural physiological variation)',
        shimmer_apq:
          row.verdict === 'AI-Generated'
            ? '0.38% (Sub-threshold micro-modulation)'
            : '1.92% (Natural breathiness)',
        spectral_flux:
          row.verdict === 'AI-Generated'
            ? 'Abrupt cutoff above 7.2 kHz'
            : 'Organic harmonic distribution to 15.8 kHz',
        temporal_continuity:
          row.verdict === 'AI-Generated'
            ? 'High segmental discontinuity'
            : 'Consistent glottal pulse train',
      },
      temporal_segments: Array.from({ length: 8 }).map((_, i) => ({
        index: i,
        start: i * 0.5,
        end: (i + 1) * 0.5,
        is_synthetic: row.verdict === 'AI-Generated' && i >= 2,
        spoof_score: row.verdict === 'AI-Generated' && i >= 2 ? 0.94 : 0.05,
        confidence: row.verdict === 'AI-Generated' && i >= 2 ? 94 : 96,
      })),
      model_version: 'v1.0',
      model_id: 'VS-ENS-2026-P2',
      evaluated_resolution_sec: 0.5,
      case_id: row.case_id,
      source: row.source,
      timestamp: row.time,
    }

    setSelectedRecordForModal(inspectionResult)
    // Also update preview panel
    setCurrentAudioMeta(inspectionResult.audio_metadata)
    setCurrentAudioLabel(row.source)
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#18243A]">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isBackendOnline={isBackendOnline}
        mobileOpen={mobileMenuOpen}
        onToggleMobile={() => setMobileMenuOpen((p) => !p)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-60">
        {/* Top Header */}
        <Header
          activeCaseId={activeCaseId}
          cases={cases}
          onSelectCase={setActiveCaseId}
          onCreateCase={handleCreateCase}
          notifications={notifications}
          onMarkAllNotificationsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          isLive={isLive}
          onToggleLive={() => setIsLive((p) => !p)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          selectedConcept={selectedConcept}
          onSelectConcept={setSelectedConcept}
        />

        {/* View Router */}
        <main className="p-6 lg:p-8 max-w-[1536px] mx-auto">
          {currentPage === 'overview' && (
            <>
              {selectedConcept === 'concept-3' ? (
                /* Concept 3: Focused Results Layout (Prominent Auth Rate bar, wide Analysis Results, and Audio Details) */
                <Concept3Dashboard
                  currentAssessment={currentAssessment}
                  currentAudioMeta={currentAudioMeta}
                  currentAudioUrl={currentAudioUrl}
                  currentAudioLabel={currentAudioLabel}
                  activityRecords={activityRecords}
                  isAnalyzing={isAnalyzing}
                  activeCaseId={activeCaseId}
                  onPerformAnalysis={handlePerformAnalysis}
                  onSelectRecord={handleSelectActivityRow}
                  onOpenDeepEvidence={() => setSelectedRecordForModal(currentAssessment)}
                  onViewArchive={() => setCurrentPage('case-archive')}
                />
              ) : (
                /* Concept 1: Card Layout */
                <div className="space-y-6">
                  {/* Row 1: Four Top Metric Cards */}
                  <MetricCards
                    authRate={authRate}
                    avgLatencyMs={avgLatency}
                    spoofAttempts={spoofCount}
                    streamsProcessed={streamsCount}
                    onCardClick={(key) => {
                      if (key === 'spoofs') setCurrentPage('case-archive')
                      if (key === 'latency') setCurrentPage('benchmarks')
                    }}
                  />

                  {/* Row 2: Middle Row - 3 Cards */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
                    {/* Panel 1: Live Voice Recording (~38% = 5 cols) */}
                    <div className="lg:col-span-5">
                      <LiveVoiceRecordingPanel
                        onAnalyzeAudio={handlePerformAnalysis}
                        isAnalyzing={isAnalyzing}
                      />
                    </div>

                    {/* Panel 2: Upload Recording (~25% = 3 cols) */}
                    <div className="lg:col-span-3">
                      <UploadRecordingPanel
                        onAnalyzeAudio={handlePerformAnalysis}
                        isAnalyzing={isAnalyzing}
                      />
                    </div>

                    {/* Panel 3: Voice Assessment (~37% = 4 cols) */}
                    <div className="lg:col-span-4">
                      <VoiceAssessmentPanel
                        assessment={currentAssessment}
                        onOpenDeepEvidence={() => setSelectedRecordForModal(currentAssessment)}
                      />
                    </div>
                  </div>

                  {/* Row 3: Bottom Row - 2 Panels */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
                    {/* Recent Analysis Activity (~60% = 7 cols) */}
                    <div className="lg:col-span-7">
                      <RecentActivityTable
                        records={activityRecords}
                        onSelectRecord={handleSelectActivityRow}
                        onViewArchive={() => setCurrentPage('case-archive')}
                      />
                    </div>

                    {/* Audio Preview & Signal Info (~40% = 5 cols) */}
                    <div className="lg:col-span-5">
                      <AudioPreviewSignalPanel
                        metadata={currentAudioMeta}
                        audioUrl={currentAudioUrl}
                        label={currentAudioLabel}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {currentPage === 'live-analysis' && (
            <LiveAnalysisView
              activeCaseId={activeCaseId}
              onSaveToArchive={(res) => {
                const newRec: ActivityRecord = {
                  id: `REC-${Date.now().toString().slice(-4)}`,
                  time: new Date().toTimeString().split(' ')[0],
                  source: 'mic-04 / WebRTC',
                  case_id: activeCaseId,
                  verdict: res.verdict as any,
                  confidence: res.confidence_str,
                  human_prob: res.human_voice_prob,
                  ai_prob: res.ai_generated_prob,
                  scam_risk: res.scam_risk as any,
                  duration: res.audio_metadata.duration_str,
                  sample_rate: res.audio_metadata.sample_rate_str,
                  bit_depth: res.audio_metadata.bit_depth_str,
                  snr: res.audio_metadata.snr_str,
                }
                setActivityRecords((p) => [newRec, ...p])
              }}
            />
          )}

          {currentPage === 'case-archive' && (
            <CaseArchiveView
              records={activityRecords}
              cases={cases}
              onSelectRecord={handleSelectActivityRow}
            />
          )}

          {currentPage === 'benchmarks' && benchmarkMetrics && (
            <BenchmarksView metrics={benchmarkMetrics} />
          )}
        </main>
      </div>

      {/* Forensic Deep Dive Modal */}
      <ForensicDetailModal
        result={selectedRecordForModal}
        onClose={() => setSelectedRecordForModal(null)}
      />
    </div>
  )
}
