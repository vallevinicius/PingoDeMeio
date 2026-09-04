'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL, formatOrderCode } from '@/lib/format'
import { CurrencyInput } from '@/components/currency-input'

type Product = { id: number; name: string; price: number; sizeLabel: string }
type CartLine = { productId: number; quantity: number; unitPrice: string }

const paymentOptions = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
]

export function PdvForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [cart, setCart] = useState<CartLine[]>([])
  const [customerName, setCustomerName] = useState('')
  const [payment, setPayment] = useState('PIX')
  const [paid, setPaid] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  function addToCart(productId: number) {
    setMessage(null)
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId)
      if (existing) {
        return prev.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l))
      }
      const product = products.find((p) => p.id === productId)
      return [...prev, { productId, quantity: 1, unitPrice: (product?.price ?? 0).toFixed(2) }]
    })
  }

  function updateQuantity(productId: number, quantity: number) {
    setCart((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.max(1, quantity) } : l)))
  }

  function updatePrice(productId: number, unitPrice: string) {
    setCart((prev) => prev.map((l) => (l.productId === productId ? { ...l, unitPrice } : l)))
  }

  function removeLine(productId: number) {
    setCart((prev) => prev.filter((l) => l.productId !== productId))
  }

  const cartLines = cart
    .map((line) => ({ ...line, product: products.find((p) => p.id === line.productId) ?? null }))
    .filter((l): l is CartLine & { product: Product } => l.product !== null)

  const totalItems = cartLines.reduce((sum, l) => sum + l.quantity, 0)
  const total = cartLines.reduce((sum, l) => sum + Number(l.unitPrice || 0) * l.quantity, 0)

  async function submit() {
    if (cart.length === 0) return
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPrice: Number(l.unitPrice) })),
          paymentMethod: payment,
          paid,
          customerName: customerName.trim() || undefined,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: body.error ?? 'Erro ao criar pedido' })
        return
      }
      setMessage({ type: 'ok', text: `Pedido ${formatOrderCode(body.order.id)} criado com sucesso!` })
      setCart([])
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
        <div className="panel-head"><div><h2>1. Escolha os sabores</h2><p>Clique para adicionar ao pedido (pode adicionar mais de um)</p></div></div>
        <div className="product-grid" style={{ marginTop: 16 }}>
          {products.map((p) => {
            const line = cart.find((l) => l.productId === p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`product-card ${line ? 'selected' : ''}`}
                onClick={() => addToCart(p.id)}
              >
                <b>{p.name}</b>
                <span>{p.sizeLabel}</span>
                <b>{formatBRL(p.price)}</b>
                {line && <span style={{ marginTop: 6, fontWeight: 700, color: 'var(--purple)' }}>{line.quantity}x no pedido</span>}
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>2. Finalizar</h2><p>Itens, quantidade e pagamento</p></div></div>

        <div className="field-group" style={{ marginTop: 16 }}>
          <label>Nome do cliente (opcional)</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Maria" />
        </div>

        <div className="field-group">
          <label>Itens do pedido</label>
          {cartLines.length === 0 ? (
            <p className="subtext" style={{ margin: 0 }}>Clique em um ou mais sabores ao lado para adicionar.</p>
          ) : (
            <div>
              {cartLines.map((line) => {
                const discounted = Number(line.unitPrice || 0) < line.product.price
                return (
                  <div key={line.productId} className="inline-form" style={{ marginTop: 8, marginBottom: 0, alignItems: 'center' }}>
                    <span style={{ flex: 1, fontSize: 13 }}>{line.product.name}</span>
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => updateQuantity(line.productId, Number(e.target.value))}
                      style={{ width: 56 }}
                      aria-label="Quantidade"
                    />
                    <CurrencyInput
                      value={line.unitPrice}
                      onChange={(v) => updatePrice(line.productId, v)}
                      style={{ width: 100, color: discounted ? '#b2465a' : undefined }}
                      aria-label="Preço unitário"
                    />
                    <b style={{ minWidth: 74, textAlign: 'right' }}>{formatBRL(Number(line.unitPrice || 0) * line.quantity)}</b>
                    <button
                      type="button"
                      className="link-button"
                      style={{ fontSize: 12, color: '#b2465a' }}
                      onClick={() => removeLine(line.productId)}
                    >
                      Remover
                    </button>
                  </div>
                )
              })}
            </div>
          )}
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

        {cartLines.length > 0 && (
          <div className="stock-row" style={{ marginTop: 4 }}>
            <div className="stock-info">
              <span>Total do pedido ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
              <b>{formatBRL(total)}</b>
            </div>
          </div>
        )}

        <button className="submit-btn" style={{ marginTop: 20 }} disabled={cart.length === 0 || submitting} onClick={submit}>
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
