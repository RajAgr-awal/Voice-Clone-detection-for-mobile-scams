import React, { useState, useRef, useEffect } from 'react'
import {
  Bell,
  ChevronDown,
  Fingerprint,
  User,
  Plus,
  Check,
  CheckCheck,
  Menu,
  Layers,
} from 'lucide-react'
import type { CaseItem, NotificationItem } from '../types'

export type ConceptId = 'concept-3' | 'concept-1'

interface HeaderProps {
  activeCaseId: string
  cases: CaseItem[]
  onSelectCase: (caseId: string) => void
  onCreateCase: (id: string, name: string) => void
  notifications: NotificationItem[]
  onMarkAllNotificationsRead: () => void
  isLive: boolean
  onToggleLive: () => void
  onOpenMobileMenu: () => void
  selectedConcept: ConceptId
  onSelectConcept: (concept: ConceptId) => void
}

export const Header: React.FC<HeaderProps> = ({
  activeCaseId,
  cases,
  onSelectCase,
  onCreateCase,
  notifications,
  onMarkAllNotificationsRead,
  isLive,
  onToggleLive,
  onOpenMobileMenu,
  selectedConcept,
  onSelectConcept,
}) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCaseMenu, setShowCaseMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showConceptMenu, setShowConceptMenu] = useState(false)
  const [isCreatingCase, setIsCreatingCase] = useState(false)
  const [newCaseId, setNewCaseId] = useState('')
  const [newCaseName, setNewCaseName] = useState('')

  const notifRef = useRef<HTMLDivElement>(null)
  const caseRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const conceptRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (caseRef.current && !caseRef.current.contains(event.target as Node)) {
        setShowCaseMenu(false)
        setIsCreatingCase(false)
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (conceptRef.current && !conceptRef.current.contains(event.target as Node)) {
        setShowConceptMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCaseId.trim()) return
    onCreateCase(newCaseId.trim(), newCaseName.trim() || `Case ${newCaseId.trim()}`)
    setNewCaseId('')
    setNewCaseName('')
    setIsCreatingCase(false)
    setShowCaseMenu(false)
  }

  return (
    <header className="border-b border-[#E6E5DF] bg-[#FAF9F5] px-6 py-4 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left branding and cockpit title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="flex size-9 items-center justify-center rounded-lg border border-[#E6E5DF] bg-white text-[#687386] hover:text-[#18243A] lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#687386]">
                EVALUATION ENVIRONMENT / NODE 04
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#18243A] sm:text-2xl">
              Judge Evaluation Cockpit
            </h1>
            <p className="mt-0.5 text-xs text-[#687386]">
              {selectedConcept === 'concept-3'
                ? 'Detect synthetic speech, verify authenticity, and assess scam risk.'
                : 'Monitor live voice streams, analyze recordings and detect AI-generated or fraudulent speech.'}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Concept Switcher Dropdown */}
          <div className="relative" ref={conceptRef}>
            <button
              onClick={() => setShowConceptMenu((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full border border-[#E6E5DF] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#18243A] shadow-2xs hover:bg-[#F2F0E8] transition"
              title="Switch Dashboard Concept"
            >
              <Layers size={13} className="text-[#36563B]" />
              <span>
                {selectedConcept === 'concept-3'
                  ? 'Concept 3 — Focused Results'
                  : 'Concept 1 — Card Layout'}
              </span>
              <ChevronDown size={12} className="text-[#687386]" />
            </button>

            {showConceptMenu && (
              <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-2 shadow-xl text-xs">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#687386]">
                  Select Dashboard Layout
                </p>
                <button
                  onClick={() => {
                    onSelectConcept('concept-3')
                    setShowConceptMenu(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition ${
                    selectedConcept === 'concept-3'
                      ? 'bg-[#E8EEE3] text-[#36563B] font-bold'
                      : 'hover:bg-[#FAF9F5] text-[#18243A]'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Concept 3 — Focused Results</p>
                    <p className="text-[10px] text-[#687386]">Prominent Auth Rate &amp; wide results</p>
                  </div>
                  {selectedConcept === 'concept-3' && <Check size={14} className="text-[#36563B]" />}
                </button>

                <button
                  onClick={() => {
                    onSelectConcept('concept-1')
                    setShowConceptMenu(false)
                  }}
                  className={`mt-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition ${
                    selectedConcept === 'concept-1'
                      ? 'bg-[#E8EEE3] text-[#36563B] font-bold'
                      : 'hover:bg-[#FAF9F5] text-[#18243A]'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Concept 1 — Card Layout</p>
                    <p className="text-[10px] text-[#687386]">4 Top metric cards &amp; balanced grid</p>
                  </div>
                  {selectedConcept === 'concept-1' && <Check size={14} className="text-[#36563B]" />}
                </button>
              </div>
            )}
          </div>

          {/* Live Data status pill */}
          <button
            onClick={onToggleLive}
            className="flex items-center gap-2 rounded-full border border-[#E6E5DF] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#18243A] shadow-2xs hover:bg-[#F2F0E8] transition"
            title="Click to toggle streaming / test data mode"
          >
            <span className="relative flex size-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLive ? 'animate-ping bg-[#6F895C]' : 'bg-[#687386]'
                }`}
              />
              <span
                className={`relative inline-flex size-2 rounded-full ${
                  isLive ? 'bg-[#36563B]' : 'bg-[#687386]'
                }`}
              />
            </span>
            <span className="text-[11px] font-semibold text-[#18243A]">
              {isLive ? 'Live Data' : 'Demo Mode'}
            </span>
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative flex size-9 items-center justify-center rounded-lg border border-[#E6E5DF] bg-[#FFFFFF] text-[#687386] shadow-2xs hover:border-[#D0CEBF] hover:text-[#18243A] transition"
              aria-label="Open notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#B94D4D]" />
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#F2F0E8] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18243A]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[#B94D4D]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#B94D4D]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="flex items-center gap-1 text-[11px] text-[#719EC5] hover:underline"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-4 text-center text-xs text-[#687386]">No active notifications</p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg p-2.5 text-xs transition ${
                          item.read ? 'bg-transparent text-[#687386]' : 'bg-[#FAF9F5] text-[#18243A]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold ${
                              item.type === 'danger'
                                ? 'text-[#B94D4D]'
                                : item.type === 'success'
                                ? 'text-[#36563B]'
                                : 'text-[#18243A]'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="font-mono text-[10px] text-[#687386]">{item.time}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#687386]">{item.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-lg border border-[#E6E5DF] bg-[#FFFFFF] px-2.5 py-1.5 shadow-2xs hover:bg-[#F2F0E8] transition"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-[#E8EEE3] text-[#36563B]">
                <User size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-tight text-[#18243A]">Judge account</p>
                <p className="font-mono text-[9px] text-[#687386]">EVAL-ADMIN</p>
              </div>
              <ChevronDown size={14} className="text-[#687386]" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-2.5 shadow-lg text-xs">
                <div className="border-b border-[#F2F0E8] pb-2">
                  <p className="font-semibold text-[#18243A]">Evaluation Session</p>
                  <p className="text-[11px] text-[#687386]">Node 04 (Demo Evaluator)</p>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="rounded-md px-2 py-1.5 text-[11px] text-[#687386]">
                    Role: <span className="font-mono text-[#18243A]">Judge / Auditor</span>
                  </div>
                  <div className="rounded-md px-2 py-1.5 text-[11px] text-[#687386]">
                    Protocol: <span className="font-mono text-[#18243A]">Phase 2 Telephony</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Case selector */}
          <div className="relative" ref={caseRef}>
            <button
              onClick={() => setShowCaseMenu((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-lg border border-[#E6E5DF] bg-[#FFFFFF] px-3 py-1.5 text-left shadow-2xs hover:border-[#D0CEBF] transition"
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-[#F2F0E8] text-[#687386]">
                <Fingerprint size={16} />
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#687386]">Active Case</p>
                <p className="text-xs font-bold text-[#18243A] flex items-center gap-1">
                  {activeCaseId}
                  <ChevronDown size={13} className="text-[#687386]" />
                </p>
              </div>
            </button>

            {showCaseMenu && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-2.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#F2F0E8] pb-2 px-1">
                  <span className="text-xs font-bold text-[#18243A]">Select Active Case</span>
                  <button
                    onClick={() => setIsCreatingCase((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#36563B] hover:underline"
                  >
                    <Plus size={12} /> New Case
                  </button>
                </div>

                {isCreatingCase && (
                  <form onSubmit={handleCreateCaseSubmit} className="mt-2.5 space-y-2 border-b border-[#F2F0E8] pb-2.5">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[#687386]">Case ID</label>
                      <input
                        type="text"
                        placeholder="e.g. HACK-26 / VOICE-099"
                        value={newCaseId}
                        onChange={(e) => setNewCaseId(e.target.value)}
                        className="mt-0.5 w-full rounded border border-[#E6E5DF] bg-[#FAF9F5] px-2 py-1 text-xs text-[#18243A] focus:outline-none focus:border-[#36563B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[#687386]">Case Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Wire Fraud Investigation"
                        value={newCaseName}
                        onChange={(e) => setNewCaseName(e.target.value)}
                        className="mt-0.5 w-full rounded border border-[#E6E5DF] bg-[#FAF9F5] px-2 py-1 text-xs text-[#18243A] focus:outline-none focus:border-[#36563B]"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingCase(false)}
                        className="rounded px-2 py-1 text-[10px] text-[#687386] hover:bg-[#F2F0E8]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-[#36563B] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#2c4730]"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                  {cases.map((c) => {
                    const isSelected = c.id === activeCaseId
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectCase(c.id)
                          setShowCaseMenu(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                          isSelected
                            ? 'bg-[#E8EEE3] text-[#18243A] font-semibold'
                            : 'hover:bg-[#FAF9F5] text-[#687386]'
                        }`}
                      >
                        <div>
                          <p className="font-mono text-xs text-[#18243A]">{c.id}</p>
                          <p className="text-[10px] text-[#687386] truncate max-w-[180px]">{c.name}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-[#36563B]" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
