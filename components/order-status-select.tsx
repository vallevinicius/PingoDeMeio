'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const options = [
  { value: 'PREPARANDO', label: 'Preparando' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export function OrderStatusSelect({ id, status }: { id: number; status: string }) {
  const router = useRouter()
  const [value, setValue] = useState(status)
  const [saving, setSaving] = useState(false)

  async function update(next: string) {
    setValue(next)
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <select className="status-select" value={value} disabled={saving} onChange={(e) => update(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
