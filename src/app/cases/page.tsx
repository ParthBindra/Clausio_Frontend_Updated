'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { casesApi } from '@/lib/api'
import CasesHeader    from '@/components/cases/CasesHeader'
import CasesSearch    from '@/components/cases/CasesSearch'
import CaseStats      from '@/components/cases/CaseStats'
import PracticeAreas  from '@/components/cases/PracticeAreas'
import CaseTable      from '@/components/cases/CaseTable'
import EditCaseModal  from '@/components/cases/EditCaseModal'
import DeleteCaseModal from '@/components/cases/DeleteCaseModal'

export default function CasesPage() {
  const [editCaseId,   setEditCaseId]   = useState<string | null>(null)
  const [deleteCaseId, setDeleteCaseId] = useState<string | null>(null)
  const [refresh,      setRefresh]      = useState(0)
  const [cases,        setCases]        = useState<any[]>([])
  const [loading,       setLoading]      = useState(true)
  const [error,         setError]        = useState('')
  const [search,        setSearch]       = useState('')
  const [practiceFilter, setPracticeFilter] = useState('')

  function handleSaved() {
    setRefresh(r => r + 1)
  }

  const loadCases = useCallback(() => {
    setLoading(true)
    setError('')
    casesApi.getAll()
      .then(data => setCases(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Failed to load cases'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadCases() }, [loadCases, refresh])

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const clientName = c.client ? `${c.client.firstName ?? ''} ${c.client.lastName ?? ''}` : ''
      const matchesSearch = search === '' ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNumber?.toLowerCase().includes(search.toLowerCase()) ||
        clientName.toLowerCase().includes(search.toLowerCase())
      const matchesPractice = practiceFilter === '' ||
        c.caseType?.toLowerCase().includes(practiceFilter.toLowerCase())
      return matchesSearch && matchesPractice
    })
  }, [cases, search, practiceFilter])

  return (
    <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', margin: '16px', padding: 20, borderRadius: 24 }}>

      <CasesHeader onSaved={handleSaved} />

      <div style={{ marginTop: 28 }}>
        <CasesSearch search={search} onSearchChange={setSearch} />
      </div>

      <div style={{ marginTop: 28 }}>
        <CaseStats cases={cases} />
      </div>

      <div style={{ marginTop: 36 }}>
        <PracticeAreas cases={cases} selected={practiceFilter} onSelect={setPracticeFilter} />
      </div>

      {/* Case Table — shows all real cases */}
      <div style={{ marginTop: 28 }}>
        <CaseTable
          cases={filteredCases}
          loading={loading}
          error={error}
          onEdit={id => setEditCaseId(id)}
          onDelete={id => setDeleteCaseId(id)}
        />
      </div>

      {/* Edit Modal */}
      {editCaseId && (
        <EditCaseModal
          caseId={editCaseId}
          onClose={() => setEditCaseId(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Modal */}
      {deleteCaseId && (
        <DeleteCaseModal
          caseId={deleteCaseId}
          onClose={() => setDeleteCaseId(null)}
          onDeleted={handleSaved}
        />
      )}
    </div>
  )
}