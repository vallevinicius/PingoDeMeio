'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatBRL } from '@/lib/format'

export function ClientProductRateRow({ id, productName, siteSalePrice, companyAmount, partnerAmount }: {
  id: number
  productName: string
  siteSalePrice: number
  companyAmount: number
  partnerAmount: number
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/client-product-rates/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <tr>
      <td><b>{productName}</b></td>
      <td>{siteSalePrice > 0 ? formatBRL(siteSalePrice) : <span style={{ color: 'var(--muted)' }}>Não informado</span>}</td>
      <td>{formatBRL(companyAmount)}</td>
      <td>{formatBRL(partnerAmount)}</td>
      <td>
        <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
          {removing ? 'Removendo...' : 'Usar padrão'}
        </button>
      </td>
    </tr>
  )
}
