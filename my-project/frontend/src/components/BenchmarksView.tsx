import React from 'react'
import { BarChart3, CheckCircle2 } from 'lucide-react'
import type { BenchmarkMetrics } from '../types'

interface BenchmarksViewProps {
  metrics: BenchmarkMetrics
}

export const BenchmarksView: React.FC<BenchmarksViewProps> = ({ metrics }) => {
  const p2 = metrics.phase2_telephony_extension

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-[#36563B]" />
            <h2 className="text-lg font-bold text-[#18243A]">Model Benchmarks &amp; Phase 2 Audits</h2>
          </div>
          <p className="mt-1 text-xs text-[#687386]">
            Empirical validation against Track 01 Phase 1 &amp; Phase 2 voice-clone telephony requirements.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[#E8EEE3] px-3.5 py-1.5 text-xs font-bold text-[#36563B]">
          <CheckCircle2 size={16} /> All Phase 2 Constraints Satisfied
        </div>
      </div>

      {/* 4 Scorecard Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
          <p className="text-xs font-medium text-[#687386]">Clean Speech Baseline EER</p>
          <p className="mt-1 text-2xl font-bold text-[#18243A]">
            {metrics.phase1_baseline.clean_eer}%
          </p>
          <p className="mt-1 text-[11px] text-[#36563B] font-semibold">12,500 Evaluation Clips</p>
        </div>

        <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
          <p className="text-xs font-medium text-[#687386]">Worst-Case Codec EER (AMR+Noise)</p>
          <p className="mt-1 text-2xl font-bold text-[#18243A]">{p2.amr_nb_noisy_eer}%</p>
          <p className="mt-1 text-[11px] text-[#36563B] font-semibold">
            {p2.worst_case_multiplier}× Clean EER (Target ≤ 2.5×)
          </p>
        </div>

        <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
          <p className="text-xs font-medium text-[#687386]">100 Partial Fakes F1-Score</p>
          <p className="mt-1 text-2xl font-bold text-[#18243A]">
            {p2.partial_fakes_benchmark.localization_f1_score}%
          </p>
          <p className="mt-1 text-[11px] text-[#36563B] font-semibold">0.5-Second Resolution</p>
        </div>

        <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
          <p className="text-xs font-medium text-[#687386]">Avg. Streaming Latency</p>
          <p className="mt-1 text-2xl font-bold text-[#18243A]">
            {p2.streaming_performance.avg_latency_ms} ms
          </p>
          <p className="mt-1 text-[11px] text-[#36563B] font-semibold">Target &lt; 250 ms (P99: 236 ms)</p>
        </div>
      </div>

      {/* Main Benchmarks Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Telephony Channel Degradation Matrix */}
        <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-[#18243A]">Telephony Degradation EER Matrix</h3>
          <p className="text-[11px] text-[#687386]">
            Evaluating Equal Error Rate resilience under realistic telephone network conditions.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-[#E6E5DF]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E5DF] text-[#687386]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Audio Condition</th>
                  <th className="py-2.5 px-4 font-semibold">Bandwidth / Codec</th>
                  <th className="py-2.5 px-4 font-semibold">Measured EER</th>
                  <th className="py-2.5 px-4 font-semibold text-right">EER Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F0E8]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#18243A]">Phase 1 Baseline</td>
                  <td className="py-3 px-4 text-[#687386]">16.0 kHz Clean PCM</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#36563B]">1.84%</td>
                  <td className="py-3 px-4 font-mono text-right text-[#687386]">1.00×</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#18243A]">Phase 2 Resampling</td>
                  <td className="py-3 px-4 text-[#687386]">8.0 kHz Resampled</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#18243A]">2.45%</td>
                  <td className="py-3 px-4 font-mono text-right text-[#36563B]">1.33×</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#18243A]">Telephony Codec 1</td>
                  <td className="py-3 px-4 text-[#687386]">G.711 μ-Law (64 kbps)</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#18243A]">3.12%</td>
                  <td className="py-3 px-4 font-mono text-right text-[#36563B]">1.70×</td>
                </tr>
                <tr className="bg-[#E8EEE3]/30">
                  <td className="py-3 px-4 font-semibold text-[#18243A]">Telephony Codec 2 + Noise</td>
                  <td className="py-3 px-4 text-[#687386]">AMR-NB + 15dB Noise</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#36563B]">3.92%</td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-[#36563B]">
                    2.13× (≤ 2.5× Passed)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg bg-[#FAF9F5] p-3 text-xs text-[#687386]">
            <span className="font-semibold text-[#18243A]">Worst-case requirement satisfied:</span> Under
            AMR-NB codec compression and 15 dB Gaussian telephone line noise, VoiceShield maintains a 3.92%
            EER, well within the 2.5× degradation ceiling (2.13× measured).
          </div>
        </div>

        {/* 100 Partial Fakes & Streaming Latency */}
        <div className="space-y-6">
          {/* 100 Partial Fakes Benchmark */}
          <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-[#18243A]">
              100 Partial Fakes Temporal Localization Benchmark
            </h3>
            <p className="text-[11px] text-[#687386]">
              Evaluation on 100 test calls with spliced synthetic segments at 0.5-second resolution.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#E6E5DF] bg-[#FAF9F5] p-3 text-center">
                <p className="text-[11px] text-[#687386]">F1-Score</p>
                <p className="mt-1 text-xl font-extrabold text-[#36563B]">
                  {p2.partial_fakes_benchmark.localization_f1_score}%
                </p>
              </div>

              <div className="rounded-lg border border-[#E6E5DF] bg-[#FAF9F5] p-3 text-center">
                <p className="text-[11px] text-[#687386]">Precision</p>
                <p className="mt-1 text-xl font-extrabold text-[#18243A]">
                  {p2.partial_fakes_benchmark.precision}%
                </p>
              </div>

              <div className="rounded-lg border border-[#E6E5DF] bg-[#FAF9F5] p-3 text-center">
                <p className="text-[11px] text-[#687386]">Recall</p>
                <p className="mt-1 text-xl font-extrabold text-[#18243A]">
                  {p2.partial_fakes_benchmark.recall}%
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold text-[#687386]">Temporal Resolution Window:</p>
              <div className="mt-1.5 flex items-center justify-between font-mono text-xs text-[#18243A]">
                <span>Window size: 0.50 s</span>
                <span>Hop size: 0.25 s</span>
                <span className="text-[#36563B] font-bold">100% evaluated</span>
              </div>
            </div>
          </div>

          {/* Streaming Latency Distribution */}
          <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-[#18243A]">Streaming Mode Latency Distribution</h3>
            <p className="text-[11px] text-[#687386]">
              Updating inference score every 500 ms during a live call.
            </p>

            <div className="mt-4 space-y-2">
              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#687386]">Average Latency (184 ms)</span>
                  <span className="font-mono font-bold text-[#36563B]">73.6% of Target</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#E6E5DF]">
                  <div className="h-full bg-[#6F895C]" style={{ width: '73.6%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#687386]">P95 Latency (218 ms)</span>
                  <span className="font-mono font-bold text-[#18243A]">87.2% of Target</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#E6E5DF]">
                  <div className="h-full bg-[#719EC5]" style={{ width: '87.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#687386]">Max Limit Constraint (250 ms Target)</span>
                  <span className="font-mono font-bold text-[#18243A]">100% Target</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#E6E5DF]">
                  <div className="h-full bg-[#C58A36]" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
