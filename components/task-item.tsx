'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'

export function TaskItem({ id, title, description, done }: {
  id: number
  title: string
  description: string | null
  done: boolean
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  async function toggle() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !done }),
      })
      if (res.ok) router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="task-item">
      <button type="button" className="task-check" disabled={saving} onClick={toggle} aria-label={done ? 'Marcar como pendente' : 'Marcar como concluída'}>
        {done ? <CheckCircle2 size={19} color="var(--green)" /> : <Circle size={19} color="#c9c0cb" />}
      </button>
      <div className="task-body">
        <b style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#a39aa4' : 'var(--foreground)' }}>{title}</b>
        {description && <span>{description}</span>}
      </div>
      <button type="button" aria-label="Excluir tarefa" disabled={removing} onClick={remove} style={{ background: 'transparent', border: 0, color: '#b2465a', display: 'flex', padding: 4 }}>
        <Trash2 size={15} />
      </button>
    </div>
  )
}
