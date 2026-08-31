'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL, formatOrderCode } from '@/lib/format'

type Product = { id: number; name: string; price: number; sizeLabel: string }

const paymentOptions = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
]

export function PdvForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [productId, setProductId] = useState<number | null>(products[0]?.id ?? null)
  const [customerName, setCustomerName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [payment, setPayment] = useState('PIX')
  const [paid, setPaid] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const selectedProduct = products.find((p) => p.id === productId) ?? null

  async function submit() {
    if (!productId) return
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, paymentMethod: payment, quantity, paid, customerName: customerName.trim() || undefined }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: body.error ?? 'Erro ao criar pedido' })
        return
      }
      setMessage({ type: 'ok', text: `Pedido ${formatOrderCode(body.order.id)} criado com sucesso!` })
      setQuantity(1)
      setPaid(true)
      setCustomerName('')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  if (products.length === 0) {
    return (
      <section className="panel">
        <p className="subtext">Nenhum sabor cadastrado ainda. Cadastre os sabores em <a href="/produtos">Produtos</a> para começar a vender.</p>
      </section>
    )
  }

  return (
    <div className="pdv-grid">
      <section className="panel">
        <div className="panel-head"><div><h2>1. Escolha o sabor</h2><p>Açaí</p></div></div>
        <div className="product-grid" style={{ marginTop: 16 }}>
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`product-card ${productId === p.id ? 'selected' : ''}`}
              onClick={() => setProductId(p.id)}
            >
              <b>{p.name}</b>
              <span>{p.sizeLabel}</span>
              <b>{formatBRL(p.price)}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>2. Finalizar</h2><p>Quantidade e pagamento</p></div></div>

        <div className="field-group" style={{ marginTop: 16 }}>
          <label>Nome do cliente (opcional)</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Maria" />
        </div>

        <div className="field-group">
          <label>Quantidade</label>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
        </div>

        <div className="field-group">
          <label>Forma de pagamento</label>
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            {paymentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="field-group">
          <label>Situação do pagamento</label>
          <div className="chip-grid">
            <button type="button" className={`chip ${paid ? 'selected' : ''}`} onClick={() => setPaid(true)}>Já pagou</button>
            <button type="button" className={`chip ${!paid ? 'selected' : ''}`} onClick={() => setPaid(false)}>Ainda não pagou</button>
          </div>
        </div>

        {selectedProduct && (
          <div className="stock-row" style={{ marginTop: 4 }}>
            <div className="stock-info"><span>Total do pedido</span><b>{formatBRL(selectedProduct.price * quantity)}</b></div>
          </div>
        )}

        <button className="submit-btn" style={{ marginTop: 20 }} disabled={!productId || submitting} onClick={submit}>
          {submitting ? 'Enviando...' : 'Confirmar pedido'}
        </button>

        {message && (
          <p style={{ marginTop: 14, fontSize: 12, color: message.type === 'ok' ? 'var(--green)' : '#b2465a' }}>
            {message.text}
          </p>
        )}
      </section>
    </div>
  )
}
