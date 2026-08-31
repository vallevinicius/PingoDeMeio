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
  const [type, setType] = useState<'DESPESA' | 'RECEITA'>('DESPESA')
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
        body: JSON.stringify({ description, amount: Number(amount), date, type }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao adicionar lançamento')
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
    <form onSubmit={submit}>
      <div className="field-group" style={{ marginBottom: 16 }}>
        <label>Tipo de lançamento</label>
        <div className="chip-grid">
          <button type="button" className={`chip ${type === 'DESPESA' ? 'selected' : ''}`} onClick={() => setType('DESPESA')}>Despesa</button>
          <button type="button" className={`chip ${type === 'RECEITA' ? 'selected' : ''}`} onClick={() => setType('RECEITA')}>Receita extra</button>
        </div>
      </div>

      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder={type === 'DESPESA' ? 'Ex: Compra de frutas' : 'Ex: Venda avulsa da semana'}
            style={{ width: 220 }}
          />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Valor</label>
          <CurrencyInput value={amount} onChange={setAmount} required style={{ width: 120 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: 150 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !description || !amount}>
          {saving ? 'Adicionando...' : type === 'DESPESA' ? 'Adicionar despesa' : 'Adicionar receita'}
        </button>
      </div>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
