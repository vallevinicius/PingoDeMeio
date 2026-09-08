'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL } from '@/lib/format'

export function WithdrawalRow({ id, date, partnerName, description, amount }: {
  id: number
  date: string
  partnerName: string
  description: string | null
  amount: number
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/withdrawals/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <tr>
      <td>{date}</td>
      <td><b>{partnerName}</b></td>
      <td>{description ?? '—'}</td>
      <td><b style={{ color: '#b2465a' }}>- {formatBRL(amount)}</b></td>
      <td>
        <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
          {removing ? 'Removendo...' : 'Remover'}
        </button>
      </td>
    </tr>
  )
}
