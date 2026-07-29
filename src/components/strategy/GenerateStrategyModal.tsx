'use client'
// src/components/strategy/GenerateStrategyModal.tsx
// EXACT SAME UI — only Generate Strategy button now calls real backend

import { useState } from 'react'
import { useCaseStore } from '@/lib/store'
import { aiApi, actionPlansApi, researchApi, contradictionsApi, parseAiJson } from '@/lib/api'
import type { ActionPlanItem, Judgment, Contradiction } from '@/types/AIResponse'

interface Props {
  onClose:      () => void
  onGenerated?: () => void // ✅ NEW — called after successful generation
}

export default function GenerateStrategyModal({ onClose, onGenerated }: Props) {
  const { selectedCaseId } = useCaseStore()

  const [objective,         setObjective]         = useState('Win Interim Maintenance')
  const [depth,             setDepth]             = useState('Detailed')
  const [jurisdiction,      setJurisdiction]      = useState('Family Court')
  const [notes,             setNotes]             = useState('')
  const [includeCaseLaw,    setIncludeCaseLaw]    = useState(true)
  const [includeRisk,       setIncludeRisk]       = useState(true)
  const [includeCross,      setIncludeCross]      = useState(true)
  const [includeDocuments,  setIncludeDocuments]  = useState(true)

  const [generating, setGenerating] = useState(false) // ✅ NEW
  const [error,      setError]      = useState('')     // ✅ NEW

  // ✅ CHANGED: Generate Strategy button now calls real backend and persists structured results
  async function handleGenerate() {
    if (!selectedCaseId) {
      setError('Please select a case first from the dashboard.')
      return
    }

    setGenerating(true)
    setError('')

    try {
      // Call all AI endpoints in parallel — each returns { result: "<plain text or JSON>" }
      const [actionPlanRes, researchRes, contradictionsRes] = await Promise.all([
        aiApi.getActionPlan(selectedCaseId),
        aiApi.getLegalResearch(selectedCaseId),
        aiApi.getContradictions(selectedCaseId),
      ])

      const actionItems    = parseAiJson<ActionPlanItem[]>(actionPlanRes.actionPlan ?? actionPlanRes.result ?? '') ?? []
      const judgments      = parseAiJson<Judgment[]>(researchRes.judgments ?? researchRes.result ?? '') ?? []
      const contradictions = parseAiJson<Contradiction[]>(contradictionsRes.contradictions ?? contradictionsRes.result ?? '') ?? []

      // Persist structured results into the case's records so the other tabs can load them
      await Promise.all([
        ...actionItems.map(item => actionPlansApi.create(selectedCaseId, {
          title:       item.title,
          description: item.description,
          priority:    item.priority,
          dueBy:       item.dueBy,
          assignedTo:  item.assignedTo,
        })),
        ...judgments.map(j => researchApi.create(selectedCaseId, {
          citation:        j.citation,
          court:           j.court,
          year:            j.year,
          ratioDecidendi:  j.ratioDecidendi,
          relevance:       j.relevance,
          howToUse:        j.howToUse,
          strength:        j.strength,
          fullJudgmentUrl: j.fullJudgmentUrl,
        })),
        ...contradictions.map(c => contradictionsApi.create(selectedCaseId, {
          claim:          c.claim,
          claimSource:    c.claimSource,
          evidence:       c.evidence,
          evidenceSource: c.evidenceSource,
          courtArgument:  c.courtArgument,
          strength:       c.strength,
        })),
      ])

      onGenerated?.()
    } catch (err: any) {
      setError(err.message || 'Error generating strategy. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 760, background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>

        {/* Header — UNCHANGED */}
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Generate AI Strategy</h2>
            <p style={{ marginTop: 6, fontSize: 14, color: '#64748b' }}>Configure the litigation strategy you want Clausio AI to prepare.</p>
          </div>
          <button onClick={onClose} style={closeButton}>✕</button>
        </div>

        {/* Body — UNCHANGED */}
        <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>

          <Field label="Primary Objective">
            <input value={objective} onChange={(e) => setObjective(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Analysis Depth">
            <select value={depth} onChange={(e) => setDepth(e.target.value)} style={inputStyle}>
              <option>Quick</option>
              <option>Detailed</option>
              <option>Senior Counsel Level</option>
            </select>
          </Field>

          <Field label="Court / Jurisdiction">
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} style={inputStyle}>
              <option>Family Court</option>
              <option>District Court</option>
              <option>High Court</option>
              <option>Supreme Court</option>
            </select>
          </Field>

          <Field label="Expected Outcome">
            <select style={inputStyle}>
              <option>Settlement</option>
              <option>Interim Relief</option>
              <option>Final Decree</option>
              <option>Dismissal</option>
            </select>
          </Field>

          <div style={{ gridColumn: '1 / span 2' }}>
            <Field label="Include in Strategy">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Check checked={includeCaseLaw}   onChange={() => setIncludeCaseLaw(!includeCaseLaw)}     label="Relevant Case Laws"   />
                <Check checked={includeRisk}      onChange={() => setIncludeRisk(!includeRisk)}           label="Risk Assessment"      />
                <Check checked={includeCross}     onChange={() => setIncludeCross(!includeCross)}         label="Cross Examination"    />
                <Check checked={includeDocuments} onChange={() => setIncludeDocuments(!includeDocuments)} label="Document Checklist"   />
              </div>
            </Field>
          </div>

          <div style={{ gridColumn: '1 / span 2' }}>
            <Field label="Additional Instructions">
              <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Example: Focus on maintenance claim, anticipate Respondent's defence, identify missing evidence..." style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
          </div>

          {/* Error — NEW */}
          {error && (
            <div style={{ gridColumn: '1 / span 2', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* AI Preview — UNCHANGED */}
          <div style={{ gridColumn: '1 / span 2', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 18 }}>
            <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 10 }}>AI will generate</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, color: '#334155' }}>
              <li>Case Strength & Weakness Analysis</li>
              <li>Risk Assessment</li>
              <li>Winning Probability</li>
              <li>Recommended Next Steps</li>
              <li>Document Gaps</li>
              <li>Relevant Case Laws</li>
              <li>Cross Examination Suggestions</li>
              <li>30-Day Action Plan</li>
            </ul>
          </div>
        </div>

        {/* Footer — UNCHANGED except button calls real API */}
        <div style={{ padding: 22, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={secondaryButton}>Cancel</button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ ...primaryButton, opacity: generating ? 0.7 : 1, cursor: generating ? 'not-allowed' : 'pointer' }}
          >
            {generating ? '✨ Generating...' : '✨ Generate Strategy'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#334155' }}>{label}</div>
      {children}
    </div>
  )
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  )
}

const inputStyle: React.CSSProperties     = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const closeButton: React.CSSProperties    = { width: 36, height: 36, border: 'none', borderRadius: 8, background: '#f1f5f9', cursor: 'pointer' }
const secondaryButton: React.CSSProperties = { padding: '12px 22px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }
const primaryButton: React.CSSProperties  = { padding: '12px 24px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 700 }
