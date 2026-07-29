'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/lib/store'
import { aiApi, parseAiJson } from '@/lib/api'
import type { CaseSummaryResponse } from '@/types/AIResponse'

export default function RiskAssessment() {
  const { selectedCaseId } = useCaseStore()
  const [data,     setData]     = useState<CaseSummaryResponse | null>(null)
  const [rawText,  setRawText]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  function loadSummary() {
    if (!selectedCaseId) return
    setLoading(true)
    setError('')
    aiApi.getSummary(selectedCaseId)
      .then(res => {
        const raw    = res.summary ?? res.result ?? ''
        const parsed = parseAiJson<CaseSummaryResponse>(raw)
        if (parsed) {
          setData(parsed)
          setRawText('')
        } else {
          setData(null)
          setRawText(raw)
        }
      })
      .catch(err => setError(err.message || 'Failed to analyse case'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadSummary() }, [selectedCaseId])

  const strengthCount = data?.keyStrengths?.length ?? 0
  const weaknessCount = data?.keyWeaknesses?.length ?? 0
  const total         = strengthCount + weaknessCount
  const favorable     = total > 0 ? Math.round((strengthCount / total) * 100) : null
  const adverse       = total > 0 ? Math.round((weaknessCount / total) * 100) : null
  const partial       = favorable !== null && adverse !== null ? 100 - favorable - adverse : null

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="ti ti-shield-check" style={{ fontSize: 20, color: '#2563eb' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Risk Assessment</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>AI evaluation of current case strength</p>
          </div>
        </div>
        <button
          onClick={loadSummary}
          disabled={loading}
          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#64748b', fontFamily: 'inherit' }}
        >
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>
          Analysing case with AI...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Raw text fallback — when AI returns plain text */}
      {!loading && !error && rawText && !data && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 14 }}>Verdict Probability</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <ScoreCard color="#22c55e" value="—" title="Favorable" />
              <ScoreCard color="#f59e0b" value="—" title="Partial"   />
              <ScoreCard color="#ef4444" value="—" title="Adverse"   />
            </div>
          </div>

          <div style={{ height: 1, background: '#e2e8f0', margin: '20px 0' }} />

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <i className="ti ti-sparkles" style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 700, color: '#2563eb' }}>AI Analysis</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {rawText}
            </p>
          </div>
        </>
      )}

      {/* Structured JSON data */}
      {!loading && !error && data && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 14 }}>Verdict Probability</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <ScoreCard color="#22c55e" value={favorable !== null ? `${favorable}%` : '—'} title="Favorable" />
              <ScoreCard color="#f59e0b" value={partial   !== null ? `${partial}%`   : '—'} title="Partial"   />
              <ScoreCard color="#ef4444" value={adverse   !== null ? `${adverse}%`   : '—'} title="Adverse"   />
            </div>
          </div>

          <div style={{ height: 1, background: '#e2e8f0', margin: '20px 0' }} />

          <div>
            <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Case Killer</div>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, fontSize: 14 }}>
              {data?.keyWeaknesses?.[0] ?? 'No weaknesses identified.'}
            </p>
          </div>

          <div style={{ height: 1, background: '#e2e8f0', margin: '22px 0' }} />

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <i className="ti ti-sparkles" style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 700, color: '#2563eb' }}>AI Recommendation</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
              {data?.nextSteps?.[0] ?? 'No recommendation available.'}
            </p>
          </div>

          {data?.keyStrengths && data.keyStrengths.length > 0 && (
            <>
              <div style={{ height: 1, background: '#e2e8f0', margin: '22px 0' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Key Strengths</div>
                {data.keyStrengths.map((s: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                    <i className="ti ti-circle-check" style={{ color: '#10b981', flexShrink: 0 }} />
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}

          {data?.coreFacts && (
            <>
              <div style={{ height: 1, background: '#e2e8f0', margin: '22px 0' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 8 }}>Core Facts</div>
                <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                  {data.coreFacts}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* No case selected */}
      {!loading && !error && !rawText && !data && !selectedCaseId && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>
          Select a case to see risk assessment
        </div>
      )}
    </div>
  )
}

function ScoreCard({ value, title, color }: { value: string; title: string; color: string }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, textAlign: 'center', background: '#f8fafc' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#64748b' }}>{title}</div>
    </div>
  )
}
