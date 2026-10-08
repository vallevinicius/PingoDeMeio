'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { ClientTypeToggle, type ClientEconomics } from '@/components/client-type-toggle'

type Client = {
  id: number
  name: string
  notes: string | null
  isCompany: boolean
  paymentType: ClientEconomics['paymentType']
  direction: ClientEconomics['direction']
  siteSalePrice: number
  companyAmount: number
  partnerAmount: number
}

function toEconomics(client: Client): ClientEconomics {
  return {
    isCompany: client.isCompany,
    paymentType: client.paymentType,
    direction: client.direction,
    siteSalePrice: client.siteSalePrice.toFixed(2),
    companyAmount: client.companyAmount.toFixed(2),
    partnerAmount: client.partnerAmount.toFixed(2),
  }
}

export function EditClientButton({ client }: { client: Client }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editName, setEditName] = useState(client.name)
  const [editNotes, setEditNotes] = useState(client.notes ?? '')
  const [economics, setEconomics] = useState<ClientEconomics>(() => toEconomics(client))

  function openModal() {
    setEditName(client.name)
    setEditNotes(client.notes ?? '')
    setEconomics(toEconomics(client))
    setError(null)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          notes: editNotes,
          isCompany: economics.isCompany,
          paymentType: economics.paymentType,
          direction: economics.direction,
          siteSalePrice: Number(economics.siteSalePrice || 0),
          companyAmount: Number(economics.companyAmount || 0),
          partnerAmount: Number(economics.partnerAmount || 0),
        }),
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

            <ClientTypeToggle value={economics} onChange={setEconomics} />

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
