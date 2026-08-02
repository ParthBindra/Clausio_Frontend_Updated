'use client'

import React, { useState, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import { MotionButton } from '@/components/ui/Motion'
import { MotionCard } from '@/components/ui/Motion'
import { useCaseStore } from '@/lib/store'
import { aiApi, casesApi } from '@/lib/api'
import CaseTypeBadge from '@/components/ui/CaseTypeBadge'
import { getDraftTypesForCase, type DraftType } from '@/lib/draftTypes'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function DraftsTab() {
  const { selectedCaseId } = useCaseStore()

  const [caseType,     setCaseType]     = useState('')
  const [draftTypes,   setDraftTypes]   = useState<DraftType[]>([])
  const [draftType,    setDraftType]    = useState('')
  const [instructions, setInstructions] = useState('')
  const [draft,        setDraft]        = useState('')
  const [generating,   setGenerating]   = useState(false)
  const [error,        setError]        = useState('')
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  // ✅ Load case type when case changes
  useEffect(() => {
    if (!selectedCaseId) { setCaseType(''); setDraftTypes([]); return }
    casesApi.getById(selectedCaseId)
      .then(data => {
        const ct = data?.caseType ?? ''
        setCaseType(ct)
        const types = getDraftTypesForCase(ct)
        setDraftTypes(types)
        setDraftType(types[0]?.label ?? '')
      })
      .catch(() => {
        const types = getDraftTypesForCase('')
        setDraftTypes(types)
        setDraftType(types[0]?.label ?? '')
      })
  }, [selectedCaseId])

  const selectedDraftInfo = draftTypes.find(t => t.label === draftType)

  async function handleGenerate() {
    if (!selectedCaseId) { setError('Please select a case first.'); return }
    setGenerating(true)
    setError('')
    setDraft('')
    try {
      const res = await aiApi.getDraft(selectedCaseId, { draftType, instructions })
      setDraft(res.draft ?? res.result ?? '')
    } catch (err: any) {
      setError(err.message || 'Failed to generate draft. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy() {
    if (draft) navigator.clipboard.writeText(draft)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}
    >
      {/* Top Bar */}
      <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>Drafting</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* ✅ Dynamic case type badge */}
          <CaseTypeBadge />

          {/* ✅ Dynamic draft type selector */}
          <div style={{ position: 'relative' }}>
            <MotionButton
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600, color: '#0f172a', cursor: 'pointer', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {draftType || 'Select document type'} ▾
            </MotionButton>
            {showTypeMenu && draftTypes.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 280, maxHeight: 360, overflowY: 'auto' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {caseType || 'General'} Documents
                </div>
                {draftTypes.map(t => (
                  <div
                    key={t.label}
                    onClick={() => { setDraftType(t.label); setShowTypeMenu(false) }}
                    style={{ padding: '10px 14px', fontSize: 12, cursor: 'pointer', background: t.label === draftType ? '#eff6ff' : 'transparent', borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => { if (t.label !== draftType) (e.currentTarget.style.background = '#f8fafc') }}
                    onMouseLeave={e => { if (t.label !== draftType) (e.currentTarget.style.background = 'transparent') }}
                  >
                    <div style={{ fontWeight: 600, color: t.label === draftType ? '#1e40af' : '#0f172a' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.description}</div>
                    {t.sections.length > 0 && (
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{t.sections.slice(0,2).join(' · ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate button */}
          <MotionButton
            onClick={handleGenerate}
            disabled={generating || !selectedCaseId}
            className="ai-magic-button"
            style={{ padding: '8px 18px', fontSize: 13, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: generating ? 0.7 : 1 }}
          >
            <i className="ti ti-file-text" style={{ fontSize: 15 }} />
            {generating ? 'Generating...' : 'Generate'}
          </MotionButton>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div style={{ margin: '12px 24px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 12, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '35% 1fr', gap: 20, padding: '24px', flex: 1, overflow: 'hidden' }}>

        {/* Left — Editor */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Selected document info */}
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Document Type</div>
            <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
              {draftType || 'Select a document type'}
            </div>
            {selectedDraftInfo?.description && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>{selectedDraftInfo.description}</div>
            )}
            {selectedDraftInfo && selectedDraftInfo.sections.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selectedDraftInfo.sections.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, padding: '2px 6px', background: '#f0fdf4', color: '#15803d', borderRadius: 10, fontWeight: 600, border: '1px solid #86efac' }}>{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Special Instructions</div>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder={`Add special instructions for this ${draftType}...\ne.g. Include prayer for interim relief, mention specific dates, add particular facts`}
              rows={6}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#0f172a', background: 'rgba(255,255,255,0.8)' }}
            />
          </div>

          {/* Tips specific to document type */}
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: 16, padding: 16, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>💡 Tips for better drafts</div>
            {[
              `Clausio AI will use all case facts automatically`,
              `Add specific dates, names, and amounts in instructions`,
              `Mention any special prayers or specific relief needed`,
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>• {tip}</div>
            ))}
          </div>
        </motion.div>

        {/* Right — Preview */}
        <motion.div variants={itemVariants} style={{ height: '100%', minHeight: 0 }}>
          <MotionCard style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.3)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <i className="ti ti-file-text" style={{ fontSize: 18, color: '#3b82f6' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px', flex: 1 }}>
                {draftType || 'Generated Document'}
              </span>
              {draft && (
                <button onClick={handleCopy} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#64748b', fontFamily: 'inherit' }}>
                  📋 Copy
                </button>
              )}
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              {generating && (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 13 }}>
                  <div style={{ marginBottom: 12, fontSize: 20 }}>⚖️</div>
                  <div style={{ marginBottom: 8, fontWeight: 600 }}>Drafting {draftType}...</div>
                  <div style={{ fontSize: 11 }}>This may take 15-20 seconds</div>
                </div>
              )}

              {!generating && !draft && (
                <div style={{ background: '#ffffff', borderRadius: 16, padding: '32px 40px', minHeight: 600, fontFamily: 'serif', color: '#1e293b', fontSize: 14, lineHeight: 1.8, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                    <i className="ti ti-file-text" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No draft generated yet</div>
                    <div style={{ fontSize: 12, marginTop: 8, color: '#cbd5e1' }}>
                      {!selectedCaseId
                        ? 'Select a case first, then click Generate'
                        : `Select document type and click Generate to draft your ${draftType}`
                      }
                    </div>
                  </div>
                </div>
              )}

              {!generating && draft && (
                <div style={{ background: '#ffffff', borderRadius: 16, padding: '32px 40px', minHeight: 600, fontFamily: 'Georgia, serif', color: '#1e293b', fontSize: 14, lineHeight: 1.9, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', whiteSpace: 'pre-wrap' }}>
                  {draft}
                </div>
              )}
            </div>
          </MotionCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
