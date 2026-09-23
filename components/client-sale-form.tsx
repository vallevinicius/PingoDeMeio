'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CurrencyInput } from '@/components/currency-input'

type Product = { id: number; name: string; price: number; sizeLabel: string }

function todayISO() {
  const d = new Date()
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
}

export function ClientSaleForm({ clientId, products }: { clientId: number; products: Product[] }) {
  const router = useRouter()
  const [productId, setProductId] = useState(products[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(String(products[0]?.price ?? 0))
  const [date, setDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/clients/${clientId}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, unitPrice: Number(unitPrice), date }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao registrar venda')
        return
      }
      setQuantity(1)
      setDate(todayISO())
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (products.length === 0) {
    return <p className="subtext">Nenhum sabor cadastrado ainda. Cadastre em <a href="/produtos">Produtos</a> para poder registrar vendas.</p>
  }

  return (
    <form onSubmit={submit}>
      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Sabor</label>
          <select
            value={productId}
            onChange={(e) => {
              const id = Number(e.target.value)
              setProductId(id)
              const product = products.find((p) => p.id === id)
              if (product) setUnitPrice(String(product.price))
            }}
            style={{ width: 200 }}
          >
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sizeLabel})</option>)}
          </select>
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Quantidade</label>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} style={{ width: 90 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Preço unitário</label>
          <CurrencyInput value={unitPrice} onChange={setUnitPrice} style={{ width: 120 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: 150 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !productId}>
          {saving ? 'Registrando...' : 'Registrar venda'}
        </button>
      </div>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
