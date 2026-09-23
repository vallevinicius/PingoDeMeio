'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL } from '@/lib/format'

export function ClientSaleRow({ id, date, productName, quantity, unitPrice }: {
  id: number
  date: string
  productName: string
  quantity: number
  unitPrice: number
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/client-sales/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <tr>
      <td>{date}</td>
      <td><b>{productName}</b></td>
      <td>{quantity}x</td>
      <td><b>{formatBRL(unitPrice * quantity)}</b></td>
      <td>
        <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
          {removing ? 'Removendo...' : 'Remover'}
        </button>
      </td>
    </tr>
  )
}
