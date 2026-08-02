'use client'

import { useState } from 'react'
import { useCaseStore } from '@/lib/store'
import { readinessApi } from '@/lib/api'

interface Props {
  onClose:     () => void
  onGenerated?: () => void
}

export default function GenerateReadinessModal({ onClose, onGenerated }: Props) {
  const { selectedCaseId } = useCaseStore()

  // ── Hearing details ──────────────────────────────────────────
  const [hearingType,    setHearingType]    = useState('Interim Application')
  const [hearingDate,    setHearingDate]    = useState('')
  const [court,          setCourt]          = useState('Family Court')
  const [judge,          setJudge]          = useState('')
  const [objective,      setObjective]      = useState('')
  const [urgency,        setUrgency]        = useState('Normal')

  // ── Case status ──────────────────────────────────────────────
  const [currentStage,   setCurrentStage]   = useState('Evidence')
  const [opposingAdv,    setOpposingAdv]    = useState('')
  const [lastOrderDate,  setLastOrderDate]  = useState('')
  const [lastOrderText,  setLastOrderText]  = useState('')
  const [pendingIssues,  setPendingIssues]  = useState('')

  // ── Evidence status ──────────────────────────────────────────
  const [docsUploaded,   setDocsUploaded]   = useState('Yes')
  const [exhibitsLabelled, setExhibitsLabelled] = useState('Partially')
  const [section65B,     setSection65B]     = useState('No')
  const [missingDocs,    setMissingDocs]    = useState('')

  // ── Witnesses ────────────────────────────────────────────────
  const [witnessesIdentified, setWitnessesIdentified] = useState('Yes')
  const [witnessesSummoned,   setWitnessesSummoned]   = useState('No')
  const [expertWitness,       setExpertWitness]       = useState('No')
  const [witnessNotes,        setWitnessNotes]        = useState('')

  // ── Legal research ───────────────────────────────────────────
  const [judgmentsPrepared,  setJudgmentsPrepared]  = useState('Partially')
  const [writtenArgs,        setWrittenArgs]        = useState('No')
  const [keyLegalIssues,     setKeyLegalIssues]     = useState('')

  // ── Client ───────────────────────────────────────────────────
  const [clientBriefed,  setClientBriefed]  = useState('Yes')
  const [clientDocs,     setClientDocs]     = useState('Yes')
  const [clientConcerns, setClientConcerns] = useState('')

  // ── Additional ───────────────────────────────────────────────
  const [courtFeesPaid,  setCourtFeesPaid]  = useState('Yes')
  const [prevOrderComplied, setPrevOrderComplied] = useState('Yes')
  const [specialInstructions, setSpecialInstructions] = useState('')

  const [generating, setGenerating] = useState(false)
  const [error,      setError]      = useState('')
  const [step,       setStep]       = useState(1)
  const TOTAL_STEPS = 4

  async function handleGenerate() {
    if (!selectedCaseId) { setError('Select a case first.'); return }
    setGenerating(true)
    setError('')
    try {
      await readinessApi.generate(selectedCaseId)
      onGenerated?.()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to generate readiness report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 820, background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.3)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Generate Case Readiness Report</h2>
            <p style={{ marginTop: 4, fontSize: 13, color: '#64748b' }}>
              Answer these questions accurately — AI uses them to score your case readiness
            </p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, border: 'none', borderRadius: 8, background: '#f1f5f9', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '12px 28px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: s <= step ? '#2563eb' : '#e2e8f0', color: s <= step ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer' }} onClick={() => setStep(s)}>
                  {s}
                </div>
                <span style={{ fontSize: 11, color: s === step ? '#2563eb' : '#94a3b8', fontWeight: s === step ? 600 : 400 }}>
                  {s === 1 ? 'Hearing' : s === 2 ? 'Evidence' : s === 3 ? 'Witnesses & Research' : 'Compliance'}
                </span>
                {s < 4 && <div style={{ width: 24, height: 2, background: s < step ? '#2563eb' : '#e2e8f0' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ padding: 28, overflowY: 'auto', flex: 1 }}>

          {/* ── STEP 1: Hearing Details ── */}
          {step === 1 && (
            <div>
              <SectionTitle icon="⚖️" title="Upcoming Hearing Details" subtitle="Tell us about the next hearing" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Hearing Type *">
                  <select value={hearingType} onChange={e => setHearingType(e.target.value)} style={inputStyle}>
                    <option>Interim Application</option>
                    <option>Evidence Recording</option>
                    <option>Cross Examination</option>
                    <option>Arguments</option>
                    <option>Final Hearing</option>
                    <option>Mediation / Lok Adalat</option>
                    <option>Mention / Directions</option>
                    <option>Pronouncement of Judgment</option>
                  </select>
                </Field>
                <Field label="Next Hearing Date">
                  <input type="date" value={hearingDate} onChange={e => setHearingDate(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Court *">
                  <select value={court} onChange={e => setCourt(e.target.value)} style={inputStyle}>
                    <option>Family Court</option>
                    <option>District Court</option>
                    <option>Sessions Court</option>
                    <option>High Court</option>
                    <option>Supreme Court</option>
                    <option>Consumer Forum</option>
                    <option>Labour Court</option>
                    <option>Commercial Court</option>
                  </select>
                </Field>
                <Field label="Judge Name (if known)">
                  <input type="text" value={judge} onChange={e => setJudge(e.target.value)} placeholder="e.g. Hon. Justice Mehta" style={inputStyle} />
                </Field>
                <Field label="Primary Objective for this Hearing *">
                  <input type="text" value={objective} onChange={e => setObjective(e.target.value)} placeholder="e.g. Secure interim maintenance order" style={inputStyle} />
                </Field>
                <Field label="Urgency Level">
                  <select value={urgency} onChange={e => setUrgency(e.target.value)} style={inputStyle}>
                    <option>Normal</option>
                    <option>Urgent</option>
                    <option>Emergency</option>
                  </select>
                </Field>
                <Field label="Current Stage of Case">
                  <select value={currentStage} onChange={e => setCurrentStage(e.target.value)} style={inputStyle}>
                    <option>Filing</option>
                    <option>Service / Notice</option>
                    <option>Written Statement</option>
                    <option>Interim Application</option>
                    <option>Evidence</option>
                    <option>Cross Examination</option>
                    <option>Arguments</option>
                    <option>Judgment Reserved</option>
                  </select>
                </Field>
                <Field label="Opposing Advocate Name">
                  <input type="text" value={opposingAdv} onChange={e => setOpposingAdv(e.target.value)} placeholder="e.g. Adv. Rajesh Patel" style={inputStyle} />
                </Field>
              </div>
              <div style={{ marginTop: 16 }}>
                <Field label="Last Order Passed by Court (summarise)">
                  <textarea rows={3} value={lastOrderText} onChange={e => setLastOrderText(e.target.value)} placeholder="e.g. Respondent directed to file reply by 15 Aug. Petitioner to file rejoinder within 7 days thereafter." style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
              </div>
              <div style={{ marginTop: 16 }}>
                <Field label="Pending Issues / What needs to happen today">
                  <textarea rows={3} value={pendingIssues} onChange={e => setPendingIssues(e.target.value)} placeholder="e.g. Reply not yet filed by Respondent. Need to press for direction. Discovery application for bank statements pending." style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 2: Evidence & Documents ── */}
          {step === 2 && (
            <div>
              <SectionTitle icon="📄" title="Evidence & Documents" subtitle="Assessment of your documentary evidence" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Key documents uploaded to case?">
                  <select value={docsUploaded} onChange={e => setDocsUploaded(e.target.value)} style={inputStyle}>
                    <option>Yes — all uploaded</option>
                    <option>Partially — some missing</option>
                    <option>No — none uploaded</option>
                  </select>
                </Field>
                <Field label="Exhibits properly labelled (Ex. A, B, C)?">
                  <select value={exhibitsLabelled} onChange={e => setExhibitsLabelled(e.target.value)} style={inputStyle}>
                    <option>Yes — all labelled</option>
                    <option>Partially — some labelled</option>
                    <option>No — not labelled</option>
                  </select>
                </Field>
                <Field label="Section 65B certificate obtained for digital evidence?">
                  <select value={section65B} onChange={e => setSection65B(e.target.value)} style={inputStyle}>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Not applicable</option>
                    <option>In process</option>
                  </select>
                </Field>
                <Field label="Certified copies obtained from court/registry?">
                  <select style={inputStyle}>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Not required</option>
                  </select>
                </Field>
              </div>
              <div style={{ marginTop: 16 }}>
                <Field label="Missing documents — what needs to be obtained?">
                  <textarea rows={4} value={missingDocs} onChange={e => setMissingDocs(e.target.value)} placeholder="e.g. Hospital records from Lilavati not yet obtained. Bank statements of Respondent pending via discovery application. BMW RC Book certified copy needed from RTO." style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
              </div>
              <div style={{ marginTop: 16 }}>
                <SectionTitle icon="💰" title="Financial Evidence" subtitle="For matrimonial / maintenance cases" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Income documents of Respondent available?">
                    <select style={inputStyle}>
                      <option>Yes — ITR and salary slips obtained</option>
                      <option>Partially — some documents</option>
                      <option>No — discovery application needed</option>
                      <option>Not applicable</option>
                    </select>
                  </Field>
                  <Field label="Lifestyle / asset evidence available?">
                    <select style={inputStyle}>
                      <option>Yes — property, vehicle, investments</option>
                      <option>Partially</option>
                      <option>No</option>
                      <option>Not applicable</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Witnesses & Research ── */}
          {step === 3 && (
            <div>
              <SectionTitle icon="👥" title="Witnesses" subtitle="Witness preparation status" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="All witnesses identified?">
                  <select value={witnessesIdentified} onChange={e => setWitnessesIdentified(e.target.value)} style={inputStyle}>
                    <option>Yes</option>
                    <option>Partially</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Witness summons issued and served?">
                  <select value={witnessesSummoned} onChange={e => setWitnessesSummoned(e.target.value)} style={inputStyle}>
                    <option>Yes — all served</option>
                    <option>Partially served</option>
                    <option>No — not yet issued</option>
                    <option>Not required yet</option>
                  </select>
                </Field>
                <Field label="Expert witness required?">
                  <select value={expertWitness} onChange={e => setExpertWitness(e.target.value)} style={inputStyle}>
                    <option>No</option>
                    <option>Yes — already arranged</option>
                    <option>Yes — not yet arranged</option>
                  </select>
                </Field>
                <Field label="Witnesses briefed and prepared?">
                  <select style={inputStyle}>
                    <option>Yes</option>
                    <option>Partially</option>
                    <option>No</option>
                  </select>
                </Field>
              </div>
              <div style={{ marginTop: 12 }}>
                <Field label="Notes on key witnesses (who, what they will prove)">
                  <textarea rows={3} value={witnessNotes} onChange={e => setWitnessNotes(e.target.value)} placeholder="e.g. Dr. Mehta from Lilavati — will prove assault injuries. Petitioner's mother — eyewitness to cruelty incident of 12 Aug." style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
              </div>

              <div style={{ marginTop: 24 }}>
                <SectionTitle icon="📚" title="Legal Research & Arguments" subtitle="Preparation of legal arguments" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Relevant judgments identified?">
                    <select value={judgmentsPrepared} onChange={e => setJudgmentsPrepared(e.target.value)} style={inputStyle}>
                      <option>Yes — all researched and printed</option>
                      <option>Partially — some done</option>
                      <option>No — not yet done</option>
                    </select>
                  </Field>
                  <Field label="Written arguments / notes prepared?">
                    <select value={writtenArgs} onChange={e => setWrittenArgs(e.target.value)} style={inputStyle}>
                      <option>Yes — complete</option>
                      <option>Partially — draft ready</option>
                      <option>No — not yet started</option>
                    </select>
                  </Field>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Field label="Key legal issues to be argued today">
                    <textarea rows={3} value={keyLegalIssues} onChange={e => setKeyLegalIssues(e.target.value)} placeholder="e.g. (1) Cruelty under Section 13(1)(ia) HMA — physical assault on 12.08.2020. (2) Income concealment by Respondent — BMW purchase on Rs 22L income. (3) Interim maintenance quantum under Rajnesh v. Neha." style={{ ...inputStyle, resize: 'vertical' }} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Compliance & Client ── */}
          {step === 4 && (
            <div>
              <SectionTitle icon="✅" title="Procedural Compliance" subtitle="Court compliance and administrative status" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Court fees paid for all applications?">
                  <select value={courtFeesPaid} onChange={e => setCourtFeesPaid(e.target.value)} style={inputStyle}>
                    <option>Yes</option>
                    <option>No — pending</option>
                    <option>Not applicable</option>
                  </select>
                </Field>
                <Field label="Previous court orders complied with?">
                  <select value={prevOrderComplied} onChange={e => setPrevOrderComplied(e.target.value)} style={inputStyle}>
                    <option>Yes — all complied</option>
                    <option>Partially complied</option>
                    <option>No — non-compliance</option>
                    <option>No orders pending</option>
                  </select>
                </Field>
                <Field label="Vakalatnama filed?">
                  <select style={inputStyle}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Certified copies of previous orders obtained?">
                  <select style={inputStyle}>
                    <option>Yes</option>
                    <option>No — to be obtained</option>
                    <option>Not required</option>
                  </select>
                </Field>
              </div>

              <div style={{ marginTop: 24 }}>
                <SectionTitle icon="👤" title="Client Status" subtitle="Client preparation and cooperation" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Client briefed about next hearing?">
                    <select value={clientBriefed} onChange={e => setClientBriefed(e.target.value)} style={inputStyle}>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </Field>
                  <Field label="Client provided all required documents?">
                    <select value={clientDocs} onChange={e => setClientDocs(e.target.value)} style={inputStyle}>
                      <option>Yes</option>
                      <option>Partially</option>
                      <option>No — follow up needed</option>
                    </select>
                  </Field>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Field label="Client concerns or specific instructions">
                    <textarea rows={3} value={clientConcerns} onChange={e => setClientConcerns(e.target.value)} placeholder="e.g. Client is very anxious about custody. Wants to ensure child sees her before next hearing. Client has new evidence about Respondent's Dubai trip." style={{ ...inputStyle, resize: 'vertical' }} />
                  </Field>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <SectionTitle icon="📝" title="Special Instructions for AI" subtitle="Any additional context for the readiness assessment" />
                <Field label="Special instructions (optional)">
                  <textarea rows={4} value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="e.g. Focus on financial evidence gaps. Judge has been impatient with delays. Opposing counsel is known for aggressive cross-examination. We need to address the delay in filing the complaint." style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
              </div>

              {/* AI will generate */}
              <div style={{ marginTop: 20, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 10 }}>✨ Clausio AI will generate</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    'Overall Readiness Score (0-100)',
                    'Evidence strength assessment',
                    'Critical gaps with severity',
                    'Case strengths identified',
                    'Witness preparation status',
                    'Missing documents checklist',
                    'Procedural compliance check',
                    'Recommended next actions',
                    'Adjournment recommendation',
                    'Judge preparation notes',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#334155' }}>
                      <span style={{ color: '#2563eb' }}>✓</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={secondaryButton}>Cancel</button>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={secondaryButton}>← Back</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Step {step} of {TOTAL_STEPS}</span>
            {step < TOTAL_STEPS ? (
              <button onClick={() => setStep(s => s + 1)} style={primaryButton}>
                Next →
              </button>
            ) : (
              <button onClick={handleGenerate} disabled={generating} style={{ ...primaryButton, opacity: generating ? 0.7 : 1, cursor: generating ? 'not-allowed' : 'pointer', minWidth: 200 }}>
                {generating ? '✨ Generating report...' : '✨ Generate Readiness Report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</span>
      </div>
      <p style={{ margin: '4px 0 0 26px', fontSize: 12, color: '#64748b' }}>{subtitle}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 6, fontWeight: 600, fontSize: 12, color: '#334155' }}>{label}</div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0f172a',
}

const secondaryButton: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
}

const primaryButton: React.CSSProperties = {
  padding: '10px 24px', borderRadius: 8, border: 'none',
  background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
}
