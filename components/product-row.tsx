'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL } from '@/lib/format'
import { RecipeEditor } from '@/components/recipe-editor'

type Ingredient = { id: number; name: string; unit: string }
type RecipeItem = { ingredientId: number; ingredientName: string; quantity: number; unit: string }

export function ProductRow({ id, name, price, active, recipe, ingredients }: {
  id: number
  name: string
  price: number
  active: boolean
  recipe: RecipeItem[]
  ingredients: Ingredient[]
}) {
  const router = useRouter()
  const [editingRecipe, setEditingRecipe] = useState(false)
  const [rows, setRows] = useState(recipe.map((r) => ({ ingredientId: r.ingredientId, quantity: String(r.quantity) })))
  const [nameValue, setNameValue] = useState(name)
  const [priceValue, setPriceValue] = useState(String(price))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function saveBasics() {
    setSaving(true)
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue, price: Number(priceValue) }),
      })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive() {
    setSaving(true)
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function saveRecipe() {
    setSaving(true)
    try {
      await fetch(`/api/products/${id}/recipe`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: rows.filter((r) => r.quantity).map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity) })),
        }),
      })
      setEditingRecipe(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao excluir')
        return
      }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="panel" style={{ marginBottom: 14, opacity: active ? 1 : 0.55 }}>
      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Sabor</label>
          <input value={nameValue} onChange={(e) => setNameValue(e.target.value)} style={{ width: 220 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Preço</label>
          <input type="number" step="0.01" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} style={{ width: 100 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 14px' }} disabled={saving} onClick={saveBasics}>Salvar</button>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 14px', background: active ? '#bf8d38' : 'var(--green)' }} disabled={saving} onClick={toggleActive}>
          {active ? 'Desativar' : 'Ativar'}
        </button>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 14px', background: '#b2465a' }} disabled={saving} onClick={remove}>Excluir</button>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
        {recipe.length === 0 ? 'Sem receita cadastrada.' : recipe.map((r) => `${r.ingredientName} (${r.quantity}${r.unit})`).join(', ')}
        {' — '}
        <button type="button" className="link-button" style={{ fontSize: 12 }} onClick={() => setEditingRecipe((v) => !v)}>
          {editingRecipe ? 'Fechar' : 'Editar receita'}
        </button>
      </div>

      {editingRecipe && (
        <div style={{ marginTop: 12 }}>
          <RecipeEditor ingredients={ingredients} rows={rows} onChange={setRows} />
          <button className="submit-btn" style={{ width: 'auto', padding: '10px 16px', marginTop: 10 }} disabled={saving} onClick={saveRecipe}>
            Salvar receita
          </button>
        </div>
      )}

      {error && <p style={{ color: '#b2465a', fontSize: 12, marginTop: 8 }}>{error}</p>}
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{formatBRL(price)} · 300ml</p>
    </div>
  )
}
