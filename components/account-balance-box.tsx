import { Wallet } from 'lucide-react'
import { formatBRL } from '@/lib/format'

export function AccountBalanceBox({ amount }: { amount: number }) {
  return (
    <section className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div className="metric-icon"><Wallet /></div>
      <div>
        <p style={{ margin: 0, color: '#786f7c', fontSize: 11 }}>Atualmente na conta</p>
        <h3 style={{ margin: '4px 0 0', fontSize: 22, letterSpacing: '-.04em', color: amount >= 0 ? 'var(--foreground)' : '#b2465a' }}>
          {formatBRL(amount)}
        </h3>
        <small style={{ fontSize: 10, color: '#9a919b' }}>Lucro acumulado de todos os meses (receitas − despesas)</small>
      </div>
    </section>
  )
}
