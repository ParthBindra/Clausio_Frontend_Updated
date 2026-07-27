'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCaseStore } from '@/lib/store'
import { hearingsApi } from '@/lib/api'
import EmptyState from '@/components/ui/EmptyState'

interface Props {
  refresh?: number
}

export default function HearingHistory({ refresh }: Props) {
  const { selectedCaseId } = useCaseStore()
  const [hearings, setHearings] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [markingId, setMarkingId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!selectedCaseId) { setHearings([]); setLoading(false); return }
    setLoading(true)
    setError('')
    hearingsApi.getByCaseId(selectedCaseId)
      .then(data => setHearings(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Failed to load hearings'))
      .finally(() => setLoading(false))
  }, [selectedCaseId])

  useEffect(() => { load() }, [load, refresh])

  async function markOrderDone(hearingId: string, orderId: string) {
    if (!selectedCaseId) return
    setMarkingId(orderId)
    try {
      await hearingsApi.markOrderDone(selectedCaseId, hearingId, orderId)
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="glass-card" style={{ padding: 20 }}>

      {/* Header — UNCHANGED */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            Hearing History
          </h2>
          <p style={{ marginTop: 4, color: '#64748b', fontSize: 13 }}>
            Previous hearing records
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: 13 }}>
          Loading hearings...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && hearings.length === 0 && (
        <EmptyState icon="ti-notebook" title="No hearings recorded yet" desc="Record today's proceedings using the form on the left." />
      )}

      {/* Timeline — EXACT SAME UI as original */}
      {!loading && !error && hearings.length > 0 && (
      <div style={{ position: 'relative' }}>
        {hearings.map((hearing, index) => (
          <div key={hearing.id} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>

            {/* Timeline dot — UNCHANGED */}
            <div style={{ width: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width:      12,
                height:     12,
                borderRadius: '50%',
                background: index === 0 ? '#3b82f6' : '#cbd5e1',
                border:     '3px solid #ffffff',
                boxShadow:  index === 0 ? '0 0 0 2px #3b82f6' : '0 0 0 2px #e2e8f0',
                zIndex:     2,
              }} />
              {index !== hearings.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 70, background: 'rgba(0,0,0,0.05)', marginTop: 4 }} />
              )}
            </div>

            {/* Card — UNCHANGED */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                    {new Date(hearing.hearingDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                  <div style={{ marginTop: 2, color: '#2563eb', fontWeight: 600, fontSize: 12 }}>
                    {hearing.stage}
                  </div>
                </div>
                {index === 0 && (
                  <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    LATEST
                  </span>
                )}
              </div>

              <p style={{ margin: 0, lineHeight: 1.5, color: '#475569', fontSize: 13 }}>
                {hearing.whatHappened}
              </p>

              {/* Judge observation — NEW */}
              {hearing.judgeObservation && (
                <div style={{ marginTop: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '6px 10px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#d97706' }}>Judge: </span>
                  <span style={{ fontSize: 11, color: '#92400e' }}>{hearing.judgeObservation}</span>
                </div>
              )}

              {/* Orders — NEW */}
              {hearing.orders && hearing.orders.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {hearing.orders.map((order: any) => (
                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, marginTop: 4, fontSize: 11, gap: 8 }}>
                      <span>{order.text}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600, background: order.done ? '#f0fdf4' : '#fef2f2', color: order.done ? '#15803d' : '#dc2626', whiteSpace: 'nowrap' }}>
                          {order.done ? '✓ Done' : `Due ${new Date(order.deadline).toLocaleDateString('en-IN')}`}
                        </span>
                        {!order.done && (
                          <button
                            onClick={() => markOrderDone(hearing.id, order.id)}
                            disabled={markingId === order.id}
                            style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: markingId === order.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                          >
                            {markingId === order.id ? '...' : 'Mark done'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Bottom Summary — UNCHANGED */}
      {!loading && hearings.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Total Hearings</div>
            <div style={{ marginTop: 2, fontSize: 22, fontWeight: 700, color: '#2563eb' }}>{hearings.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}
