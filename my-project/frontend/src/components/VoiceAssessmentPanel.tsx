import React from 'react'
import {
  UserCheck,
  Bot,
  ShieldAlert,
  Plus,
  ExternalLink,
} from 'lucide-react'
import type { AnalysisResult } from '../types'

interface VoiceAssessmentPanelProps {
  assessment: AnalysisResult
  onOpenDeepEvidence: () => void
}

export const VoiceAssessmentPanel: React.FC<VoiceAssessmentPanelProps> = ({
  assessment,
  onOpenDeepEvidence,
}) => {
  const isHighRisk = assessment.scam_risk === 'High'
  const isMediumRisk = assessment.scam_risk === 'Medium'

  const scamBadgeClasses = isHighRisk
    ? 'bg-[#FCE8E8] text-[#B94D4D] border-[#B94D4D]/20'
    : isMediumRisk
    ? 'bg-[#FDF5E6] text-[#C58A36] border-[#C58A36]/20'
    : 'bg-[#E8EEE3] text-[#36563B] border-[#36563B]/20'

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-sm bg-[#E8EEE3] text-[#36563B]">
              <Plus size={12} strokeWidth={2.5} />
            </span>
            <h2 className="text-sm font-bold text-[#18243A]">Voice Assessment</h2>
          </div>
          <span className="font-mono text-[11px] text-[#687386]">
            Model: {assessment.active_model || `VoiceShield ${assessment.model_version || 'v2.0'}`}
            {assessment.device && (
              <span className="ml-1.5 rounded bg-[#E6E5DF] px-1 py-0.5 text-[9px] font-semibold uppercase text-[#18243A]">
                {assessment.device}
              </span>
            )}
          </span>
        </div>

        {/* 3 Cards Side by Side on Desktop */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Card A: Human Voice */}
          <div
            onClick={onOpenDeepEvidence}
            className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-3.5 hover:border-[#6F895C] transition cursor-pointer group"
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
                {assessment.human_voice_str}
              </p>
            </div>

            <div className="mt-3">
              {/* Horizontal Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E6E5DF]">
                <div
                  className="h-full rounded-full bg-[#6F895C] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, assessment.human_voice_prob))}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] leading-tight text-[#687386]">
                {assessment.human_voice_prob >= 70
                  ? 'High likelihood of a real human voice'
                  : 'Low confidence in natural vocal tract'}
              </p>
            </div>
          </div>

          {/* Card B: AI-Generated Voice */}
          <div
            onClick={onOpenDeepEvidence}
            className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-3.5 hover:border-[#B94D4D] transition cursor-pointer group"
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
                {assessment.ai_generated_str}
              </p>
            </div>

            <div className="mt-3">
              {/* Horizontal Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E6E5DF]">
                <div
                  className="h-full rounded-full bg-[#B94D4D] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, assessment.ai_generated_prob))}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] leading-tight text-[#687386]">
                {assessment.ai_generated_prob > 50
                  ? 'High likelihood of cloned / synthetic voice'
                  : 'Low likelihood (not AI-generated)'}
              </p>
            </div>
          </div>

          {/* Card C: Scam Risk */}
          <div
            onClick={onOpenDeepEvidence}
            className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FAF9F5] p-3.5 hover:border-[#C58A36] transition cursor-pointer group"
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
                  {assessment.scam_risk}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[10px] leading-tight text-[#687386]">
                {assessment.scam_risk === 'Low'
                  ? 'No significant indicators of a voice scam detected.'
                  : `${assessment.scam_indicators.length} indicators flagged (Urgency / Demands)`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail trigger footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#F2F0E8] pt-2.5 text-[11px]">
        <span className="text-[#687386]">Click cards to view spectral evidence &amp; biomarkers</span>
        <button
          onClick={onOpenDeepEvidence}
          className="font-medium text-[#719EC5] hover:underline"
        >
          View Model Evidence →
        </button>
      </div>
    </div>
  )
}
