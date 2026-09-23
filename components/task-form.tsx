'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function todayISO() {
  const d = new Date()
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
}

export function TaskForm({ defaultDate }: { defaultDate?: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayISO())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description.trim() || undefined, date }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao criar tarefa')
        return
      }
      setTitle('')
      setDescription('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>O que precisa ser feito</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Comprar açaí no fornecedor" style={{ width: 260 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: 150 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Observação (opcional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Pedir 20kg" style={{ width: 220 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !title}>
          {saving ? 'Adicionando...' : 'Adicionar tarefa'}
        </button>
      </div>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
