'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PaidToggle({ id, paid }: { id: number; paid: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState(paid)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    const next = !value
    setValue(next)
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: next }),
      })
      if (res.ok) router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <button type="button" className={`status ${value ? 'done' : 'cancelled'}`} disabled={saving} onClick={toggle} style={{ border: 0 }}>
      {value ? 'Pago' : 'Não pago'}
    </button>
  )
}
