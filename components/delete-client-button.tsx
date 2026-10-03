'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'

export function DeleteClientButton({ id }: { id: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
      setConfirming(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Excluir cliente"
        title="Excluir cliente"
        onClick={() => setConfirming(true)}
        style={{ background: 'transparent', border: 0, color: '#b2465a', display: 'flex', padding: 4 }}
      >
        <Trash2 size={15} />
      </button>

      {confirming && (
        <ConfirmDialog
          title="Excluir cliente"
          description="Excluir este cliente e todas as vendas registradas para ele? Essa ação não pode ser desfeita."
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
          loading={removing}
        />
      )}
    </>
  )
}
