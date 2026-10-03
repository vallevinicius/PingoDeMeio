'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientTypeToggle } from '@/components/client-type-toggle'

export function ClientForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [isCompany, setIsCompany] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, notes: notes.trim() || undefined, isCompany }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao criar cliente')
        return
      }
      setName('')
      setNotes('')
      setIsCompany(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Nome do cliente / ponto</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Vamo no Point" style={{ width: 240 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Observação (opcional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Trailer na praça central" style={{ width: 260 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !name}>
          {saving ? 'Adicionando...' : 'Adicionar cliente'}
        </button>
      </div>
      <ClientTypeToggle isCompany={isCompany} onChange={setIsCompany} />
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
