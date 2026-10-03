'use client'

import { Building2, Store } from 'lucide-react'

export function ClientTypeToggle({ isCompany, onChange }: { isCompany: boolean; onChange: (isCompany: boolean) => void }) {
  return (
    <div className="field-group" style={{ marginTop: 4 }}>
      <label>Tipo de cliente</label>
      <div className="segmented">
        <button
          type="button"
          className={`segmented-option ${!isCompany ? 'selected' : ''}`}
          onClick={() => onChange(false)}
        >
          <Store size={14} /> Ponto de venda
        </button>
        <button
          type="button"
          className={`segmented-option ${isCompany ? 'selected' : ''}`}
          onClick={() => onChange(true)}
        >
          <Building2 size={14} /> Empresa
        </button>
      </div>
      <small style={{ color: 'var(--muted)', marginTop: 6, display: 'block' }}>
        {isCompany ? 'Não gera repasse: o dinheiro é todo nosso.' : 'Consignado: gera repasse pela comissão de venda.'}
      </small>
    </div>
  )
}
