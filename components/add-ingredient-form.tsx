'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AddIngredientForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('kg')
  const [quantity, setQuantity] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, unit, quantity: Number(quantity), minQuantity: Number(minQuantity) }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao adicionar ingrediente')
        return
      }
      setName('')
      setQuantity('')
      setMinQuantity('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="inline-form">
      <div className="field-group">
        <label>Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Castanha" />
      </div>
      <div className="field-group">
        <label>Unidade</label>
        <input value={unit} onChange={(e) => setUnit(e.target.value)} required style={{ width: 70 }} />
      </div>
      <div className="field-group">
        <label>Quantidade</label>
        <input type="number" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required style={{ width: 100 }} />
      </div>
      <div className="field-group">
        <label>Mínimo</label>
        <input type="number" step="0.1" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} required style={{ width: 100 }} />
      </div>
      <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving}>
        {saving ? 'Adicionando...' : 'Adicionar'}
      </button>
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
