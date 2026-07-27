'use client'

interface Props {
  readiness: any
  loading:   boolean
}

function scoreLabel(score: number) {
  if (score >= 80) return { text: 'Ready for Hearing', badge: 'Good Shape', color: '#16a34a' }
  if (score >= 50) return { text: 'Needs Attention', badge: 'In Progress', color: '#d97706' }
  return { text: 'Not Ready', badge: 'At Risk', color: '#dc2626' }
}

export default function ReadinessScore({ readiness, loading }: Props) {
  const score = readiness?.score ?? 0
  const items = readiness?.checklistItems ?? []
  const doneCount = items.filter((i: any) => i.done).length
  const label = scoreLabel(score)

  // Group checklist items by category to approximate a breakdown — the backend
  // doesn't return separate sub-metrics, so this is derived from real checklist data.
  const byCategory = items.reduce((acc: Record<string, { total: number; done: number }>, item: any) => {
    const key = item.category || 'General'
    acc[key] = acc[key] || { total: 0, done: 0 }
    acc[key].total += 1
    if (item.done) acc[key].done += 1
    return acc
  }, {})

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      {/* ================= HEADER ================= */}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Hearing Readiness</h2>
          <p style={{ marginTop: 2, fontSize: 12, color: '#64748b' }}>Overall preparation score.</p>
        </div>

        {readiness && (
          <div style={{ background: `${label.color}1a`, border: `1px solid ${label.color}33`, color: label.color, padding: '4px 10px', borderRadius: 20, fontWeight: 600, fontSize: 11 }}>
            {label.badge}
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 }}>Loading...</div>
      )}

      {!loading && !readiness && (
        <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: 13 }}>
          Click Generate AI Report to assess this case.
        </div>
      )}

      {!loading && readiness && (
        <>
          {/* ================= SCORE ================= */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: label.color, lineHeight: 1, letterSpacing: '-1px' }}>
              {score}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>{label.text}</div>
            <div style={{ marginTop: 4, fontSize: 11, color: '#94a3b8' }}>
              {doneCount} of {items.length} checklist items complete
            </div>
          </div>

          {/* ================= METRICS ================= */}
          {Object.entries(byCategory).map(([category, stat]) => (
            <MetricBar
              key={category}
              label={category}
              value={Math.round(((stat as any).done / (stat as any).total) * 100)}
              color={(stat as any).done === (stat as any).total ? '#16a34a' : '#f59e0b'}
            />
          ))}
        </>
      )}
    </div>
  )
}

/* ================================================= */

function MetricBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}/100</span>
      </div>

      <div style={{ height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  )
}
