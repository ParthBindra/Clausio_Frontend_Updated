'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/lib/store'
import { authApi } from '@/lib/api'

const LANGUAGES: Record<string, string> = {
  en: 'English', hi: 'हिंदी', mr: 'मराठी', gu: 'ગુજરાતી', ta: 'தமிழ்', te: 'తెలుగు', kn: 'ಕನ್ನಡ',
}

export default function Header() {
  const router = useRouter()
  const { sidebarExpanded, caseListVisible, aiPanelVisible, language, toggleSidebar, toggleCaseList, toggleAIPanel, setLanguage } = useUIStore()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(authApi.getUser())
  }, [])

  const pill = (active: boolean, icon: string, label: string, onClick: () => void) => (
    <button onClick={onClick} className="glass-pill" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: active ? 600 : 500, color: active ? '#0f172a' : '#475569', background: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', border: active ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)' }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14 }} />{label}
    </button>
  )

  const fullName = user ? `${user.firstName ?? ''} ${(user.lastName ?? '').charAt(0)}${user.lastName ? '.' : ''}`.trim() : 'Guest'
  const initials = user ? `${(user.firstName ?? '')[0] ?? ''}${(user.lastName ?? '')[0] ?? ''}`.toUpperCase() : '—'
  const role = user?.role ?? 'Guest'

  return (
    <header className="glass-panel" style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0, margin: '16px 16px 0 16px' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>Clausio</span>

      <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
        {pill(sidebarExpanded, 'ti-layout-sidebar', 'Sidebar', toggleSidebar)}
        {pill(caseListVisible,  'ti-list',           'Cases',   toggleCaseList)}
        {pill(aiPanelVisible,   'ti-brain',          'AI',      toggleAIPanel)}
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 16, padding: '8px 16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <i className="ti ti-search" style={{ fontSize: 14, color: '#64748b' }} />
          <span style={{ fontSize: 13, color: '#64748b', flex: 1, fontWeight: 500 }}>Search cases, clients...</span>
          <kbd style={{ fontSize: 10, background: 'rgba(255,255,255,0.8)', color: '#475569', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.05)' }}>⌘K</kbd>
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="glass-pill"
          aria-label="Language"
          style={{ fontSize: 12, color: '#0f172a', fontWeight: 600, padding: '6px 10px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.6)', borderRadius: 20, cursor: 'pointer' }}
        >
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        <span className="glass-pill" style={{ fontSize: 12, color: '#0f172a', fontWeight: 600, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ti ti-bolt" style={{ fontSize: 14, color: '#eab308' }} /> 847 credits
        </span>
        <button aria-label="Notifications" className="glass-button" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: '#475569', cursor: 'pointer' }}>
          <i className="ti ti-bell" style={{ fontSize: 18 }} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
        </button>
        <button aria-label="Settings" onClick={() => router.push('/settings')} className="glass-button" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}>
          <i className="ti ti-settings" style={{ fontSize: 18 }} />
        </button>
        <div onClick={() => router.push('/settings')} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{fullName}</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>{role}</span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>{initials}</div>
        </div>
      </div>
    </header>
  )
}
