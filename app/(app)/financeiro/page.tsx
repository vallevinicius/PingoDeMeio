import Link from 'next/link'
import { Banknote, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, QrCode, TrendingDown, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { brParts, formatBRL, paymentLabel, pctChange, TIME_ZONE, zonedDate } from '@/lib/format'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseRow } from '@/components/expense-row'
import { AllTimeRevenueBox } from '@/components/all-time-revenue-box'

export const dynamic = 'force-dynamic'

function parseMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split('-').map(Number)
    return { year, month: m }
  }
  const now = brParts(new Date())
  return { year: now.year, month: now.month + 1 }
}

function parseYear(yearParam: string | undefined, fallback: number) {
  const y = Number(yearParam)
  return Number.isInteger(y) && y > 1900 && y < 3000 ? y : fallback
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

function TrendBadge({ pct, goodDirection }: { pct: number | null; goodDirection: 'up' | 'down' }) {
  if (pct === null) return null
  const isUp = pct >= 0
  const isGood = goodDirection === 'up' ? isUp : !isUp
  return (
    <span className={`trend ${isGood ? '' : 'negative'}`}>
      {isUp ? '↗' : '↘'} {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ view?: string; month?: string; year?: string; type?: string; page?: string }> }) {
  const { view: viewParam, month: monthParam, year: yearParam, type: typeParam, page: pageParam } = await searchParams
  const view = viewParam === 'year' ? 'year' : 'month'
  const { year: monthYear, month } = parseMonth(monthParam)
  const year = parseYear(yearParam, monthYear)
  const typeFilter = typeParam === 'DESPESA' || typeParam === 'RECEITA' ? typeParam : undefined
  const currentPage = Math.max(1, Number(pageParam) || 1)

  const start = view === 'year' ? zonedDate(year, 0) : zonedDate(monthYear, month - 1)
  const end = view === 'year' ? zonedDate(year + 1, 0) : zonedDate(monthYear, month)
  const isCurrentPeriod = end > new Date()

  const prevMonth = shiftMonth(monthYear, month, -1)
  const nextMonth = shiftMonth(monthYear, month, 1)
  const prevStart = view === 'year' ? zonedDate(year - 1, 0) : zonedDate(prevMonth.year, prevMonth.month - 1)

  function periodHref(p: { view: 'month' | 'year'; year: number; month?: number }) {
    const params = new URLSearchParams()
    params.set('view', p.view)
    if (p.view === 'year') params.set('year', String(p.year))
    else params.set('month', monthKey(p.year, p.month!))
    if (typeFilter) params.set('type', typeFilter)
    return `/financeiro?${params.toString()}`
  }

  function buildHref(overrides: { type?: string; page?: number }) {
    const params = new URLSearchParams()
    params.set('view', view)
    if (view === 'year') params.set('year', String(year))
    else params.set('month', monthKey(monthYear, month))
    const type = 'type' in overrides ? overrides.type : typeFilter
    if (type) params.set('type', type)
    const page = overrides.page ?? currentPage
    if (page > 1) params.set('page', String(page))
    return `/financeiro?${params.toString()}`
  }

  const [orders, allExpenses, entriesCount, entries, allTimeOrders, allTimeEntries, firstOrder, firstExpense, prevOrders, prevExpenses] = await Promise.all([
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
    prisma.order.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
    prisma.expense.findFirst({ where: { type: 'RECEITA' }, orderBy: { date: 'asc' }, select: { date: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: prevStart, lt: start }, status: { not: 'CANCELADO' } },
      select: { total: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: prevStart, lt: start } },
      select: { type: true, amount: true },
    }),
  ])

  const ordersRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const manualIncome = allExpenses.filter((e) => e.type === 'RECEITA').reduce((sum, e) => sum + Number(e.amount), 0)
  const totalExpenses = allExpenses.filter((e) => e.type === 'DESPESA').reduce((sum, e) => sum + Number(e.amount), 0)
  const revenue = ordersRevenue + manualIncome
  const profit = revenue - totalExpenses

  const allTimeRevenue = Number(allTimeOrders._sum.total ?? 0)
    + Number(allTimeEntries.find((e) => e.type === 'RECEITA')?._sum.amount ?? 0)

  const prevOrdersRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const prevManualIncome = prevExpenses.filter((e) => e.type === 'RECEITA').reduce((sum, e) => sum + Number(e.amount), 0)
  const prevTotalExpenses = prevExpenses.filter((e) => e.type === 'DESPESA').reduce((sum, e) => sum + Number(e.amount), 0)
  const prevRevenue = prevOrdersRevenue + prevManualIncome
  const prevProfit = prevRevenue - prevTotalExpenses

  const revenueTrendPct = pctChange(revenue, prevRevenue)
  const expensesTrendPct = pctChange(totalExpenses, prevTotalExpenses)
  const profitTrendPct = pctChange(profit, prevProfit)

  const PAYMENT_COLORS = { PIX: 'var(--berry)', CARTAO: '#9d6fae', DINHEIRO: 'var(--gold)' } as const
  const PAYMENT_ICON_TINT = { PIX: 'tint-berry', CARTAO: 'tint-lilac', DINHEIRO: 'tint-gold' } as const

  const paymentBreakdown = (['PIX', 'CARTAO', 'DINHEIRO'] as const).map((method) => {
    const methodOrders = orders.filter((o) => o.paymentMethod === method)
    const total = methodOrders.reduce((sum, o) => sum + Number(o.total), 0)
    return {
      method,
      label: paymentLabel(method),
      color: PAYMENT_COLORS[method],
      iconTint: PAYMENT_ICON_TINT[method],
      total,
      count: methodOrders.length,
      pct: ordersRevenue > 0 ? Math.round((total / ordersRevenue) * 100) : 0,
    }
  })

  const totalPages = Math.max(1, Math.ceil(entriesCount / PAGE_SIZE))

  const sinceDate = [firstOrder?.createdAt, firstExpense?.date]
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => a.getTime() - b.getTime())[0] ?? null

  const periodLabel = view === 'year' ? String(year) : new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: TIME_ZONE }).format(start)
  const periodNoun = view === 'year' ? 'ano' : 'mês'
  const comparisonNoun = view === 'year' ? 'ano anterior' : 'mês anterior'

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Financeiro</h1>
        <p className="section-sub">Receitas, despesas e lucro por mês ou por ano.</p>
      </div>

      <div className="inline-form" style={{ marginTop: 0, marginBottom: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            scroll={false}
            href={view === 'year' ? periodHref({ view: 'year', year: year - 1 }) : periodHref({ view: 'month', year: prevMonth.year, month: prevMonth.month })}
            aria-label={view === 'year' ? 'Ano anterior' : 'Mês anterior'}
            style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}
          >
            <ChevronLeft size={18} />
          </Link>
          <h2 style={{ margin: 0, fontSize: 16, textTransform: 'capitalize', minWidth: 160, textAlign: 'center' }}>{periodLabel}</h2>
          {isCurrentPeriod ? (
            <span style={{ display: 'inline-flex', color: '#6d6370', opacity: 0.3 }}><ChevronRight size={18} /></span>
          ) : (
            <Link
              scroll={false}
              href={view === 'year' ? periodHref({ view: 'year', year: year + 1 }) : periodHref({ view: 'month', year: nextMonth.year, month: nextMonth.month })}
              aria-label={view === 'year' ? 'Próximo ano' : 'Próximo mês'}
              style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}
            >
              <ChevronRight size={18} />
            </Link>
          )}
        </div>

        <div className="chip-grid">
          <Link scroll={false} href={periodHref({ view: 'month', year: monthYear, month })} className={`chip ${view === 'month' ? 'selected' : ''}`} style={{ textDecoration: 'none' }}>Mês</Link>
          <Link scroll={false} href={periodHref({ view: 'year', year })} className={`chip ${view === 'year' ? 'selected' : ''}`} style={{ textDecoration: 'none' }}>Ano</Link>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <AllTimeRevenueBox amount={allTimeRevenue} since={sinceDate} />
      </div>

      <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric fin-card accent-green">
          <div className="metric-top">
            <div className="metric-icon tint-green"><CircleDollarSign /></div>
            <TrendBadge pct={revenueTrendPct} goodDirection="up" />
          </div>
          <p>Receita do {periodNoun}</p><h3>{formatBRL(revenue)}</h3>
          <small>{orders.length} pedidos válidos{manualIncome > 0 ? ` + ${formatBRL(manualIncome)} extra` : ''}{revenueTrendPct !== null ? ` · vs. ${comparisonNoun}` : ''}</small>
        </div>
        <div className="metric fin-card accent-red">
          <div className="metric-top">
            <div className="metric-icon tint-red"><TrendingDown /></div>
            <TrendBadge pct={expensesTrendPct} goodDirection="down" />
          </div>
          <p>Despesas do {periodNoun}</p><h3>{formatBRL(totalExpenses)}</h3>
          <small>{allExpenses.filter((e) => e.type === 'DESPESA').length} despesas lançadas{expensesTrendPct !== null ? ` · vs. ${comparisonNoun}` : ''}</small>
        </div>
        <div className="metric fin-card accent-purple">
          <div className="metric-top">
            <div className={`metric-icon ${profit >= 0 ? 'tint-green' : 'tint-red'}`}><TrendingUp /></div>
            <TrendBadge pct={profitTrendPct} goodDirection="up" />
          </div>
          <p>Lucro do {periodNoun}</p><h3 style={{ color: profit >= 0 ? 'var(--green)' : '#b2465a' }}>{formatBRL(profit)}</h3>
          <small>receita − despesas{profitTrendPct !== null ? ` · vs. ${comparisonNoun}` : ''}</small>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Meios de pagamento</h2><p>Como o dinheiro entrou em {periodLabel}</p></div></div>
        {ordersRevenue === 0 ? (
          <p className="subtext" style={{ marginTop: 18 }}>Nenhum pedido pago neste período ainda.</p>
        ) : (
          <div style={{ marginTop: 4 }}>
            {paymentBreakdown.map((p) => (
              <div className="pay-row" key={p.method}>
                <div className={`pay-icon ${p.iconTint}`}>
                  {p.method === 'PIX' && <QrCode size={15} />}
                  {p.method === 'CARTAO' && <CreditCard size={15} />}
                  {p.method === 'DINHEIRO' && <Banknote size={15} />}
                </div>
                <div className="pay-body">
                  <div className="stock-info">
                    <span>{p.label} <small style={{ color: '#a39aa4' }}>({p.count} pedido{p.count === 1 ? '' : 's'})</small></span>
                    <b>{formatBRL(p.total)} <small style={{ color: '#a39aa4' }}>{p.pct}%</small></b>
                  </div>
                  <div className="progress"><i style={{ width: `${p.pct}%`, background: p.color }} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Novo lançamento</h2><p>Registre uma despesa ou uma receita extra e escolha o dia em que ocorreu</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ExpenseForm />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Lançamentos de {periodLabel}</h2><p>{entriesCount} lançamentos</p></div></div>

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
                  date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(e.date)}
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
