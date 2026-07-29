'use client'

import { useState } from 'react'
import { aiApi } from '@/lib/api'

interface Props {
  analysis: any
  rawText:  string
  loading:  boolean
  caseId:   string | null
}

export default function MaintenanceRange({ analysis, rawText, loading, caseId }: Props) {
  const [draft,      setDraft]      = useState('')
  const [drafting,   setDrafting]   = useState(false)
  const [draftError, setDraftError] = useState('')

  const hasData = !!(analysis || rawText)

  function formatAmount(val: any) {
    if (!val) return '—'
    return `₹${Number(val).toLocaleString('en-IN')}`
  }

  async function generateDraft() {
    if (!caseId) { setDraftError('Select a case first.'); return }
    setDrafting(true)
    setDraftError('')
    try {
      const res = await aiApi.getDraft(caseId, {
        draftType: 'Interim Maintenance Application',
        instructions: 'Based on the financial analysis for this case.'
      })
      setDraft(res.draft ?? res.result ?? '')
    } catch (err: any) {
      setDraftError(err.message || 'Failed to generate draft')
    } finally {
      setDrafting(false)
    }
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 22, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Maintenance Range</h2>
          <p style={{ marginTop: 6, fontSize: 14, color: '#64748b' }}>AI estimated maintenance recommendation.</p>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 }}>Analysing...</div>
      )}

      {!loading && !hasData && (
        <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: 13 }}>
          Run the AI analysis to see a maintenance recommendation.
        </div>
      )}

      {!loading && hasData && (
        <>
          {/* Maintenance Range Cards */}
          {analysis?.maintenanceRange && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 26 }}>
              <AmountCard
                title="Minimum"
                amount={formatAmount(analysis.maintenanceRange.minimum)}
                color="#2563eb"
                background="#eff6ff"
              />
              <AmountCard
                title="Recommended"
                amount={formatAmount(analysis.maintenanceRange.recommended)}
                color="#16a34a"
                background="#f0fdf4"
                highlight
              />
              <AmountCard
                title="Maximum"
                amount={formatAmount(analysis.maintenanceRange.maximum)}
                color="#d97706"
                background="#fff7ed"
              />
            </div>
          )}

          {/* Settlement Range */}
          {analysis?.settlementRange && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 15, marginBottom: 12 }}>Settlement Range</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                <AmountCard title="Minimum"     amount={formatAmount(analysis.settlementRange.minimum)}     color="#2563eb" background="#eff6ff" />
                <AmountCard title="Recommended" amount={formatAmount(analysis.settlementRange.recommended)} color="#16a34a" background="#f0fdf4" highlight />
                <AmountCard title="Maximum"     amount={formatAmount(analysis.settlementRange.maximum)}     color="#d97706" background="#fff7ed" />
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <i className="ti ti-sparkles" style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 700, color: '#2563eb' }}>AI Recommendation</span>
            </div>
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {analysis?.summary ?? analysis?.aiRecommendation ?? rawText ?? 'No recommendation available.'}
            </div>
          </div>

          {draftError && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {draftError}
            </div>
          )}

          {draft && (
            <div style={{ marginTop: 18, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 8 }}>Generated Draft</div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                {draft}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
            <button onClick={() => window.print()} style={secondaryButton}>
              Export
            </button>
            <button
              onClick={generateDraft}
              disabled={drafting}
              style={{ ...primaryButton, opacity: drafting ? 0.7 : 1, cursor: drafting ? 'not-allowed' : 'pointer' }}
            >
              {drafting ? 'Generating...' : 'Generate Draft'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function AmountCard({ title, amount, color, background, highlight }: { title: string; amount: string; color: string; background: string; highlight?: boolean }) {
  return (
    <div style={{ background, border: highlight ? '2px solid #16a34a' : '1px solid #e2e8f0', borderRadius: 12, padding: 18, textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{amount}</div>
    </div>
  )
}

const secondaryButton: React.CSSProperties = {
  flex: 1, padding: '12px', borderRadius: 10,
  border: '1px solid #cbd5e1', background: '#ffffff',
  cursor: 'pointer', fontWeight: 600,
}

const primaryButton: React.CSSProperties = {
  flex: 1, padding: '12px', borderRadius: 10,
  border: 'none', background: '#2563eb',
  color: '#ffffff', cursor: 'pointer', fontWeight: 700,
}
