'use client'

import { useState, useCallback } from 'react'
import { useCaseStore } from '@/lib/store'
import { aiApi, parseAiJson } from '@/lib/api'

import FinancialTabs from '@/components/financial/FinancialTabs'
import IncomeReality from '@/components/financial/IncomeReality'
import MaintenanceRange from '@/components/financial/MaintenanceRange'
import MaintenanceCalculator from '@/components/financial/MaintenanceCalculator'
import SettlementCalculator from '@/components/financial/SettlementCalculator'
import AnalyzeFinancialModal from '@/components/financial/AnalyzeFinancialModal'

export default function FinancialPage() {
  const { selectedCaseId } = useCaseStore()
  const [activeTab, setActiveTab] = useState('Financial Intelligence')
  const [showModal, setShowModal] = useState(false)

  const [analysis,  setAnalysis]  = useState<any>(null)
  const [rawText,   setRawText]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const analyse = useCallback(async () => {
    if (!selectedCaseId) { setError('Select a case first.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await aiApi.getFinancial(selectedCaseId)
      const raw    = res.analysis ?? res.result ?? ''
      const parsed = parseAiJson<any>(raw)
      setAnalysis(parsed)
      setRawText(parsed ? '' : raw)
    } catch (err: any) {
      setError(err.message || 'Failed to analyse financials')
    } finally {
      setLoading(false)
    }
  }, [selectedCaseId])

  return (
    <>
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', margin: '16px', padding: 20, borderRadius: 24 }}>
        {/* ================= HEADER ================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Financial Intelligence
            </h1>
            <p style={{ marginTop: 4, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
              AI-powered financial investigation and maintenance analysis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Analyze Button */}
            <button
              className="glass-button"
              onClick={() => setShowModal(true)}
              style={{ padding: '0 16px', height: 38, borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
            >
              <i className="ti ti-chart-bar" />
              Analyse
            </button>
          </div>
        </div>

        {/* ================= Tabs ================= */}

        <FinancialTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626', marginTop: 16 }}>
            {error}
          </div>
        )}

        {/* ================= Content ================= */}

        <div style={{ marginTop: 24 }}>

          {activeTab === 'Financial Intelligence' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '42% 58%',
                gap: 24,
              }}
            >
              <IncomeReality analysis={analysis} rawText={rawText} loading={loading} />

              <MaintenanceRange analysis={analysis} rawText={rawText} loading={loading} caseId={selectedCaseId} />
            </div>
          )}

          {activeTab === 'Maintenance Calculator' && (
            <MaintenanceCalculator caseId={selectedCaseId} />
          )}

          {activeTab === 'Settlement Calculator' && (
            <SettlementCalculator caseId={selectedCaseId} />
          )}

        </div>
      </div>

      {/* ================= Modal ================= */}

      {showModal && (
        <AnalyzeFinancialModal
          onClose={() => setShowModal(false)}
          onAnalyse={async () => {
            await analyse()
            setShowModal(false)
          }}
        />
      )}
    </>
  )
}
