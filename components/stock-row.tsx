'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function StockRow({ id, name, unit, quantity, minQuantity, pct, status }: {
  id: number; name: string; unit: string; quantity: number; minQuantity: number; pct: number; status: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(String(quantity))
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/ingredients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Number(value) }),
      })
      if (res.ok) router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stock-row">
      <div className="stock-info">
        <span>{name} <small style={{ color: '#a39aa4' }}>({unit}, mín. {minQuantity})</small></span>
        <b className={status}>{quantity} {unit}</b>
      </div>
      <div className="progress"><i className={status} style={{ width: `${pct}%` }} /></div>
      <div className="inline-form" style={{ marginTop: 10 }}>
        <div className="field-group">
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ width: 100 }}
          />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 16px' }} disabled={saving} onClick={save}>
          {saving ? 'Salvando...' : 'Atualizar'}
        </button>
      </div>
    </div>
  )
}
