'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCaseStore } from '@/lib/store'
import { actionPlansApi } from '@/lib/api'
import EmptyState from '@/components/ui/EmptyState'

export default function ActionPlan() {
  const { selectedCaseId } = useCaseStore()
  const [actions,   setActions]   = useState<any[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!selectedCaseId) return
    setLoading(true)
    setError('')
    actionPlansApi.getByCaseId(selectedCaseId)
      .then(data => setActions(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Failed to load action plan'))
      .finally(() => setLoading(false))
  }, [selectedCaseId])

  useEffect(() => { load() }, [load])

  async function markComplete(id: string) {
    if (!selectedCaseId) return
    setUpdatingId(id)
    try {
      await actionPlansApi.markDone(selectedCaseId, id)
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  function getPriorityColor(priority: string) {
    if (priority === 'High')   return { clr: '#dc2626', bg: '#fef2f2' }
    if (priority === 'Medium') return { clr: '#d97706', bg: '#fff7ed' }
    return { clr: '#16a34a', bg: '#f0fdf4' }
  }

  return (
    // EXACT SAME UI as original
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 22, boxShadow: '0 2px 8px rgba(15,23,42,.04)', height: '100%' }}>

      {/* Header — UNCHANGED */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>30-Day Action Plan</h2>
          <p style={{ marginTop: 5, color: '#64748b', fontSize: 14 }}>AI-generated recommendations</p>
        </div>
        {actions.length > 0 && (
          <button onClick={() => window.print()} style={{ border: 'none', background: '#eff6ff', color: '#2563eb', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}>
            Export
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>
          Loading action plan...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && actions.length === 0 && (
        <EmptyState icon="ti-list-check" title="No action items yet" desc="Use Run AI from the header to generate a strategy and populate this plan." />
      )}

      {/* Actions — EXACT SAME card UI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {actions.map((item) => {
          const p = getPriorityColor(item.priority)
          return (
            <div key={item.id} style={{ display: 'flex', gap: 16, border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#ffffff' }}>

              {/* Checkbox */}
              <div style={{ marginTop: 2 }}>
                <input
                  type="checkbox"
                  checked={!!item.done}
                  onChange={() => !item.done && markComplete(item.id)}
                  style={{ width: 18, height: 18 }}
                />
              </div>

              {/* Content — UNCHANGED */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: item.done ? '#94a3b8' : '#0f172a', fontSize: 15, textDecoration: item.done ? 'line-through' : 'none' }}>
                    {item.title}
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: p.clr, background: p.bg }}>
                    {item.priority}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>
                  {item.description}
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#2563eb', fontWeight: 600, fontSize: 13 }}>
                    {item.dueBy ? `Due: ${new Date(item.dueBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Before Next Hearing'}
                  </span>
                  {!item.done && (
                    <button
                      onClick={() => markComplete(item.id)}
                      disabled={updatingId === item.id}
                      style={{ border: 'none', background: '#f8fafc', color: '#475569', borderRadius: 8, padding: '7px 12px', cursor: updatingId === item.id ? 'not-allowed' : 'pointer', fontSize: 13 }}
                    >
                      {updatingId === item.id ? 'Saving...' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
