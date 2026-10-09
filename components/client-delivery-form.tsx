'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Product = { id: number; name: string; sizeLabel: string }

function todayISO() {
  const d = new Date()
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
}

export function ClientDeliveryForm({ clientId, products }: { clientId: number; products: Product[] }) {
  const router = useRouter()
  const [productId, setProductId] = useState(products[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/clients/${clientId}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, note: note.trim() || undefined, date }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao registrar entrega')
        return
      }
      setQuantity(1)
      setNote('')
      setDate(todayISO())
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (products.length === 0) {
    return <p className="subtext">Nenhum sabor cadastrado ainda. Cadastre em <a href="/produtos">Produtos</a> para poder registrar entregas.</p>
  }

  return (
    <form onSubmit={submit}>
      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Sabor</label>
          <select value={productId} onChange={(e) => setProductId(Number(e.target.value))} style={{ width: 200 }}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sizeLabel})</option>)}
          </select>
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Quantidade levada</label>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} onFocus={(e) => e.target.select()} style={{ width: 110 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: 150 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Observação (opcional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: Caixa térmica nova" style={{ width: 200 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !productId}>
          {saving ? 'Registrando...' : 'Registrar entrega'}
        </button>
      </div>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
