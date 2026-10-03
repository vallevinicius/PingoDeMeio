'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CurrencyInput } from '@/components/currency-input'

export function ConsignmentFeeForm({ initialValue }: { initialValue: number }) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue.toFixed(2))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings/consignment-fee', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: Number(value) }),
      })
      if (!res.ok) {
        const body = await res.json()
        setMessage({ type: 'error', text: body.error ?? 'Erro ao salvar' })
        return
      }
      setMessage({ type: 'ok', text: 'Valor atualizado!' })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="inline-form" style={{ marginTop: 0, alignItems: 'center' }}>
      <div className="field-group" style={{ margin: 0 }}>
        <label>Repasse por açaí vendido</label>
        <CurrencyInput value={value} onChange={setValue} style={{ width: 120 }} />
      </div>
      <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
      {message && (
        <span style={{ fontSize: 12, color: message.type === 'ok' ? 'var(--green)' : '#b2465a' }}>{message.text}</span>
      )}
    </form>
  )
}
