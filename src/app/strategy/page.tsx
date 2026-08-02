'use client'

import { useState } from 'react'
import { useCaseStore } from '@/lib/store'
import StrategyTabs          from '@/components/strategy/StrategyTabs'
import RiskAssessment        from '@/components/strategy/RiskAssessment'
import ActionPlan            from '@/components/strategy/ActionPlan'
import RecommendationPanel   from '@/components/strategy/RecommendationPanel'
import LegalResearch         from '@/components/strategy/LegalResearch'
import DocumentGaps          from '@/components/strategy/DocumentGaps'
import GenerateStrategyModal from '@/components/strategy/GenerateStrategyModal'
import CaseTypeBadge         from '@/components/ui/CaseTypeBadge'

export default function StrategyPage() {
  const { selectedCaseId } = useCaseStore()
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('Risk Assessment')
  const [refresh,   setRefresh]   = useState(0)

  return (
    <>
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', margin: '16px', padding: 20, borderRadius: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Strategy
            </h1>
            <p style={{ marginTop: 4, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
              AI litigation strategy and recommendations.
            </p>
            {/* Case info */}
            {!selectedCaseId && (
              <p style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
                Select a case from the dashboard to generate strategy.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <CaseTypeBadge />
            <button
              className="glass-button"
              onClick={() => setShowModal(true)}
              disabled={!selectedCaseId}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 38, border: 'none', borderRadius: 10, cursor: selectedCaseId ? 'pointer' : 'not-allowed', background: selectedCaseId ? '#3b82f6' : '#94a3b8', color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: selectedCaseId ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none' }}
            >
              <i className="ti ti-sparkles" />
              Run AI Strategy
            </button>
          </div>
        </div>

        {/* Tabs */}
        <StrategyTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div style={{ marginTop: 24 }}>

          {activeTab === 'Risk Assessment' && (
            <div style={{ display: 'grid', gridTemplateColumns: '38% 62%', gap: 24 }}>
              <RiskAssessment key={`risk-${refresh}`} />
              <ActionPlan     key={`action-${refresh}`} />
            </div>
          )}

          {activeTab === 'Recommendations' && (
            <RecommendationPanel key={`recs-${refresh}`} />
          )}

          {activeTab === 'Action Plan' && (
            <ActionPlan key={`plan-${refresh}`} />
          )}

          {activeTab === 'Document Gaps' && (
            <DocumentGaps key={`gaps-${refresh}`} />
          )}

          {activeTab === 'Legal Research' && (
            <LegalResearch key={`research-${refresh}`} />
          )}

        </div>
      </div>

      {showModal && (
        <GenerateStrategyModal
          onClose={() => setShowModal(false)}
          onGenerated={() => {
            setShowModal(false)
            setRefresh(r => r + 1)
          }}
        />
      )}
    </>
  )
}
