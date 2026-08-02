'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCaseStore } from '@/lib/store'
import { aiApi } from '@/lib/api'

export default function AIInsights() {
  const router = useRouter()
  const { selectedCaseId } = useCaseStore()

  const [summary,    setSummary]    = useState<any>(null)
  const [loading,    setLoading]    = useState(false)
  const [chatInput,  setChatInput]  = useState('')
  const [chatReply,  setChatReply]  = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Load AI summary when case changes
  useEffect(() => {
    if (!selectedCaseId) return
    setLoading(true)
    setSummary(null)
    aiApi.getSummary(selectedCaseId)
      .then(res => {
        const raw = res.summary ?? res.result ?? ''
        try {
          const parsed = JSON.parse(raw)
          setSummary(parsed)
        } catch {
          setSummary({ fullSummary: raw, keyStrengths: [], keyWeaknesses: [], nextSteps: [], verdictProbability: null })
        }
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [selectedCaseId])

  async function handleAskClausio() {
    if (!chatInput.trim() || !selectedCaseId) return
    setChatLoading(true)
    setChatReply('')
    try {
      const res = await aiApi.chat({ message: chatInput, caseId: selectedCaseId, history: [] })
      setChatReply(res.response ?? res.result ?? '')
      setChatInput('')
    } catch {
      setChatReply('Unable to get AI response. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  const favorable = summary?.verdictProbability?.favorable ?? null

  return (
    <div className="glass-panel" style={{ height: 'calc(100% - 16px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: 'rgba(255,255,255,0.4)' }}>
        <i className="ti ti-brain" style={{ fontSize: 16, color: '#7c3aed' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', flex: 1 }}>AI Insights</span>
        {selectedCaseId && (
          <button
            onClick={() => { setLoading(true); setSummary(null); aiApi.getSummary(selectedCaseId).then(res => { try { setSummary(JSON.parse(res.summary ?? res.result ?? '')) } catch { setSummary({ fullSummary: res.summary ?? res.result ?? '' }) } }).catch(() => {}).finally(() => setLoading(false)) }}
            style={{ fontSize: 10, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ↻
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

        {/* No case selected */}
        {!selectedCaseId && (
          <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 12 }}>
            Select a case to see AI insights
          </div>
        )}

        {/* Loading */}
        {loading && selectedCaseId && (
          <div style={{ textAlign: 'center', padding: 20, color: '#7c3aed', fontSize: 12 }}>
            <i className="ti ti-loader-2" style={{ fontSize: 20, display: 'block', marginBottom: 8 }} />
            Analysing case...
          </div>
        )}

        {/* AI Summary */}
        {!loading && summary && (
          <>
            {/* Success probability */}
            {favorable !== null && (
              <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, marginBottom: 4 }}>Case success probability</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{favorable}%</div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${favorable}%`, height: 6, background: favorable >= 60 ? '#10b981' : favorable >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                  {summary.verdictProbability?.basis ?? 'Based on evidence and case facts'}
                </div>
              </div>
            )}

            {/* Key strengths */}
            {summary.keyStrengths?.length > 0 && (
              <>
                <p style={{ fontSize: 10, color: '#15803d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>Strengths</p>
                {summary.keyStrengths.slice(0, 3).map((s: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0, marginTop: 4 }} />
                    <p style={{ fontSize: 11, color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                      {typeof s === 'string' ? s : s.strength ?? ''}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* Key weaknesses */}
            {summary.keyWeaknesses?.length > 0 && (
              <>
                <p style={{ fontSize: 10, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700, marginTop: 14 }}>Risks</p>
                {summary.keyWeaknesses.slice(0, 2).map((w: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: i < 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <p style={{ fontSize: 11, color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                        {typeof w === 'string' ? w : w.weakness ?? ''}
                      </p>
                      <button
                        onClick={() => router.push('/strategy')}
                        style={{ marginTop: 4, fontSize: 10, padding: '2px 8px', border: 'none', background: '#fef2f2', color: '#991b1b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, borderRadius: 4 }}
                      >
                        Fix now
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Next steps */}
            {summary.nextSteps?.length > 0 && (
              <>
                <p style={{ fontSize: 10, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700, marginTop: 14 }}>Next Actions</p>
                {summary.nextSteps.slice(0, 3).map((s: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 4 }} />
                    <p style={{ fontSize: 11, color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                      {typeof s === 'string' ? s : s.action ?? ''}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* Case killer */}
            {summary.caseKiller && (
              <div style={{ marginTop: 14, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>⚠ Case Killer Risk</div>
                <p style={{ fontSize: 11, color: '#7f1d1d', lineHeight: 1.5, margin: 0 }}>{summary.caseKiller}</p>
              </div>
            )}

            {/* Full summary */}
            {summary.fullSummary && (
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>AI SUMMARY</div>
                <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.6, margin: 0 }}>{summary.fullSummary}</p>
              </div>
            )}

            {/* Quick navigation */}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>Quick Access</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: '📋 Strategy', route: '/strategy' },
                  { label: '⚖️ Hearings', route: '/hearings' },
                  { label: '📄 Drafting', route: '/drafting' },
                  { label: '💰 Financial', route: '/financial' },
                  { label: '✅ Readiness', route: '/readiness' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(item.route)}
                    style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 8, fontSize: 11, color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', fontWeight: 500 }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Chat reply */}
        {chatReply && (
          <div style={{ marginTop: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>Clausio AI</div>
            <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.6, margin: 0 }}>{chatReply}</p>
          </div>
        )}
      </div>

      {/* Ask Clausio input */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAskClausio() }}
            placeholder="Ask Clausio about this case..."
            style={{ flex: 1, padding: '8px 10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.8)', color: '#0f172a' }}
          />
          <button
            onClick={handleAskClausio}
            disabled={chatLoading || !chatInput.trim() || !selectedCaseId}
            style={{ padding: '0 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, opacity: chatLoading ? 0.7 : 1 }}
          >
            {chatLoading ? '...' : '→'}
          </button>
        </div>
        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, marginBottom: 0 }}>Press Enter or → to ask</p>
      </div>
    </div>
  )
}
