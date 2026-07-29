'use client'

interface Props {
  readiness: any
  loading:   boolean
}

export default function StrengthAnalysis({ readiness, loading }: Props) {
  const strengths: any[] = readiness?.strengths ?? (readiness?.checklistItems ?? []).filter((i: any) => i.done)

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      {/* Header */}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Completed Items</h2>
          <p style={{ marginTop: 2, color: '#64748b', fontSize: 12 }}>Points already in good shape for this case.</p>
        </div>

        {strengths.length > 0 && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#15803d', padding: '4px 10px', borderRadius: 20, fontWeight: 600, fontSize: 11 }}>
            {strengths.length} Done
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 12 }}>Loading...</div>
      )}

      {!loading && !readiness && (
        <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 12 }}>No assessment yet.</div>
      )}

      {!loading && readiness && strengths.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 12 }}>Nothing marked complete yet.</div>
      )}

      {strengths.map((item) => (
        <StrengthCard key={item.id} item={item} />
      ))}
    </div>
  )
}

/* ===================================================== */

function StrengthCard({ item }: { item: any }) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.05)',
        background: 'rgba(255,255,255,0.4)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
        {typeof item === 'string' ? item : item.text ?? item.title ?? ''}
      </div>
      {typeof item !== 'string' && item.category && (
        <span style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap' }}>
          {item.category}
        </span>
      )}
    </div>
  )
}
