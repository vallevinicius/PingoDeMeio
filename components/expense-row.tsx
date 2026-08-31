'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL } from '@/lib/format'

export function ExpenseRow({ id, description, amount, date }: {
  id: number
  description: string
  amount: number
  date: string
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <tr>
      <td>{date}</td>
      <td><b>{description}</b></td>
      <td><b>{formatBRL(amount)}</b></td>
      <td>
        <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
          {removing ? 'Removendo...' : 'Remover'}
        </button>
      </td>
    </tr>
  )
}
