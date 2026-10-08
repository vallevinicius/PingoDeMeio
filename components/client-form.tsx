'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientTypeToggle, type ClientEconomics } from '@/components/client-type-toggle'

function emptyEconomics(defaultPartnerAmount: number): ClientEconomics {
  return {
    isCompany: false,
    paymentType: 'SOBRE_VENDA',
    direction: 'REPASSAR',
    siteSalePrice: '',
    companyAmount: '',
    partnerAmount: defaultPartnerAmount.toFixed(2),
  }
}

export function ClientForm({ defaultPartnerAmount }: { defaultPartnerAmount: number }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [economics, setEconomics] = useState<ClientEconomics>(() => emptyEconomics(defaultPartnerAmount))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          notes: notes.trim() || undefined,
          isCompany: economics.isCompany,
          paymentType: economics.paymentType,
          direction: economics.direction,
          siteSalePrice: Number(economics.siteSalePrice || 0),
          companyAmount: Number(economics.companyAmount || 0),
          partnerAmount: Number(economics.partnerAmount || 0),
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao criar cliente')
        return
      }
      setName('')
      setNotes('')
      setEconomics(emptyEconomics(defaultPartnerAmount))
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="inline-form" style={{ marginTop: 0 }}>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Nome do cliente / ponto</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Vamo no Point" style={{ width: 240 }} />
        </div>
        <div className="field-group" style={{ margin: 0 }}>
          <label>Observação (opcional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Trailer na praça central" style={{ width: 260 }} />
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }} disabled={saving || !name}>
          {saving ? 'Adicionando...' : 'Adicionar cliente'}
        </button>
      </div>
      <ClientTypeToggle value={economics} onChange={setEconomics} />
      {error && <span style={{ color: '#b2465a', fontSize: 12 }}>{error}</span>}
    </form>
  )
}
