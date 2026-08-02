'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCaseStore } from '@/lib/store'
import { readinessApi } from '@/lib/api'

import ReadinessTabs        from '@/components/readiness/ReadinessTabs'
import EmergencyResponse    from '@/components/readiness/EmergencyResponse'
import ReadinessScore       from '@/components/readiness/ReadinessScore'
import GapAnalysis          from '@/components/readiness/GapAnalysis'
import StrengthAnalysis     from '@/components/readiness/StrengthAnalysis'
import GenerateReadinessModal from '@/components/readiness/GenerateReadinessModal'

function parseReadiness(raw: any) {
  if (!raw) return null
  let gaps: any[]      = []
  let strengths: any[] = []

  if (raw.gapsJson) {
    try { gaps = JSON.parse(raw.gapsJson) } catch { gaps = [] }
  } else if (Array.isArray(raw.gaps)) {
    gaps = raw.gaps
  }

  if (!gaps.length && Array.isArray(raw.checklistItems)) {
    gaps = raw.checklistItems.filter((i: any) => !i.done)
  }

  if (raw.strengthsJson) {
    try { strengths = JSON.parse(raw.strengthsJson) } catch { strengths = [] }
  } else if (Array.isArray(raw.strengths)) {
    strengths = raw.strengths
  }

  if (!strengths.length && Array.isArray(raw.checklistItems)) {
    strengths = raw.checklistItems.filter((i: any) => i.done).map((i: any) => i.text ?? i.title ?? '')
  }

  return {
    ...raw,
    score:    raw.score ?? 0,
    gaps,
    strengths,
    summary:  raw.summary ?? '',
    checklistItems: raw.checklistItems ?? [],
  }
}

export default function ReadinessPage() {
  const { selectedCaseId } = useCaseStore()
  const [activeTab, setActiveTab] = useState('Overview')
  const [showModal, setShowModal] = useState(false)
  const [readiness, setReadiness] = useState<any>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const load = useCallback(() => {
    if (!selectedCaseId) return
    setLoading(true)
    setError('')
    readinessApi.getByCaseId(selectedCaseId)
      .then(data => setReadiness(parseReadiness(data)))
      .catch(err => setError(err.message || 'Failed to load readiness'))
      .finally(() => setLoading(false))
  }, [selectedCaseId])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', margin: '16px', padding: 20, borderRadius: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>Case Readiness</h1>
            <p style={{ marginTop: 4, color: '#64748b', fontSize: 13, fontWeight: 500 }}>AI readiness assessment before your next hearing.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {readiness && (
              <button onClick={load} style={{ padding: '0 14px', height: 38, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b', fontFamily: 'inherit' }}>
                ↻ Refresh
              </button>
            )}
            <button
              className="glass-button"
              onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 38, border: 'none', borderRadius: 10, cursor: 'pointer', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
            >
              <i className="ti ti-sparkles" />
              Generate AI Report
            </button>
          </div>
        </div>

        <ReadinessTabs activeTab={activeTab} onChange={setActiveTab} />

        {!selectedCaseId && (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <i className="ti ti-folder-open" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Select a case to view readiness</div>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{error}</div>
        )}

        {activeTab === 'Overview' && selectedCaseId && (
          <>
            <EmergencyResponse />
            <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: 24, marginTop: 24 }}>
              <ReadinessScore readiness={readiness} loading={loading} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <GapAnalysis readiness={readiness} loading={loading} />
                <StrengthAnalysis readiness={readiness} loading={loading} />
              </div>
            </div>
            {readiness?.summary && (
              <div style={{ marginTop: 20, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <i className="ti ti-sparkles" style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: 700, color: '#2563eb', fontSize: 13 }}>AI Assessment Summary</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{readiness.summary}</p>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <GenerateReadinessModal
          onClose={() => setShowModal(false)}
          onGenerated={() => { setShowModal(false); load() }}
        />
      )}
    </>
  )
}
