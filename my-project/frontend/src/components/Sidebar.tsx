import React from 'react'
import {
  LayoutDashboard,
  Radio,
  FileAudio,
  BarChart3,
  ChevronRight,
  X,
} from 'lucide-react'

export type PageId = 'overview' | 'live-analysis' | 'case-archive' | 'benchmarks'

interface SidebarProps {
  currentPage: PageId
  onSelectPage: (page: PageId) => void
  isBackendOnline: boolean
  mobileOpen: boolean
  onToggleMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isBackendOnline,
  mobileOpen,
  onToggleMobile,
}) => {
  const navItems: Array<{ id: PageId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-analysis', label: 'Live Analysis', icon: Radio },
    { id: 'case-archive', label: 'Case Archive', icon: FileAudio },
    { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
  ]

  const navContent = (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#E8EEE3] text-[#36563B] border border-[#D5DFCE]">
            {/* Geometric Shield Logo */}
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.08em] text-[#18243A]">VOICESHIELD</h1>
            <p className="text-[9px] font-semibold tracking-[0.18em] text-[#687386]">FORENSIC INTELLIGENCE</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="mt-8 space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id)
                  if (mobileOpen) onToggleMobile()
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8EEE3] text-[#18243A] font-semibold shadow-xs'
                    : 'text-[#687386] hover:bg-[#F2F0E8] hover:text-[#18243A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    className={isActive ? 'text-[#36563B]' : 'text-[#687386] group-hover:text-[#18243A]'}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="flex size-4 items-center justify-center text-[#36563B]">
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom System Status */}
      <div className="rounded-xl border border-[#E6E5DF] bg-[#FFFFFF] p-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendOnline ? 'animate-ping bg-[#6F895C]' : 'bg-[#C58A36]'
              }`}
            />
            <span
              className={`relative inline-flex size-2 rounded-full ${
                isBackendOnline ? 'bg-[#36563B]' : 'bg-[#C58A36]'
              }`}
            />
          </span>
          <span className="text-xs font-semibold text-[#18243A]">
            {isBackendOnline ? 'System Operational' : 'Demo Mode / Node 04'}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-[#F2F0E8] pt-2.5 text-[11px]">
          <div className="flex items-center justify-between text-[#687386]">
            <span>FastAPI Backend</span>
            <span
              className={`font-mono text-[10px] font-medium ${
                isBackendOnline ? 'text-[#36563B]' : 'text-[#C58A36]'
              }`}
            >
              {isBackendOnline ? 'ONLINE' : 'STANDALONE'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#687386]">
            <span>WebRTC Engine</span>
            <span className="font-mono text-[10px] font-medium text-[#36563B]">READY</span>
          </div>
          <div className="flex items-center justify-between text-[#687386]">
            <span>Model v1.0</span>
            <span className="font-mono text-[10px] text-[#18243A]">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-[#E6E5DF] bg-[#FAF9F5] lg:block">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={onToggleMobile} />
          <div className="relative flex w-64 max-w-[80vw] flex-1 flex-col bg-[#FAF9F5] shadow-2xl">
            <div className="absolute right-3 top-4">
              <button
                onClick={onToggleMobile}
                className="rounded-lg p-1 text-[#687386] hover:bg-[#F2F0E8]"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  )
}
