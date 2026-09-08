'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CurrencyInput } from '@/components/currency-input'

function todayISO() {
  const d = new Date()
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
}

export function WithdrawalForm({ partners }: { partners: string[] }) {
  const router = useRouter()
  const [partnerName, setPartnerName] = useState(partners[0] ?? '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerName, amount: Number(amount), date, description: description.trim() || undefined }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao registrar retirada')
        return
      }
      setAmount('')
      setDescription('')
      setDate(todayISO())
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="field-group" style={{ marginBottom: 16 }}>
        <label>Sócio</label>
        <input
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          required
          placeholder="Ex: Vinicius"
          style={{ maxWidth: 260 }}
        />
        {partners.length > 0 && (
          <div className="chip-grid" style={{ marginTop: 4 }}>
            {partners.map((p) => (
              <button key={p} type="button" className={`chip ${partnerName === p ? 'selected' : ''}`} onClick={() => setPartnerName(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Valor</label>
          <CurrencyInput value={amount} onChange={setAmount} required style={{ width: 120 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: 150 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Descrição (opcional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Retirada mensal" style={{ width: 220 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !partnerName || !amount}>
          {saving ? 'Registrando...' : 'Registrar retirada'}
        </button>
      </div>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
