'use client'
// src/components/dashboard/AIInsights.tsx
// EXACT SAME UI — added Verified Sources section at bottom

import { useState } from 'react'
import { useCaseStore, useUIStore } from '@/lib/store'
import { aiApi } from '@/lib/api'

const URGENT = [
  { dot: '#ef4444', text: 'Income proof missing — weakens maintenance claim', btn: 'Fix now',  bBg: '#fef2f2', bClr: '#991b1b' },
  { dot: '#f59e0b', text: 'Limitation expires in 14 days',                   btn: 'Draft',    bBg: '#fef3c7', bClr: '#92400e' },
]
const RECS = [
  { dot: '#10b981', text: 'Similar SC judgment supports cruelty ground',    btn: 'View',     bBg: '#f0fdf4', bClr: '#15803d' },
  { dot: '#3b82f6', text: 'Generate written statement — respondent overdue', btn: 'Generate', bBg: '#eff6ff', bClr: '#1e40af' },
]
const STRATEGY = ['Push for ex-parte maintenance at next hearing', 'Secure Dr. Mehta witness before 20 Jun']

// ✅ NEW — Verified sources for AIInsights panel
const VERIFIED_SOURCES = [
  {
    citation:   'Rajnesh v. Neha (2020) SC',
    verified:   true,
    source:     'SCC Online',
    url:        'https://indiankanoon.org/search/?formInput=Rajnesh+v+Neha+2020',
  },
  {
    citation:   'V. Bhagat v. D. Bhagat (1994) SC',
    verified:   true,
    source:     'Supreme Court',
    url:        'https://indiankanoon.org/search/?formInput=V+Bhagat+v+D+Bhagat+1994',
  },
  {
    citation:   'Bhandari v. Bhandari (2019) BHC',
    verified:   false,
    source:     'Not verified',
    url:        null,
  },
]

const PLACEHOLDERS: Record<string, string> = {
  en: 'Ask Clausio AI about this case...',
  hi: 'इस केस के बारे में Clausio AI से पूछें...',
  mr: 'या केसबद्दल Clausio AI ला विचारा...',
  gu: 'આ કેસ વિશે Clausio AI ને પૂછો...',
  ta: 'இந்த வழக்கைப் பற்றி Clausio AI கேளுங்கள்...',
  te: 'ఈ కేసు గురించి Clausio AI ని అడగండి...',
  kn: 'ಈ ಕೇಸ್ ಬಗ್ಗೆ Clausio AI ಅನ್ನು ಕೇಳಿ...',
}

export default function AIInsights() {

  const { selectedCaseId } = useCaseStore()
  const { language }       = useUIStore()

  const [query,    setQuery]    = useState('')
  const [response, setResponse] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleAsk() {
    if (!query.trim()) return
    setLoading(true)
    setResponse('')

    try {
      const data = await aiApi.chat({ message: query, caseId: selectedCaseId || undefined })
      setResponse(data.result ?? 'No response')
    } catch {
      setResponse('Error getting AI response.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>

      {/* Header — UNCHANGED */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <i className="ti ti-brain" style={{ fontSize: 13, color: '#7c3aed' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', flex: 1 }}>AI insights</span>
        
         
        <span style={{ fontSize: 8, background: '#eff6ff', color: '#1e40af', padding: '1px 5px', borderRadius: 8, fontWeight: 600 }}>5 new</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>

        {/* Success probability — UNCHANGED */}
        <div style={{ background: '#f5f3ff', borderRadius: 7, padding: '7px 9px', marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: '#7c3aed', fontWeight: 600, marginBottom: 2 }}>Case success probability</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>78%</div>
          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
            <div style={{ width: '78%', height: 4, background: '#10b981', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>Strong evidence · 3 SC precedents found</div>
        </div>

        {/* Urgent — UNCHANGED */}
        <p style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>Urgent</p>
        {URGENT.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, padding: '5px 0', borderBottom: i < URGENT.length - 1 ? '1px solid #f8fafc' : 'none' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.dot, flexShrink: 0, marginTop: 3 }} />
            <div>
              <p style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{r.text}</p>
              <button style={{ marginTop: 3, fontSize: 9, padding: '2px 5px', borderRadius: 4, border: 'none', background: r.bBg, color: r.bClr, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>{r.btn}</button>
            </div>
          </div>
        ))}

        {/* Recommended — UNCHANGED */}
        <p style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600, marginTop: 8 }}>Recommended</p>
        {RECS.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, padding: '5px 0', borderBottom: i < RECS.length - 1 ? '1px solid #f8fafc' : 'none' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.dot, flexShrink: 0, marginTop: 3 }} />
            <div>
              <p style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{r.text}</p>
              <button style={{ marginTop: 3, fontSize: 9, padding: '2px 5px', borderRadius: 4, border: 'none', background: r.bBg, color: r.bClr, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>{r.btn}</button>
            </div>
          </div>
        ))}

        {/* Strategy — UNCHANGED */}
        <p style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600, marginTop: 8 }}>Strategy</p>
        {STRATEGY.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, padding: '5px 0', borderBottom: i < STRATEGY.length - 1 ? '1px solid #f8fafc' : 'none' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: 3 }} />
            <p style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{s}</p>
          </div>
        ))}

        {/* ✅ NEW — Verified Sources Section */}
        <p style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 600, marginTop: 10 }}>
          Verified Sources
        </p>
        {VERIFIED_SOURCES.map((source, i) => (
          <div key={i} style={{ padding: '5px 0', borderBottom: i < VERIFIED_SOURCES.length - 1 ? '1px solid #f8fafc' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <span style={{ fontSize: 9 }}>{source.verified ? '✅' : '⚠️'}</span>
              <p style={{ fontSize: 10, color: '#374151', margin: 0, flex: 1, lineHeight: 1.4 }}>{source.citation}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 14 }}>
              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, fontWeight: 600, background: source.verified ? '#f0fdf4' : '#fef3c7', color: source.verified ? '#15803d' : '#d97706' }}>
                {source.source}
              </span>
              {source.url && (
                <button
                  onClick={() => window.open(source.url!, '_blank')}
                  style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, border: 'none', background: '#eff6ff', color: '#1e40af', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
                >
                  View →
                </button>
              )}
            </div>
            {/* Warning if not verified */}
            {!source.verified && (
              <p style={{ fontSize: 9, color: '#d97706', margin: '2px 0 0 14px' }}>
                Manual verification required
              </p>
            )}
          </div>
        ))}

        {/* AI Response */}
        {response && (
          <div style={{ marginTop: 10, padding: '8px 10px', background: '#f5f3ff', borderRadius: 8, border: '1px solid #e9d5ff' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>AI Response</div>
            <p style={{ fontSize: 10, color: '#374151', lineHeight: 1.6, margin: 0 }}>{response}</p>
          </div>
        )}
      </div>

      {/* Ask AI — with send button */}
      <div style={{ borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder={PLACEHOLDERS[language]}
            style={{ flex: 1, padding: '5px 8px', border: 'none', background: 'transparent', fontSize: 10, fontFamily: 'inherit', outline: 'none', color: '#374151' }}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: loading ? '#e2e8f0' : '#7c3aed', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {loading
              ? <i className="ti ti-loader" style={{ fontSize: 10 }} />
              : <i className="ti ti-send" style={{ fontSize: 10 }} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
