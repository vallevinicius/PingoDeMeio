'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'

export function EditClientButton({ id, name, notes }: { id: number; name: string; notes: string | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editName, setEditName] = useState(name)
  const [editNotes, setEditNotes] = useState(notes ?? '')

  function openModal() {
    setEditName(name)
    setEditNotes(notes ?? '')
    setError(null)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, notes: editNotes }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? 'Erro ao salvar cliente')
        return
      }
      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Editar cliente"
        title="Editar cliente"
        onClick={openModal}
        style={{ background: 'transparent', border: 0, color: 'var(--muted)', display: 'flex', padding: 4 }}
      >
        <Pencil size={15} />
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => !saving && setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Editar cliente</h2>

            <div className="field-group">
              <label>Nome do cliente / ponto</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} required placeholder="Ex: Vamo no Point" />
            </div>

            <div className="field-group">
              <label>Observação</label>
              <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Ex: Trailer na praça central" />
            </div>

            {error && <p style={{ color: '#b2465a', fontSize: 12 }}>{error}</p>}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" disabled={saving} onClick={() => setOpen(false)}>Cancelar</button>
              <button type="button" className="submit-btn" disabled={saving || !editName} onClick={save}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
