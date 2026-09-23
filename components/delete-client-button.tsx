'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteClientButton({ id }: { id: number }) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  async function remove() {
    if (!confirm('Excluir este cliente e todas as vendas registradas para ele? Essa ação não pode ser desfeita.')) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <button
      type="button"
      aria-label="Excluir cliente"
      title="Excluir cliente"
      disabled={removing}
      onClick={remove}
      style={{ background: 'transparent', border: 0, color: '#b2465a', display: 'flex', padding: 4 }}
    >
      <Trash2 size={15} />
    </button>
  )
}
