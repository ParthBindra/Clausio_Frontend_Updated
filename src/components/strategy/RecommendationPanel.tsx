'use client'

import { useState } from 'react'
import { useCaseStore } from '@/lib/store'
import { aiApi, parseAiJson } from '@/lib/api'

export default function RecommendationPanel() {
  const { selectedCaseId } = useCaseStore()
  const [recs,    setRecs]    = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [loaded,  setLoaded]  = useState(false)

  function loadRecs() {
    if (!selectedCaseId) return
    setLoading(true)
    setError('')
    aiApi.getSummary(selectedCaseId)
      .then(res => {
        const raw    = res.summary ?? res.result ?? ''
        let parsed: any = null
        try { parsed = JSON.parse(raw) } catch { parsed = null }

        const steps = parsed?.nextSteps ?? []
        setRecs(steps.map((s: any, i: number) => ({
          title:       typeof s === 'string' ? s.split(' ').slice(0, 5).join(' ') : s.action ?? 'Action',
          description: typeof s === 'string' ? s : s.action ?? '',
          priority:    i === 0 ? 'Critical' : i === 1 ? 'High' : 'Medium',
          impact:      i === 0 ? 'Very High' : i < 3 ? 'High' : 'Medium',
          time:        i === 0 ? 'Today' : i === 1 ? '2 Days' : '1 Week',
        })))
        setLoaded(true)
      })
      .catch(err => setError(err.message || 'Failed to load recommendations'))
      .finally(() => setLoading(false))
  }

  function getColor(priority: string) {
    if (priority === 'Critical') return { clr: '#dc2626', bg: '#fef2f2' }
    if (priority === 'High')     return { clr: '#d97706', bg: '#fff7ed' }
    return { clr: '#16a34a', bg: '#f0fdf4' }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 22, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>AI Recommendations</h2>
          <p style={{ marginTop: 6, color: '#64748b', fontSize: 14 }}>Suggested next actions for this case based on AI analysis.</p>
        </div>
        <button
          onClick={loadRecs}
          disabled={loading || !selectedCaseId}
          style={{ padding: '10px 18px', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: loading || !selectedCaseId ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
        >
          <i className="ti ti-sparkles" />
          {loading ? 'Loading...' : loaded ? 'Refresh AI' : 'Generate Recommendations'}
        </button>
      </div>

      {/* No case */}
      {!selectedCaseId && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <i className="ti ti-folder-open" style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />
          <div style={{ fontSize: 13 }}>Select a case to get AI recommendations</div>
        </div>
      )}

      {/* Not loaded yet */}
      {selectedCaseId && !loaded && !loading && !error && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <i className="ti ti-sparkles" style={{ fontSize: 36, display: 'block', marginBottom: 8, opacity: 0.5 }} />
          <div style={{ fontSize: 13, marginBottom: 16 }}>Click Generate Recommendations to get AI-powered action suggestions.</div>
          <button onClick={loadRecs} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            Generate Recommendations
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#7c3aed', fontSize: 13 }}>
          <i className="ti ti-loader-2" style={{ fontSize: 32, display: 'block', marginBottom: 8, animation: 'spin 1s linear infinite' }} />
          <div>AI is analysing your case...</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>This may take 15-20 seconds</div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
          {error}
          <button onClick={loadRecs} style={{ marginLeft: 12, fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>Retry</button>
        </div>
      )}

      {/* Empty after load */}
      {!loading && !error && loaded && recs.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>
          No recommendations generated. Try running AI Strategy first.
        </div>
      )}

      {/* Recommendation cards */}
      {!loading && recs.map((item, i) => {
        const p = getColor(item.priority)
        return (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', flex: 1 }}>{item.title}</div>
              <span style={{ background: p.bg, color: p.clr, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{item.priority}</span>
            </div>
            <div style={{ marginTop: 10, color: '#475569', lineHeight: 1.7, fontSize: 13 }}>{item.description}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Impact</div>
                <div style={{ marginTop: 4, fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{item.impact}</div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Timeline</div>
                <div style={{ marginTop: 4, fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{item.time}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
