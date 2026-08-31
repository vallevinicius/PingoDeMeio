'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeEditor } from '@/components/recipe-editor'
import { CurrencyInput } from '@/components/currency-input'

type Ingredient = { id: number; name: string; unit: string }

const SIZE_OPTIONS = ['300ml', '500ml', '700ml', '1L']

export function ProductForm({ ingredients }: { ingredients: Ingredient[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [sizeLabel, setSizeLabel] = useState(SIZE_OPTIONS[0])
  const [rows, setRows] = useState<{ ingredientId: number; quantity: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: Number(price),
          sizeLabel,
          recipe: rows.filter((r) => r.quantity).map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity) })),
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao criar sabor')
        return
      }
      setName('')
      setPrice('')
      setSizeLabel(SIZE_OPTIONS[0])
      setRows([])
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Nome do sabor</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Açaí com Morango" style={{ width: 240 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Tamanho</label>
          <select value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} style={{ width: 100 }}>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Preço ({sizeLabel})</label>
          <CurrencyInput value={price} onChange={setPrice} required style={{ width: 110 }} />
        </div>
      </div>

      <p className="section-sub" style={{ marginTop: 20, marginBottom: 8 }}>Receita (ingredientes descontados do estoque a cada venda)</p>
      {ingredients.length === 0 ? (
        <p className="subtext">Cadastre ingredientes em Estoque antes de montar a receita.</p>
      ) : (
        <RecipeEditor ingredients={ingredients} rows={rows} onChange={setRows} />
      )}

      <button className="submit-btn" style={{ width: 'auto', padding: '10px 20px', marginTop: 20 }} disabled={saving || !name || !price}>
        {saving ? 'Salvando...' : 'Criar sabor'}
      </button>
      {error && <p style={{ color: '#b2465a', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </form>
  )
}
