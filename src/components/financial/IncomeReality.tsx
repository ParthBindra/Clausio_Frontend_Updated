'use client'

interface Props {
  analysis: any
  rawText:  string
  loading:  boolean
}

export default function IncomeReality({ analysis, rawText, loading }: Props) {
  const suspicious: any[] = analysis?.suspiciousPatterns ?? []
  const hasData = !!(analysis || rawText)

  function formatAmount(val: any) {
    if (!val) return '—'
    return `₹${Number(val).toLocaleString('en-IN')}`
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 22, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Income Reality Check</h2>
          <p style={{ marginTop: 6, color: '#64748b', fontSize: 14 }}>AI comparison between declared and estimated income.</p>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 }}>Analysing...</div>
      )}

      {!loading && !hasData && (
        <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: 13 }}>
          Click Analyse to run the AI financial investigation for this case.
        </div>
      )}

      {!loading && hasData && (
        <>
          {/* Income Cards */}
          {(analysis?.declaredIncome || analysis?.estimatedActualIncome) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <IncomeCard
                title="Declared Income"
                value={formatAmount(analysis?.declaredIncome)}
                color="#dc2626"
                background="#fef2f2"
              />
              <IncomeCard
                title="Estimated Actual Income"
                value={formatAmount(analysis?.estimatedActualIncome)}
                color="#d97706"
                background="#fff7ed"
              />
            </div>
          )}

          {/* Suspicious Patterns */}
          {suspicious.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#334155', marginBottom: 14 }}>
                Suspicious Patterns
              </div>
              {suspicious.map((item, index) => (
                <div
                  key={index}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: index !== suspicious.length - 1 ? '1px solid #e2e8f0' : 'none' }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginTop: 7, flexShrink: 0 }} />
                  <div style={{ color: '#0f172a', fontSize: 14, lineHeight: 1.6 }}>
                    {typeof item === 'string' ? item : item.title ?? item.description ?? JSON.stringify(item)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Insight */}
          <div style={{ marginTop: 24, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <i className="ti ti-sparkles" style={{ color: '#2563eb' }} />
              <span style={{ color: '#2563eb', fontWeight: 700 }}>AI Insight</span>
            </div>
            <div style={{ color: '#334155', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {analysis?.summary ?? analysis?.aiInsight ?? rawText ?? 'No insight available.'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function IncomeCard({ title, value, color, background }: { title: string; value: string; color: string; background: string }) {
  return (
    <div style={{ background, border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, textAlign: 'center' }}>
      <div style={{ color: '#64748b', fontSize: 13, marginBottom: 10 }}>{title}</div>
      <div style={{ color, fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
