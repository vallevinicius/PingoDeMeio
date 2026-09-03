import { TrendingUp } from 'lucide-react'
import { formatBRL, TIME_ZONE } from '@/lib/format'

export function AllTimeRevenueBox({ amount, since }: { amount: number; since: Date | null }) {
  return (
    <section className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div className="metric-icon"><TrendingUp /></div>
      <div>
        <p style={{ margin: 0, color: '#786f7c', fontSize: 11 }}>Faturamento total</p>
        <h3 style={{ margin: '4px 0 0', fontSize: 22, letterSpacing: '-.04em' }}>{formatBRL(amount)}</h3>
        <small style={{ fontSize: 10, color: '#9a919b' }}>
          {since ? `Desde ${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: TIME_ZONE }).format(since)}` : 'Nenhum pedido ou receita registrada ainda'}
        </small>
      </div>
    </section>
  )
}
