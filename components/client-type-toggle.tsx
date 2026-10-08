'use client'

import { ArrowLeftRight, Building2, Store } from 'lucide-react'
import { CurrencyInput } from '@/components/currency-input'

export type ClientPaymentType = 'SOBRE_VENDA' | 'ADIANTADO'
export type ClientBalanceDirection = 'REPASSAR' | 'RECEBER'

export type ClientEconomics = {
  isCompany: boolean
  paymentType: ClientPaymentType
  direction: ClientBalanceDirection
  siteSalePrice: string
  companyAmount: string
  partnerAmount: string
}

export function ClientTypeToggle({ value, onChange }: { value: ClientEconomics; onChange: (next: ClientEconomics) => void }) {
  const { isCompany, paymentType, direction, siteSalePrice, companyAmount, partnerAmount } = value

  function patch(next: Partial<ClientEconomics>) {
    onChange({ ...value, ...next })
  }

  return (
    <div className="field-group" style={{ marginTop: 4 }}>
      <label>Tipo de cliente</label>
      <div className="segmented">
        <button type="button" className={`segmented-option ${!isCompany ? 'selected' : ''}`} onClick={() => patch({ isCompany: false })}>
          <Store size={14} /> Ponto de venda
        </button>
        <button type="button" className={`segmented-option ${isCompany ? 'selected' : ''}`} onClick={() => patch({ isCompany: true })}>
          <Building2 size={14} /> Empresa
        </button>
      </div>

      {!isCompany && (
        <>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Pagamento</label>
            <div className="segmented segmented-sm">
              <button type="button" className={`segmented-option ${paymentType === 'SOBRE_VENDA' ? 'selected' : ''}`} onClick={() => patch({ paymentType: 'SOBRE_VENDA' })}>
                Sobre venda
              </button>
              <button type="button" className={`segmented-option ${paymentType === 'ADIANTADO' ? 'selected' : ''}`} onClick={() => patch({ paymentType: 'ADIANTADO' })}>
                Adiantado
              </button>
            </div>
          </div>

          {paymentType === 'SOBRE_VENDA' && (
            <>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  <ArrowLeftRight size={11} style={{ verticalAlign: -2, marginRight: 4 }} /> Quem deve a quem
                </label>
                <div className="segmented segmented-sm">
                  <button type="button" className={`segmented-option ${direction === 'REPASSAR' ? 'selected' : ''}`} onClick={() => patch({ direction: 'REPASSAR' })}>
                    Empresa repassa ao cliente
                  </button>
                  <button type="button" className={`segmented-option ${direction === 'RECEBER' ? 'selected' : ''}`} onClick={() => patch({ direction: 'RECEBER' })}>
                    Cliente repassa à empresa
                  </button>
                </div>
              </div>

              <div className="inline-form" style={{ marginTop: 10, marginBottom: 0 }}>
                <div className="field-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>Venda no local (un.)</label>
                  <CurrencyInput value={siteSalePrice} onChange={(v) => patch({ siteSalePrice: v })} style={{ width: 110 }} />
                </div>
                <div className="field-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>Empresa recebe (un.)</label>
                  <CurrencyInput value={companyAmount} onChange={(v) => patch({ companyAmount: v })} style={{ width: 110 }} />
                </div>
                <div className="field-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>Cliente recebe (un.)</label>
                  <CurrencyInput value={partnerAmount} onChange={(v) => patch({ partnerAmount: v })} style={{ width: 110 }} />
                </div>
              </div>
            </>
          )}
        </>
      )}

      <small style={{ color: 'var(--muted)', marginTop: 10, display: 'block' }}>
        {isCompany
          ? 'Não gera saldo: o dinheiro é todo nosso.'
          : paymentType === 'ADIANTADO'
            ? 'Pagamento adiantado: já foi acertado na hora, não gera saldo em aberto.'
            : direction === 'RECEBER'
              ? `Cliente repassa ${formatCurrencyHint(companyAmount)} por unidade vendida.`
              : `Empresa repassa ${formatCurrencyHint(partnerAmount)} por unidade vendida.`}
      </small>
    </div>
  )
}

function formatCurrencyHint(value: string) {
  const n = Number(value || 0)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
