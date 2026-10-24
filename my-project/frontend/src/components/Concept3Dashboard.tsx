import React from 'react'
import {
  UserCheck,
  Bot,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react'
import { LiveVoiceRecordingPanel } from './LiveVoiceRecordingPanel'
import { UploadRecordingPanel } from './UploadRecordingPanel'
import { RecentActivityTable } from './RecentActivityTable'
import { AudioPreviewSignalPanel } from './AudioPreviewSignalPanel'
import type { ActivityRecord, AnalysisResult, AudioMetadata } from '../types'

interface Concept3DashboardProps {
  currentAssessment: AnalysisResult
  currentAudioMeta: AudioMetadata
  currentAudioUrl: string | null
  currentAudioLabel: string
  activityRecords: ActivityRecord[]
  isAnalyzing: boolean
  activeCaseId: string
  onPerformAnalysis: (fileOrBlob: Blob, filename: string, sourceLabel: string) => void
  onSelectRecord: (record: ActivityRecord) => void
  onOpenDeepEvidence: () => void
  onViewArchive: () => void
}

export const Concept3Dashboard: React.FC<Concept3DashboardProps> = ({
  currentAssessment,
  currentAudioMeta,
  currentAudioUrl,
  currentAudioLabel,
  activityRecords,
  isAnalyzing,
  activeCaseId,
  onPerformAnalysis,
  onSelectRecord,
  onOpenDeepEvidence,
  onViewArchive,
}) => {
  const isHighRisk = currentAssessment.scam_risk === 'High'
  const isMediumRisk = currentAssessment.scam_risk === 'Medium'

  const scamBadgeClasses = isHighRisk
    ? 'bg-[#FCE8E8] text-[#B94D4D] border-[#B94D4D]/20'
    : isMediumRisk
    ? 'bg-[#FDF5E6] text-[#C58A36] border-[#C58A36]/20'
    : 'bg-[#E8EEE3] text-[#36563B] border-[#36563B]/20'

  const authPercentage = currentAssessment.human_voice_prob

  return (
    <div className="space-y-6">
      {/* Row 1: Two panels - Live Recording (~58%) & Upload Recording (~42%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7">
          <LiveVoiceRecordingPanel
            onAnalyzeAudio={onPerformAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div className="lg:col-span-5">
          <UploadRecordingPanel
            onAnalyzeAudio={onPerformAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>

      {/* Row 2: Focused Results Layout (Concept 3 Core Feature!) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Wide "Analysis Results" Card with prominent Authentication Rate bar (~68% = 8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-6 shadow-2xs">
          <div>
            {/* Header with Case ID and Confidence */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2F0E8] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-[#36563B]" />
                <h2 className="text-base font-bold text-[#18243A]">Analysis Results</h2>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-[#687386]">
                  Confidence: <span className="font-bold text-[#18243A]">{currentAssessment.confidence_str}</span>
                </span>
                <span className="text-[#687386]">
                  Case ID: <span className="font-bold text-[#18243A]">{activeCaseId}</span>
                </span>
              </div>
            </div>

            {/* Prominent Authentication Rate Progress Bar Section (Section 9) */}
            <div className="mt-5 rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18243A]">
                    Authentication Rate
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#687386]">
                    Aggregate voice authenticity score across evaluated audio window
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#36563B]">
                    {authPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Horizontal Progress Bar */}
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#E6E5DF]">
                <div
                  className="h-full rounded-full bg-[#6F895C] transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, authPercentage))}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#687386]">
                <span>0% (Synthetic)</span>
                <span>Calibrated Threshold: 85.0%</span>
                <span>100% (Bonafide Human)</span>
              </div>
            </div>

            {/* 3 Sub-Cards: Human Voice, AI-Generated Voice, Scam Risk */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Card 1: Human Voice */}
              <div
                onClick={onOpenDeepEvidence}
                className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-4 hover:border-[#6F895C] transition cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-full bg-[#E8EEE3] text-[#36563B]">
                      <UserCheck size={14} />
                    </div>
                    <ExternalLink size={12} className="text-[#687386] opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="mt-2.5 text-[11px] font-medium text-[#687386]">Human Voice</p>
                  <p className="mt-0.5 text-xl font-bold tracking-tight text-[#18243A]">
                    {currentAssessment.human_voice_str}
                  </p>
                </div>

                <p className="mt-2 text-[10px] leading-tight text-[#687386]">
                  High likelihood of a real human voice
                </p>
              </div>

              {/* Card 2: AI-Generated Voice */}
              <div
                onClick={onOpenDeepEvidence}
                className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-4 hover:border-[#B94D4D] transition cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-full bg-[#FCE8E8] text-[#B94D4D]">
                      <Bot size={14} />
                    </div>
                    <ExternalLink size={12} className="text-[#687386] opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="mt-2.5 text-[11px] font-medium text-[#687386]">AI-Generated Voice</p>
                  <p className="mt-0.5 text-xl font-bold tracking-tight text-[#18243A]">
                    {currentAssessment.ai_generated_str}
                  </p>
                </div>

                <p className="mt-2 text-[10px] leading-tight text-[#687386]">
                  Low likelihood (not AI-generated)
                </p>
              </div>

              {/* Card 3: Scam Risk */}
              <div
                onClick={onOpenDeepEvidence}
                className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-4 hover:border-[#C58A36] transition cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full ${
                        isHighRisk
                          ? 'bg-[#FCE8E8] text-[#B94D4D]'
                          : isMediumRisk
                          ? 'bg-[#FDF5E6] text-[#C58A36]'
                          : 'bg-[#E8EEE3] text-[#36563B]'
                      }`}
                    >
                      <ShieldAlert size={14} />
                    </div>
                    <ExternalLink size={12} className="text-[#687386] opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="mt-2.5 text-[11px] font-medium text-[#687386]">Scam Risk</p>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${scamBadgeClasses}`}
                    >
                      {currentAssessment.scam_risk}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-[10px] leading-tight text-[#687386]">
                  {currentAssessment.scam_risk === 'Low'
                    ? 'No significant indicators of a voice scam detected.'
                    : `${currentAssessment.scam_indicators.length} indicators flagged`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#F2F0E8] pt-3 text-[11px]">
            <span className="text-[#687386]">Model: VoiceShield {currentAssessment.model_version || 'v1.0'}</span>
            <button
              onClick={onOpenDeepEvidence}
              className="font-medium text-[#719EC5] hover:underline"
            >
              View Full Model Evidence &amp; Biomarkers →
            </button>
          </div>
        </div>

        {/* Right: "Audio Details" Card (~32% = 4 cols) */}
        <div className="lg:col-span-4">
          <AudioPreviewSignalPanel
            metadata={currentAudioMeta}
            audioUrl={currentAudioUrl}
            label={currentAudioLabel}
          />
        </div>
      </div>

      {/* Row 3: Full-Width Recent Activity Table */}
      <div>
        <RecentActivityTable
          records={activityRecords}
          onSelectRecord={onSelectRecord}
          onViewArchive={onViewArchive}
        />
      </div>
    </div>
  )
}
