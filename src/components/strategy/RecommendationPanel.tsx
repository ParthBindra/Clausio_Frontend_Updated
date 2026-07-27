'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/lib/store'
import { aiApi, parseAiJson } from '@/lib/api'
import type { CaseSummaryResponse } from '@/types/AIResponse'

export default function RecommendationPanel() {
  const { selectedCaseId } = useCaseStore()
  const [recs,    setRecs]    = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function loadRecs() {
    if (!selectedCaseId) return
    setLoading(true)
    setError('')
    aiApi.getSummary(selectedCaseId)
      .then(res => {
        const parsed = parseAiJson<CaseSummaryResponse>(res.result)
        const steps  = parsed?.nextSteps ?? []
        setRecs(steps.map((s: string, i: number) => ({
          title:       s.split(' ').slice(0, 4).join(' '),
          description: s,
          priority:    i === 0 ? 'Critical' : i === 1 ? 'High' : 'Medium',
          impact:      i === 0 ? 'Very High' : 'High',
          time:        i === 0 ? '1 Day' : i === 1 ? '2 Days' : '3 Days',
        })))
      })
      .catch(err => setError(err.message || 'Failed to load recommendations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRecs() }, [selectedCaseId])

  function getColor(priority: string) {
    if (priority === 'Critical') return { clr: '#dc2626', bg: '#fef2f2' }
    if (priority === 'High')     return { clr: '#d97706', bg: '#fff7ed' }
    return { clr: '#16a34a', bg: '#f0fdf4' }
  }

  return (
    // EXACT SAME UI as original
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 22, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>

      {/* Header — UNCHANGED */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>AI Recommendations</h2>
          <p style={{ marginTop: 6, color: '#64748b', fontSize: 14 }}>Suggested next actions for this case.</p>
        </div>
        <button
          onClick={loadRecs}
          disabled={loading}
          style={{ padding: '10px 18px', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
        >
          {loading ? 'Loading...' : 'Refresh AI'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>
          Generating recommendations...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && recs.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>
          No recommendations yet.
        </div>
      )}

      {/* Recommendation cards — EXACT SAME UI */}
      {recs.map((item, i) => {
        const p = getColor(item.priority)
        return (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#0f172a' }}>{item.title}</div>
              <span style={{ background: p.bg, color: p.clr, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{item.priority}</span>
            </div>
            <div style={{ marginTop: 12, color: '#475569', lineHeight: 1.7, fontSize: 14 }}>{item.description}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>Impact</div>
                <div style={{ marginTop: 5, fontWeight: 700, color: '#0f172a' }}>{item.impact}</div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>Time</div>
                <div style={{ marginTop: 5, fontWeight: 700, color: '#0f172a' }}>{item.time}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
