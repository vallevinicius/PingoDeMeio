'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ClientDeliveryRow({ id, date, productName, quantity, note }: {
  id: number
  date: string
  productName: string
  quantity: number
  note: string | null
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/client-deliveries/${id}`, { method: 'DELETE' })
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
      <td>{note ?? 'X'}</td>
      <td>
        <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
          {removing ? 'Removendo...' : 'Remover'}
        </button>
      </td>
    </tr>
  )
}
