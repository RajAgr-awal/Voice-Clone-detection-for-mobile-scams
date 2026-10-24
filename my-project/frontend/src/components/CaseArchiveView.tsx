import React, { useState } from 'react'
import { FileAudio, Search, Filter, Download } from 'lucide-react'
import type { ActivityRecord, CaseItem } from '../types'

interface CaseArchiveViewProps {
  records: ActivityRecord[]
  cases: CaseItem[]
  onSelectRecord: (record: ActivityRecord) => void
}

export const CaseArchiveView: React.FC<CaseArchiveViewProps> = ({
  records,
  cases,
  onSelectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVerdict, setFilterVerdict] = useState<string>('All')
  const [filterRisk, setFilterRisk] = useState<string>('All')

  const filteredRecords = records.filter((r) => {
    if (filterVerdict !== 'All' && r.verdict !== filterVerdict) return false
    if (filterRisk !== 'All' && r.scam_risk !== filterRisk) return false
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

  const exportAllArchive = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voiceshield_case_archive_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Archive Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileAudio size={20} className="text-[#36563B]" />
            <h2 className="text-lg font-bold text-[#18243A]">Case Archive &amp; Audit Trail</h2>
          </div>
          <p className="mt-1 text-xs text-[#687386]">
            Immutable record of all analyzed voice streams, forensic biometric evaluations, and case dossiers.
          </p>
        </div>

        <button
          onClick={exportAllArchive}
          className="flex items-center gap-2 rounded-lg border border-[#E6E5DF] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#18243A] shadow-2xs hover:bg-[#F2F0E8] transition"
        >
          <Download size={14} /> Export Archive (JSON)
        </button>
      </div>

      {/* Case Dossiers Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cases.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-4 shadow-2xs"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs font-bold text-[#18243A]">{c.id}</span>
              <span className="rounded-full bg-[#E8EEE3] px-2 py-0.5 text-[10px] font-semibold text-[#36563B]">
                {c.status}
              </span>
            </div>
            <p className="mt-2 text-xs font-medium text-[#18243A]">{c.name}</p>
            <div className="mt-3 flex items-center justify-between border-t border-[#F2F0E8] pt-2 font-mono text-[11px] text-[#687386]">
              <span>Streams: {c.streams_count}</span>
              <span>Flagged: {c.spoofs_flagged}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-5 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by case ID, source, or timestamp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E6E5DF] bg-[#FAF9F5] py-2 pl-3 pr-8 text-xs text-[#18243A] placeholder-[#687386] focus:outline-none focus:border-[#36563B]"
            />
            <Search size={14} className="pointer-events-none absolute right-3 top-2.5 text-[#687386]" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#687386]">
              <Filter size={13} />
              <span>Verdict:</span>
            </div>
            {['All', 'Human', 'AI-Generated'].map((v) => (
              <button
                key={v}
                onClick={() => setFilterVerdict(v)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filterVerdict === v
                    ? 'bg-[#E8EEE3] text-[#36563B] font-bold'
                    : 'border border-[#E6E5DF] bg-[#FAF9F5] text-[#687386] hover:bg-[#F2F0E8]'
                }`}
              >
                {v}
              </button>
            ))}

            <div className="ml-2 flex items-center gap-1.5 text-xs text-[#687386]">
              <span>Scam Risk:</span>
            </div>
            {['All', 'Low', 'High'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filterRisk === r
                    ? 'bg-[#E8EEE3] text-[#36563B] font-bold'
                    : 'border border-[#E6E5DF] bg-[#FAF9F5] text-[#687386] hover:bg-[#F2F0E8]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6E5DF] text-[11px] font-semibold text-[#687386]">
                <th className="pb-3 font-medium">Record ID</th>
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Case Identifier</th>
                <th className="pb-3 font-medium">Ingress Channel / File</th>
                <th className="pb-3 font-medium">Classification</th>
                <th className="pb-3 font-medium">Confidence</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Calibrated SNR</th>
                <th className="pb-3 font-medium text-right">Scam Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F0E8]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#687386]">
                    No records match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => {
                  const isHuman = row.verdict === 'Human'
                  const isHighScam = row.scam_risk === 'High'

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onSelectRecord(row)}
                      className="group hover:bg-[#FAF9F5] transition cursor-pointer"
                    >
                      <td className="py-3 font-mono text-[11px] font-semibold text-[#18243A]">
                        {row.id}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#687386]">{row.time}</td>
                      <td className="py-3 font-mono text-[11px] text-[#18243A]">{row.case_id}</td>
                      <td className="py-3 font-medium text-[#18243A] truncate max-w-[150px]">
                        {row.source}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            isHuman ? 'text-[#36563B]' : 'text-[#B94D4D]'
                          }`}
                        >
                          {row.verdict}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[#18243A] font-bold">{row.confidence}</td>
                      <td className="py-3 font-mono text-[11px] text-[#687386]">{row.duration}</td>
                      <td className="py-3 font-mono text-[11px] text-[#687386]">{row.snr}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                            isHighScam
                              ? 'bg-[#FCE8E8] text-[#B94D4D]'
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
    </div>
  )
}
