import React, { useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import type { ActivityRecord } from '../types'

interface RecentActivityTableProps {
  records: ActivityRecord[]
  onSelectRecord: (record: ActivityRecord) => void
  onViewArchive: () => void
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  records,
  onSelectRecord,
  onViewArchive,
}) => {
  const [filterVerdict, setFilterVerdict] = useState<'All' | 'Human' | 'AI-Generated'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRecords = records.filter((r) => {
    if (filterVerdict !== 'All' && r.verdict !== filterVerdict) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        r.case_id.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.verdict.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
      <div>
        {/* Table Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#18243A]">Recent Analysis Activity</h2>
            <p className="mt-0.5 text-[11px] text-[#687386]">Latest model events across all channels</p>
          </div>

          <button
            onClick={onViewArchive}
            className="flex items-center gap-1 text-xs font-semibold text-[#719EC5] hover:text-[#527d9f] hover:underline transition"
          >
            <span>View archive</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#F2F0E8] pb-3">
          <div className="flex items-center gap-1">
            {(['All', 'Human', 'AI-Generated'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterVerdict(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filterVerdict === cat
                    ? 'bg-[#E8EEE3] text-[#36563B] font-semibold'
                    : 'text-[#687386] hover:bg-[#FAF9F5] hover:text-[#18243A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md border border-[#E6E5DF] bg-[#FAF9F5] py-1 pl-2.5 pr-7 text-xs text-[#18243A] placeholder-[#687386] focus:outline-none focus:border-[#36563B]"
            />
            <Search size={12} className="pointer-events-none absolute right-2.5 top-2 text-[#687386]" />
          </div>
        </div>

        {/* Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6E5DF] text-[11px] font-semibold text-[#687386]">
                <th className="pb-2.5 font-medium">Time</th>
                <th className="pb-2.5 font-medium">Source</th>
                <th className="pb-2.5 font-medium">Case ID</th>
                <th className="pb-2.5 font-medium">Verdict</th>
                <th className="pb-2.5 font-medium">Confidence</th>
                <th className="pb-2.5 font-medium text-right">Scam Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F0E8]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[#687386]">
                    No matching activity records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => {
                  const isHuman = row.verdict === 'Human'
                  const isHighScam = row.scam_risk === 'High'
                  const isMediumScam = row.scam_risk === 'Medium'

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onSelectRecord(row)}
                      className="group hover:bg-[#FAF9F5] transition cursor-pointer"
                    >
                      <td className="py-3 font-mono text-[11px] text-[#687386]">{row.time}</td>
                      <td className="py-3 font-medium text-[#18243A] truncate max-w-[140px]" title={row.source}>
                        {row.source}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#687386]">{row.case_id}</td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            isHuman ? 'text-[#36563B]' : 'text-[#B94D4D]'
                          }`}
                        >
                          {row.verdict}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[#18243A] font-medium">{row.confidence}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isHighScam
                              ? 'bg-[#FCE8E8] text-[#B94D4D]'
                              : isMediumScam
                              ? 'bg-[#FDF5E6] text-[#C58A36]'
                              : 'bg-[#E8EEE3] text-[#36563B]'
                          }`}
                        >
                          {row.scam_risk}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 border-t border-[#F2F0E8] pt-2 text-[10px] text-[#687386] flex items-center justify-between">
        <span>Click any row to inspect waveform and forensic evidence</span>
        <span>Showing {filteredRecords.length} records</span>
      </div>
    </div>
  )
}
