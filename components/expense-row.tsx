'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { CurrencyInput } from '@/components/currency-input'

export function ExpenseRow({ id, type, description, amount, date, dateISO }: {
  id: number
  type: 'DESPESA' | 'RECEITA'
  description: string
  amount: number
  date: string
  dateISO: string
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editType, setEditType] = useState(type)
  const [editDescription, setEditDescription] = useState(description)
  const [editAmount, setEditAmount] = useState(String(amount))
  const [editDate, setEditDate] = useState(dateISO)

  function openModal() {
    setEditType(type)
    setEditDescription(description)
    setEditAmount(String(amount))
    setEditDate(dateISO)
    setError(null)
    setOpen(true)
  }

  async function remove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemoving(false)
    }
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editType,
          description: editDescription,
          amount: Number(editAmount),
          date: editDate,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao salvar lançamento')
        return
      }
      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const isIncome = type === 'RECEITA'

  return (
    <>
      <tr>
        <td>{date}</td>
        <td><span className={`status ${isIncome ? 'done' : 'cancelled'}`}>{isIncome ? 'Receita' : 'Despesa'}</span></td>
        <td><span className={`entry-dot ${isIncome ? 'income' : 'expense'}`} /><b style={{ display: 'inline' }}>{description}</b></td>
        <td><b style={{ color: isIncome ? 'var(--green)' : '#b2465a' }}>{isIncome ? '+' : '-'} {formatBRL(amount)}</b></td>
        <td>
          <button
            type="button"
            aria-label="Editar lançamento"
            title="Editar lançamento"
            onClick={openModal}
            style={{ background: 'transparent', border: 0, color: 'var(--muted)', display: 'inline-flex', padding: 4 }}
          >
            <Pencil size={15} />
          </button>
          <button type="button" className="link-button" style={{ fontSize: 12, color: '#b2465a' }} disabled={removing} onClick={remove}>
            {removing ? 'Removendo...' : 'Remover'}
          </button>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={5} style={{ padding: 0 }}>
            <div className="modal-overlay" onClick={() => !saving && setOpen(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2>Editar lançamento</h2>

                <div className="field-group">
                  <label>Tipo de lançamento</label>
                  <div className="type-toggle">
                    <button type="button" className={`expense ${editType === 'DESPESA' ? 'selected' : ''}`} onClick={() => setEditType('DESPESA')}>↘ Despesa</button>
                    <button type="button" className={`income ${editType === 'RECEITA' ? 'selected' : ''}`} onClick={() => setEditType('RECEITA')}>↗ Receita extra</button>
                  </div>
                </div>

                <div className="field-group">
                  <label>Descrição</label>
                  <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
                </div>

                <div className="field-group">
                  <label>Valor</label>
                  <CurrencyInput value={editAmount} onChange={setEditAmount} required />
                </div>

                <div className="field-group">
                  <label>Data</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                </div>

                {error && <p style={{ color: '#b2465a', fontSize: 12 }}>{error}</p>}

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" disabled={saving} onClick={() => setOpen(false)}>Cancelar</button>
                  <button type="button" className="submit-btn" disabled={saving || !editDescription || !editAmount} onClick={save}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
