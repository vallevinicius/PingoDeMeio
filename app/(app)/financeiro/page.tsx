import Link from 'next/link'
import { Banknote, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, QrCode, TrendingDown, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatBRL, paymentLabel } from '@/lib/format'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseRow } from '@/components/expense-row'
import { AccountBalanceBox } from '@/components/account-balance-box'

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

const PAGE_SIZE = 8

const TABS = [
  { label: 'Todas', value: undefined },
  { label: 'Despesas', value: 'DESPESA' as const },
  { label: 'Receitas', value: 'RECEITA' as const },
]

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ month?: string; type?: string; page?: string }> }) {
  const { month: monthParam, type: typeParam, page: pageParam } = await searchParams
  const { year, month } = parseMonth(monthParam)
  const typeFilter = typeParam === 'DESPESA' || typeParam === 'RECEITA' ? typeParam : undefined
  const currentPage = Math.max(1, Number(pageParam) || 1)

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)
  const isCurrentMonth = end > new Date()

  function buildHref(overrides: { type?: string; page?: number }) {
    const params = new URLSearchParams()
    params.set('month', monthKey(year, month))
    const type = 'type' in overrides ? overrides.type : typeFilter
    if (type) params.set('type', type)
    const page = overrides.page ?? currentPage
    if (page > 1) params.set('page', String(page))
    return `/financeiro?${params.toString()}`
  }

  const [orders, allExpenses, entriesCount, entries, allTimeOrders, allTimeEntries] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start, lt: end }, status: { not: 'CANCELADO' } },
      select: { total: true, paymentMethod: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lt: end } },
    }),
    prisma.expense.count({
      where: { date: { gte: start, lt: end }, ...(typeFilter ? { type: typeFilter } : {}) },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lt: end }, ...(typeFilter ? { type: typeFilter } : {}) },
      orderBy: { date: 'desc' },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.aggregate({ where: { status: { not: 'CANCELADO' } }, _sum: { total: true } }),
    prisma.expense.groupBy({ by: ['type'], _sum: { amount: true } }),
  ])

  const ordersRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const manualIncome = allExpenses.filter((e) => e.type === 'RECEITA').reduce((sum, e) => sum + Number(e.amount), 0)
  const totalExpenses = allExpenses.filter((e) => e.type === 'DESPESA').reduce((sum, e) => sum + Number(e.amount), 0)
  const revenue = ordersRevenue + manualIncome
  const profit = revenue - totalExpenses

  const allTimeRevenue = Number(allTimeOrders._sum.total ?? 0)
    + Number(allTimeEntries.find((e) => e.type === 'RECEITA')?._sum.amount ?? 0)
  const allTimeExpenses = Number(allTimeEntries.find((e) => e.type === 'DESPESA')?._sum.amount ?? 0)
  const accountBalance = allTimeRevenue - allTimeExpenses

  const paymentBreakdown = (['PIX', 'CARTAO', 'DINHEIRO'] as const).map((method) => {
    const methodOrders = orders.filter((o) => o.paymentMethod === method)
    const total = methodOrders.reduce((sum, o) => sum + Number(o.total), 0)
    return {
      method,
      label: paymentLabel(method),
      total,
      count: methodOrders.length,
      pct: ordersRevenue > 0 ? Math.round((total / ordersRevenue) * 100) : 0,
    }
  })

  const totalPages = Math.max(1, Math.ceil(entriesCount / PAGE_SIZE))

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(start)

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Financeiro</h1>
        <p className="section-sub">Receitas, despesas e lucro por mês.</p>
      </div>

      <div className="inline-form" style={{ marginTop: 0, marginBottom: 20, alignItems: 'center' }}>
        <Link
          scroll={false}
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
            scroll={false}
            href={`/financeiro?month=${monthKey(next.year, next.month)}`}
            aria-label="Próximo mês"
            style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}
          >
            <ChevronRight size={18} />
          </Link>
        )}
      </div>

      <AccountBalanceBox amount={accountBalance} />

      <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric">
          <div className="metric-top"><div className="metric-icon"><CircleDollarSign /></div></div>
          <p>Receita do mês</p><h3>{formatBRL(revenue)}</h3><small>{orders.length} pedidos válidos{manualIncome > 0 ? ` + ${formatBRL(manualIncome)} extra` : ''}</small>
        </div>
        <div className="metric">
          <div className="metric-top"><div className="metric-icon"><TrendingDown /></div></div>
          <p>Despesas do mês</p><h3>{formatBRL(totalExpenses)}</h3><small>{allExpenses.filter((e) => e.type === 'DESPESA').length} despesas lançadas</small>
        </div>
        <div className="metric">
          <div className="metric-top"><div className="metric-icon"><TrendingUp /></div></div>
          <p>Lucro do mês</p><h3 style={{ color: profit >= 0 ? 'var(--green)' : '#b2465a' }}>{formatBRL(profit)}</h3><small>receita − despesas</small>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Meios de pagamento</h2><p>Como o dinheiro entrou em {monthLabel}</p></div></div>
        {ordersRevenue === 0 ? (
          <p className="subtext" style={{ marginTop: 18 }}>Nenhum pedido pago neste mês ainda.</p>
        ) : (
          paymentBreakdown.map((p) => (
            <div className="stock-row" key={p.method}>
              <div className="stock-info">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {p.method === 'PIX' && <QrCode size={13} />}
                  {p.method === 'CARTAO' && <CreditCard size={13} />}
                  {p.method === 'DINHEIRO' && <Banknote size={13} />}
                  {p.label} <small style={{ color: '#a39aa4' }}>({p.count} pedido{p.count === 1 ? '' : 's'})</small>
                </span>
                <b>{formatBRL(p.total)} <small style={{ color: '#a39aa4' }}>{p.pct}%</small></b>
              </div>
              <div className="progress"><i style={{ width: `${p.pct}%`, background: 'var(--purple)' }} /></div>
            </div>
          ))
        )}
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Novo lançamento</h2><p>Registre uma despesa ou uma receita extra e escolha o dia em que ocorreu</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ExpenseForm />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Lançamentos de {monthLabel}</h2><p>{entriesCount} lançamentos</p></div></div>

        <div className="chip-grid" style={{ marginTop: 16 }}>
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              scroll={false}
              href={buildHref({ type: tab.value, page: 1 })}
              className={`chip ${typeFilter === tab.value ? 'selected' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>DATA</th><th>TIPO</th><th>DESCRIÇÃO</th><th>VALOR</th><th></th></tr></thead>
            <tbody>
              {entries.map((e) => (
                <ExpenseRow
                  key={e.id}
                  id={e.id}
                  type={e.type}
                  description={e.description}
                  amount={Number(e.amount)}
                  date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(e.date)}
                />
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Nenhum lançamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="inline-form" style={{ marginTop: 16, alignItems: 'center', justifyContent: 'center' }}>
            {currentPage > 1 ? (
              <Link scroll={false} href={buildHref({ page: currentPage - 1 })} style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }} aria-label="Página anterior">
                <ChevronLeft size={18} />
              </Link>
            ) : (
              <span style={{ display: 'inline-flex', color: '#6d6370', opacity: 0.3 }}><ChevronLeft size={18} /></span>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 110, textAlign: 'center' }}>
              Página {currentPage} de {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link scroll={false} href={buildHref({ page: currentPage + 1 })} style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }} aria-label="Próxima página">
                <ChevronRight size={18} />
              </Link>
            ) : (
              <span style={{ display: 'inline-flex', color: '#6d6370', opacity: 0.3 }}><ChevronRight size={18} /></span>
            )}
          </div>
        )}
      </section>
    </>
  )
}
