'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CurrencyInput } from '@/components/currency-input'

type Product = { id: number; name: string; sizeLabel: string }

export function ClientProductRateForm({ clientId, products, defaultCompanyAmount, defaultPartnerAmount }: {
  clientId: number
  products: Product[]
  defaultCompanyAmount: number
  defaultPartnerAmount: number
}) {
  const router = useRouter()
  const [productId, setProductId] = useState(products[0]?.id)
  const [siteSalePrice, setSiteSalePrice] = useState('')
  const [companyAmount, setCompanyAmount] = useState(defaultCompanyAmount.toFixed(2))
  const [partnerAmount, setPartnerAmount] = useState(defaultPartnerAmount.toFixed(2))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/clients/${clientId}/product-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          siteSalePrice: Number(siteSalePrice || 0),
          companyAmount: Number(companyAmount || 0),
          partnerAmount: Number(partnerAmount || 0),
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao salvar valor do sabor')
        return
      }
      setSiteSalePrice('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (products.length === 0) {
    return <p className="subtext">Nenhum sabor cadastrado ainda. Cadastre em <a href="/produtos">Produtos</a>.</p>
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
          <label>Venda no local (un.)</label>
          <CurrencyInput value={siteSalePrice} onChange={setSiteSalePrice} style={{ width: 110 }} />
          <small style={{ color: 'var(--muted)' }}>Deixe 0 se não souber</small>
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Empresa recebe (un.)</label>
          <CurrencyInput value={companyAmount} onChange={setCompanyAmount} style={{ width: 110 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Cliente recebe (un.)</label>
          <CurrencyInput value={partnerAmount} onChange={setPartnerAmount} style={{ width: 110 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !productId}>
          {saving ? 'Salvando...' : 'Salvar valor do sabor'}
        </button>
      </div>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
