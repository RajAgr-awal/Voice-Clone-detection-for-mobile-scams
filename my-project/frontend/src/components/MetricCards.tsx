import React from 'react'
import { Shield, Clock, AlertTriangle, Waves } from 'lucide-react'

interface MetricCardsProps {
  onCardClick?: (metricKey: string) => void
  authRate?: number
  avgLatencyMs?: number
  spoofAttempts?: number
  streamsProcessed?: number
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  onCardClick,
  authRate = 96.8,
  avgLatencyMs = 184,
  spoofAttempts = 12,
  streamsProcessed = 1284,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Authentication rate */}
      <div
        onClick={() => onCardClick?.('auth_rate')}
        className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs hover:border-[#D0CEBF] transition cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#E8EEE3] text-[#36563B]">
            <Shield size={18} strokeWidth={2.2} />
          </div>
          <span className="inline-flex items-center rounded-full bg-[#E8EEE3] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#36563B]">
            +2.4%
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-[#687386]">Authentication rate</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#18243A]">
            {authRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-[11px] text-[#687386]">vs. last 24h</p>
        </div>
      </div>

      {/* Card 2: Average inference time */}
      <div
        onClick={() => onCardClick?.('latency')}
        className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs hover:border-[#D0CEBF] transition cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#E8EEE3] text-[#36563B]">
            <Clock size={18} strokeWidth={2.2} />
          </div>
          <span className="inline-flex items-center rounded-full bg-[#E8EEE3] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#36563B]">
            −31 ms
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-[#687386]">Avg. inference time</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#18243A]">
            {avgLatencyMs} ms
          </p>
          <p className="mt-1 text-[11px] text-[#687386]">Target &lt; 250 ms</p>
        </div>
      </div>

      {/* Card 3: Spoof attempts */}
      <div
        onClick={() => onCardClick?.('spoofs')}
        className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs hover:border-[#D0CEBF] transition cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#FDF5E6] text-[#C58A36]">
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
          <span className="inline-flex items-center rounded-full bg-[#FCE8E8] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#B94D4D]">
            +3
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-[#687386]">Spoof attempts</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#18243A]">
            {spoofAttempts}
          </p>
          <p className="mt-1 text-[11px] text-[#687386]">flagged this session</p>
        </div>
      </div>

      {/* Card 4: Streams processed */}
      <div
        onClick={() => onCardClick?.('streams')}
        className="flex flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs hover:border-[#D0CEBF] transition cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#EAF2F8] text-[#719EC5]">
            <Waves size={18} strokeWidth={2.2} />
          </div>
          <span className="inline-flex items-center rounded-full bg-[#E8EEE3] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#36563B]">
            +18.6%
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-[#687386]">Streams processed</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#18243A]">
            {streamsProcessed.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-[#687386]">since 09:00 UTC</p>
        </div>
      </div>
    </div>
  )
}
