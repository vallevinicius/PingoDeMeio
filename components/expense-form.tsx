'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CurrencyInput } from '@/components/currency-input'

function todayISO() {
  const d = new Date()
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
}

export function ExpenseForm() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount: Number(amount), date }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao adicionar despesa')
        return
      }
      setDescription('')
      setAmount('')
      setDate(todayISO())
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="inline-form">
      <div className="field-group">
        <label>Descrição</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Ex: Compra de frutas" style={{ width: 220 }} />
      </div>
      <div className="field-group">
        <label>Valor</label>
        <CurrencyInput value={amount} onChange={setAmount} required style={{ width: 120 }} />
      </div>
      <div className="field-group">
        <label>Data</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: 150 }} />
      </div>
      <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !description || !amount}>
        {saving ? 'Adicionando...' : 'Adicionar despesa'}
      </button>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
