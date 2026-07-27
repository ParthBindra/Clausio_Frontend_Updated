'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore  } from '@/lib/store'
import { useCaseStore } from '@/lib/store'
import { casesApi, hearingsApi, documentsApi, statsApi } from '@/lib/api'
import CaseList     from '@/components/cases/CaseList'
import MetricsRow   from '@/components/dashboard/MetricsRow'
import QuickActions from '@/components/dashboard/QuickActions'
import HearingDiary from '@/components/dashboard/HearingDiary'
import AIInsights   from '@/components/dashboard/AIInsights'

const TABS = ['Overview','Documents','Timeline','Hearings','AI analysis','Drafts','Research','Evidence','Witnesses','Tasks','Billing','History']

export default function DashboardPage() {
  const router = useRouter()
  const { caseListVisible, aiPanelVisible } = useUIStore()

  // ✅ FIXED: only declare once
  const { selectedCaseId, setSelectedCase } = useCaseStore()

  const [activeTab, setActiveTab] = useState('Overview')
  const [caseData,  setCaseData]  = useState<any>(null)
  const [hearings,  setHearings]  = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [activity,  setActivity]  = useState<any[]>([])

  // ✅ Auto load first case if none selected
  useEffect(() => {
    if (selectedCaseId) return

    const token = localStorage.getItem('clausio_token')
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(cases => {
        if (Array.isArray(cases) && cases.length > 0) {
          setSelectedCase(cases[0].id, cases[0].name)
        }
      })
      .catch(err => console.error(err))
  }, [selectedCaseId, setSelectedCase])

  const loadHearings = useCallback(() => {
    if (!selectedCaseId) return
    hearingsApi.getByCaseId(selectedCaseId)
      .then(data => setHearings(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
  }, [selectedCaseId])

  // ✅ Reload case data whenever selectedCaseId changes
  useEffect(() => {
    if (!selectedCaseId) return

    setCaseData(null)
    setHearings([])
    setDocuments([])

    casesApi.getById(selectedCaseId)
      .then(data => setCaseData(data))
      .catch(err => console.error(err))

    loadHearings()

    documentsApi.getByCaseId(selectedCaseId)
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))

  }, [selectedCaseId, loadHearings])

  useEffect(() => {
    statsApi.activity()
      .then(data => setActivity(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
  }, [])

  // Get overdue orders from real hearings
  const overdueOrders = hearings
    .flatMap(h => h.orders ?? [])
    .filter(o => !o.done && new Date(o.deadline) < new Date())

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#fff', borderBottom: '1px solid #e2e8f0', fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>
        <span>Cases</span>
        <span style={{ color: '#cbd5e1' }}>›</span>
        <span style={{ color: '#0f172a', fontWeight: 500 }}>
          {caseData?.name ?? 'Loading...'}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* PANEL 1 — Case list */}
        <div style={{ flexShrink: 0, overflow: 'hidden', transition: 'width 0.22s ease', width: caseListVisible ? 216 : 0, borderRight: caseListVisible ? '1px solid #e2e8f0' : 'none' }}>
          <CaseList />
        </div>

        {/* PANEL 2 — Main workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Case header */}
          <div style={{ padding: '8px 12px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                {caseData?.name ?? 'Select a case'}
              </span>
              {caseData && (
                <>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, fontWeight: 600, background: '#fef2f2', color: '#dc2626' }}>● {caseData.status}</span>
                  {overdueOrders.length > 0 && (
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, fontWeight: 600, background: '#fef3c7', color: '#d97706' }}>{overdueOrders.length} overdue</span>
                  )}
                </>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, color: '#64748b' }}>Readiness</span>
                <div style={{ width: 60, height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${caseData?.readinessScore ?? 0}%`, height: 5, background: '#10b981', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#10b981' }}>{caseData?.readinessScore ?? 0}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#64748b' }}>
              <span>{caseData?.court ?? '—'}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span>{caseData?.caseNumber ?? '—'}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span>Next: <strong style={{ color: '#0f172a' }}>
                {caseData?.nextHearing
                  ? new Date(caseData.nextHearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </strong></span>
            </div>
          </div>

          {/* 12 tabs */}
          <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '6px 10px', fontSize: 10, cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === t ? '#3b82f6' : 'transparent'}`, color: activeTab === t ? '#1e40af' : '#64748b', fontWeight: activeTab === t ? 500 : 400, fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {t}
              </button>
            ))}
          </div>

          {/* Overdue alert */}
          {overdueOrders.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fef2f2', borderBottom: '1px solid #fca5a5', borderLeft: '3px solid #dc2626', padding: '6px 12px', fontSize: 10, color: '#7f1d1d', flexShrink: 0 }}>
              <i className="ti ti-alert-triangle" style={{ color: '#dc2626', fontSize: 13 }} />
              <span style={{ fontWeight: 500 }}>{overdueOrders.length} overdue deadlines</span>
              <button style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 5, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: 9, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Resolve →</button>
            </div>
          )}

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>

            {/* No case selected state */}
            {!caseData && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', gap: 8 }}>
                <i className="ti ti-folder-open" style={{ fontSize: 32 }} />
                <span style={{ fontSize: 13 }}>Select a case from the left panel</span>
              </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && caseData && (
              <>
                <MetricsRow hearings={hearings} documents={documents} caseData={caseData} overdueCount={overdueOrders.length} />
                <QuickActions />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 7 }}>
                  <HearingDiary hearings={hearings} onChanged={loadHearings} />
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                      <i className="ti ti-activity" style={{ fontSize: 12, color: '#94a3b8' }} />
                      Activity feed
                    </div>
                    {activity.length === 0 && (
                      <div style={{ fontSize: 10, color: '#94a3b8', padding: '4px 0' }}>No recent activity.</div>
                    )}
                    {activity.slice(0, 6).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '4px 0', borderBottom: i < Math.min(activity.length, 6) - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.type === 'Case' ? '#7c3aed' : a.type === 'Hearing' ? '#f59e0b' : '#3b82f6', flexShrink: 0, marginTop: 3 }} />
                        <div>
                          <div style={{ fontSize: 10, color: '#0f172a' }}>{a.description}</div>
                          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>
                            {a.occurredAt ? new Date(a.occurredAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 9, padding: '9px 11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                    <i className="ti ti-chart-pie" style={{ fontSize: 12, color: '#94a3b8' }} />
                    Practice analytics
                    <span style={{ marginLeft: 'auto', fontSize: 9, color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}>Full report →</span>
                  </div>
                  <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                    {[
                      { val: hearings.length.toString(),             lbl: 'Hearing entries',  trend: 'Recorded',                                             clr: '#10b981' },
                      { val: `${caseData?.readinessScore ?? 0}%`,   lbl: 'Case readiness',   trend: 'Current score',                                        clr: '#10b981' },
                      { val: overdueOrders.length.toString(),        lbl: 'Overdue tasks',    trend: overdueOrders.length > 0 ? 'Act now' : 'All clear',     clr: overdueOrders.length > 0 ? '#ef4444' : '#10b981' },
                      { val: caseData?.priority ?? '—',              lbl: 'Priority',         trend: caseData?.stage ?? '—',                                 clr: '#f59e0b' },
                    ].map((seg, i) => (
                      <div key={i} style={{ flex: 1, padding: '7px 8px', textAlign: 'center', borderRight: i < 3 ? '1px solid #e2e8f0' : 'none' }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{seg.val}</div>
                        <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>{seg.lbl}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: seg.clr, marginTop: 2 }}>{seg.trend}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* OTHER TABS */}
            {activeTab !== 'Overview' && caseData && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', gap: 8 }}>
                <i className="ti ti-tools" style={{ fontSize: 28 }} />
                <span style={{ fontSize: 12 }}>{activeTab} — coming soon</span>
              </div>
            )}

          </div>
        </div>

        {/* PANEL 3 — AI Insights */}
        <div style={{ flexShrink: 0, overflow: 'hidden', transition: 'width 0.22s ease', width: aiPanelVisible ? 200 : 0, borderLeft: aiPanelVisible ? '1px solid #e2e8f0' : 'none' }}>
          <AIInsights />
        </div>

      </div>
    </div>
  )
}
