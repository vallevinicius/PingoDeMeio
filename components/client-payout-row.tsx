'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL } from '@/lib/format'

export function ClientPayoutRow({ id, date, amount, note }: {
  id: number
  date: string
  amount: number
  note: string | null
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/client-payouts/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <tr>
      <td>{date}</td>
      <td><b style={{ color: 'var(--green)' }}>{formatBRL(amount)}</b></td>
      <td>{note ?? 'X'}</td>
      <td>
        <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
          {removing ? 'Removendo...' : 'Remover'}
        </button>
      </td>
    </tr>
  )
}
