'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { CurrencyInput } from '@/components/currency-input'

export function AccountBalanceBox({ amount, updatedAt }: { amount: number; updatedAt: string | null }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(amount))
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/account-balance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(value) }),
      })
      if (res.ok) {
        setEditing(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="metric-icon"><Wallet /></div>
        <div>
          <p style={{ margin: 0, color: '#786f7c', fontSize: 11 }}>Atualmente na conta</p>
          {editing ? (
            <div className="inline-form" style={{ marginTop: 6 }}>
              <CurrencyInput value={value} onChange={setValue} style={{ width: 140 }} autoFocus />
            </div>
          ) : (
            <h3 style={{ margin: '4px 0 0', fontSize: 22, letterSpacing: '-.04em' }}>{formatBRL(amount)}</h3>
          )}
          {!editing && updatedAt && <small style={{ fontSize: 10, color: '#9a919b' }}>Atualizado em {updatedAt}</small>}
        </div>
      </div>

      {editing ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="submit-btn" style={{ width: 'auto', padding: '10px 16px' }} disabled={saving} onClick={save}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            className="submit-btn"
            style={{ width: 'auto', padding: '10px 16px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
            disabled={saving}
            onClick={() => { setValue(String(amount)); setEditing(false) }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setEditing(true)}>
          Atualizar saldo
        </button>
      )}
    </section>
  )
}
