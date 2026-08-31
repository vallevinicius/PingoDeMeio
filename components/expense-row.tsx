'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL } from '@/lib/format'

export function ExpenseRow({ id, type, description, amount, date }: {
  id: number
  type: 'DESPESA' | 'RECEITA'
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

  const isIncome = type === 'RECEITA'

  return (
    <tr>
      <td>{date}</td>
      <td><span className={`status ${isIncome ? 'done' : 'cancelled'}`}>{isIncome ? 'Receita' : 'Despesa'}</span></td>
      <td><b>{description}</b></td>
      <td><b style={{ color: isIncome ? 'var(--green)' : '#b2465a' }}>{isIncome ? '+' : '-'} {formatBRL(amount)}</b></td>
      <td>
        <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
          {removing ? 'Removendo...' : 'Remover'}
        </button>
      </td>
    </tr>
  )
}
