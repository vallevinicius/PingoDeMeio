'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeEditor } from '@/components/recipe-editor'

type Ingredient = { id: number; name: string; unit: string }

export function ProductForm({ ingredients }: { ingredients: Ingredient[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
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
          <label>Preço (300ml)</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: 110 }} />
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
