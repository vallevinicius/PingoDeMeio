'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { CurrencyInput } from '@/components/currency-input'

type Product = { id: number; name: string; price: number; sizeLabel: string }

const paymentOptions = [
  { value: 'PIX', label: 'Pix' },
  { value: 'CARTAO', label: 'Cartão' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
]

type Order = {
  id: number
  customerName: string | null
  paymentMethod: string
  items: { productId: number; quantity: number; unitPrice: number }[]
}

export function EditOrderButton({ order, products }: { order: Order; products: Product[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState(order.customerName ?? '')
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod)
  const [productId, setProductId] = useState(order.items[0]?.productId ?? products[0]?.id)
  const [quantity, setQuantity] = useState(order.items[0]?.quantity ?? 1)
  const [unitPrice, setUnitPrice] = useState(String(order.items[0]?.unitPrice ?? products[0]?.price ?? 0))

  function openModal() {
    setCustomerName(order.customerName ?? '')
    setPaymentMethod(order.paymentMethod)
    setProductId(order.items[0]?.productId ?? products[0]?.id)
    setQuantity(order.items[0]?.quantity ?? 1)
    setUnitPrice(String(order.items[0]?.unitPrice ?? products[0]?.price ?? 0))
    setError(null)
    setOpen(true)
  }

  const singleItem = order.items.length <= 1

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          singleItem
            ? { customerName, paymentMethod, productId, quantity, unitPrice: Number(unitPrice) }
            : { customerName, paymentMethod },
        ),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? 'Erro ao salvar pedido')
        return
      }
      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Editar pedido"
        title="Editar pedido"
        onClick={openModal}
        style={{ background: 'transparent', border: 0, color: 'var(--muted)', display: 'flex', padding: 4 }}
      >
        <Pencil size={15} />
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => !saving && setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Editar pedido</h2>

            <div className="field-group">
              <label>Nome do cliente</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: Maria" />
            </div>

            {singleItem ? (
              <>
                <div className="field-group">
                  <label>Sabor</label>
                  <select
                    value={productId}
                    onChange={(e) => {
                      const id = Number(e.target.value)
                      setProductId(id)
                      const product = products.find((p) => p.id === id)
                      if (product) setUnitPrice(String(product.price))
                    }}
                  >
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sizeLabel})</option>)}
                  </select>
                </div>

                <div className="field-group">
                  <label>Quantidade</label>
                  <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
                </div>

                <div className="field-group">
                  <label>Preço unitário (ajuste para desconto)</label>
                  <CurrencyInput value={unitPrice} onChange={setUnitPrice} />
                </div>
              </>
            ) : (
              <p className="subtext" style={{ marginBottom: 16 }}>
                Este pedido tem {order.items.length} sabores diferentes — para alterar os itens, exclua e crie um novo pelo Terminal PDV.
              </p>
            )}

            <div className="field-group">
              <label>Forma de pagamento</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {paymentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {error && <p style={{ color: '#b2465a', fontSize: 12 }}>{error}</p>}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" disabled={saving} onClick={() => setOpen(false)}>Cancelar</button>
              <button type="button" className="submit-btn" disabled={saving} onClick={save}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
