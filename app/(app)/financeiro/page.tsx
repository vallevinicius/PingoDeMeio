import Link from 'next/link'
import { ChevronLeft, ChevronRight, CircleDollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatBRL } from '@/lib/format'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseRow } from '@/components/expense-row'

export const dynamic = 'force-dynamic'

function parseMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split('-').map(Number)
    return { year, month: m }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams
  const { year, month } = parseMonth(monthParam)

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)
  const isCurrentMonth = end > new Date()

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start, lt: end }, status: { not: 'CANCELADO' } },
      select: { total: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: 'desc' },
    }),
  ])

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const profit = revenue - totalExpenses

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(start)

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Financeiro</h1>
        <p className="section-sub">Receitas, despesas e lucro por mês.</p>
      </div>

      <div className="inline-form" style={{ marginTop: 0, marginBottom: 20, alignItems: 'center' }}>
        <Link
          href={`/financeiro?month=${monthKey(prev.year, prev.month)}`}
          aria-label="Mês anterior"
          style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}
        >
          <ChevronLeft size={18} />
        </Link>
        <h2 style={{ margin: 0, fontSize: 16, textTransform: 'capitalize', minWidth: 160, textAlign: 'center' }}>{monthLabel}</h2>
        {isCurrentMonth ? (
          <span style={{ display: 'inline-flex', color: '#6d6370', opacity: 0.3 }}><ChevronRight size={18} /></span>
        ) : (
          <Link
            href={`/financeiro?month=${monthKey(next.year, next.month)}`}
            aria-label="Próximo mês"
            style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}
          >
            <ChevronRight size={18} />
          </Link>
        )}
      </div>

      <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric">
          <div className="metric-top"><div className="metric-icon"><CircleDollarSign /></div></div>
          <p>Receita do mês</p><h3>{formatBRL(revenue)}</h3><small>{orders.length} pedidos válidos</small>
        </div>
        <div className="metric">
          <div className="metric-top"><div className="metric-icon"><TrendingDown /></div></div>
          <p>Despesas do mês</p><h3>{formatBRL(totalExpenses)}</h3><small>{expenses.length} despesas lançadas</small>
        </div>
        <div className="metric">
          <div className="metric-top"><div className="metric-icon"><TrendingUp /></div></div>
          <p>Lucro do mês</p><h3 style={{ color: profit >= 0 ? 'var(--green)' : '#b2465a' }}>{formatBRL(profit)}</h3><small>receita − despesas</small>
        </div>
      </div>

      <section className="panel" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Nova despesa</h2><p>Registre um gasto e escolha o dia em que ocorreu</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ExpenseForm />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Despesas de {monthLabel}</h2><p>{expenses.length} lançamentos</p></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>DATA</th><th>DESCRIÇÃO</th><th>VALOR</th><th></th></tr></thead>
            <tbody>
              {expenses.map((e) => (
                <ExpenseRow
                  key={e.id}
                  id={e.id}
                  description={e.description}
                  amount={Number(e.amount)}
                  date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(e.date)}
                />
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>Nenhuma despesa lançada neste mês.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
