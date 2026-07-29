'use client'

import React, { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { MotionButton } from '@/components/ui/Motion'
import { MotionCard } from '@/components/ui/Motion'
import { useCaseStore } from '@/lib/store'
import { aiApi } from '@/lib/api'
import DraftTypeSelector from './DraftTypeSelector'
import StrategicNotes from './StrategicNotes'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
}

const DRAFT_TYPES = [
  'Divorce Petition',
  'Maintenance Application',
  'Custody Petition',
  'Injunction Application',
  'Written Statement',
  'Vakalatnama',
  'Affidavit',
  'Legal Notice',
]

export default function DraftsTab() {
  const { selectedCaseId } = useCaseStore()
  const [draftType,    setDraftType]    = useState('Divorce Petition')
  const [instructions, setInstructions] = useState('')
  const [draft,        setDraft]        = useState('')
  const [generating,   setGenerating]   = useState(false)
  const [error,        setError]        = useState('')
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  async function handleGenerate() {
    if (!selectedCaseId) {
      setError('Please select a case first from the dashboard.')
      return
    }
    setGenerating(true)
    setError('')
    setDraft('')
    try {
      const res = await aiApi.getDraft(selectedCaseId, {
        draftType,
        instructions,
      })
      setDraft(res.draft ?? res.result ?? '')
    } catch (err: any) {
      setError(err.message || 'Failed to generate draft. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy() {
    if (draft) {
      navigator.clipboard.writeText(draft)
    }
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
          <span className="glass-pill" style={{ fontSize: 11, padding: '4px 10px', fontWeight: 600, background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            Family and Matrimonial
          </span>

          {/* Draft Type Selector */}
          <div style={{ position: 'relative' }}>
            <MotionButton
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
            >
              {draftType} ▾
            </MotionButton>
            {showTypeMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 200 }}>
                {DRAFT_TYPES.map(t => (
                  <div
                    key={t}
                    onClick={() => { setDraftType(t); setShowTypeMenu(false) }}
                    style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: t === draftType ? '#1e40af' : '#0f172a', background: t === draftType ? '#eff6ff' : 'transparent', fontWeight: t === draftType ? 600 : 400 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = t === draftType ? '#eff6ff' : 'transparent')}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <MotionButton
            onClick={handleGenerate}
            disabled={generating}
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

          {/* Draft Type */}
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Document Type</div>
            <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
              {draftType}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Special Instructions</div>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Add any special instructions for this draft... e.g. Include prayer for interim maintenance, mention BMW purchase as evidence of income concealment"
              rows={6}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#0f172a', background: 'rgba(255,255,255,0.8)' }}
            />
          </div>

          {/* Tips */}
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: 16, padding: 16, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>💡 Tips for better drafts</div>
            {[
              'Add hearing dates and judge observations',
              'Mention key evidence in case details',
              'Specify the relief you are seeking',
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
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Generated — {draftType}
              </span>
              {draft && (
                <button
                  onClick={handleCopy}
                  style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#64748b', fontFamily: 'inherit' }}
                >
                  Copy
                </button>
              )}
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              {generating && (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 13 }}>
                  <div style={{ marginBottom: 12 }}>⚖️ Generating {draftType}...</div>
                  <div style={{ fontSize: 11 }}>This may take 15-20 seconds</div>
                </div>
              )}

              {!generating && !draft && (
                <div style={{ background: '#ffffff', borderRadius: 16, padding: '32px 40px', minHeight: 600, fontFamily: 'serif', color: '#1e293b', fontSize: 14, lineHeight: 1.8, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                    <i className="ti ti-file-text" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No draft generated yet</div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>Select a document type and click Generate</div>
                  </div>
                </div>
              )}

              {!generating && draft && (
                <div style={{ background: '#ffffff', borderRadius: 16, padding: '32px 40px', minHeight: 600, fontFamily: 'serif', color: '#1e293b', fontSize: 14, lineHeight: 1.8, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', whiteSpace: 'pre-wrap' }}>
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
