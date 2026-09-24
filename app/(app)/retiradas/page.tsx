import Link from 'next/link'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { brParts, formatBRL, TIME_ZONE, zonedDate } from '@/lib/format'
import { WithdrawalForm } from '@/components/withdrawal-form'
import { WithdrawalRow } from '@/components/withdrawal-row'

export const dynamic = 'force-dynamic'

function parseMonth(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split('-').map(Number)
    return { year, month: m }
  }
  const now = brParts(new Date())
  return { year: now.year, month: now.month + 1 }
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

const PARTNER_TINTS = ['tint-berry', 'tint-gold', 'tint-lilac', 'tint-green']

export default async function RetiradasPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams
  const { year, month } = parseMonth(monthParam)

  const start = zonedDate(year, month - 1)
  const end = zonedDate(year, month)
  const isCurrentMonth = end > new Date()

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  const [monthWithdrawals, allWithdrawals, allPartners] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: 'desc' },
    }),
    prisma.withdrawal.groupBy({ by: ['partnerName'], _sum: { amount: true } }),
    prisma.withdrawal.findMany({ distinct: ['partnerName'], select: { partnerName: true }, orderBy: { partnerName: 'asc' } }),
  ])

  const monthTotal = monthWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0)
  const allTimeTotal = allWithdrawals.reduce((sum, w) => sum + Number(w._sum.amount ?? 0), 0)

  const partnerNames = allPartners.map((p) => p.partnerName).sort()
  const partnerBreakdown = allWithdrawals
    .map((w) => ({ name: w.partnerName, total: Number(w._sum.amount ?? 0) }))
    .sort((a, b) => b.total - a.total)

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: TIME_ZONE }).format(start)

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Retiradas</h1>
        <p className="section-sub">Controle as retiradas suas e do seu sócio.</p>
      </div>

      <div className="inline-form" style={{ marginTop: 0, marginBottom: 20, alignItems: 'center' }}>
        <Link scroll={false} href={`/retiradas?month=${monthKey(prev.year, prev.month)}`} aria-label="Mês anterior" style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}>
          <ChevronLeft size={18} />
        </Link>
        <h2 style={{ margin: 0, fontSize: 16, textTransform: 'capitalize', minWidth: 160, textAlign: 'center' }}>{monthLabel}</h2>
        {isCurrentMonth ? (
          <span style={{ display: 'inline-flex', color: '#6d6370', opacity: 0.3 }}><ChevronRight size={18} /></span>
        ) : (
          <Link scroll={false} href={`/retiradas?month=${monthKey(next.year, next.month)}`} aria-label="Próximo mês" style={{ display: 'inline-flex', color: '#6d6370', textDecoration: 'none' }}>
            <ChevronRight size={18} />
          </Link>
        )}
      </div>

      <div className="metrics" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="metric fin-card accent-red">
          <div className="metric-top"><div className="metric-icon tint-red"><User /></div></div>
          <p>Retirado em {monthLabel}</p><h3>{formatBRL(monthTotal)}</h3><small>{monthWithdrawals.length} retirada{monthWithdrawals.length === 1 ? '' : 's'}</small>
        </div>
        <div className="metric fin-card accent-purple">
          <div className="metric-top"><div className="metric-icon tint-gold"><User /></div></div>
          <p>Total retirado desde o início</p><h3>{formatBRL(allTimeTotal)}</h3><small>{partnerNames.length} sócio{partnerNames.length === 1 ? '' : 's'}</small>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Por sócio</h2><p>Total retirado por cada sócio desde o início</p></div></div>
        {partnerBreakdown.length === 0 ? (
          <p className="subtext" style={{ marginTop: 18 }}>Nenhuma retirada registrada ainda.</p>
        ) : (
          <div style={{ marginTop: 4 }}>
            {partnerBreakdown.map((p, i) => (
              <div className="pay-row" key={p.name}>
                <div className={`pay-icon ${PARTNER_TINTS[i % PARTNER_TINTS.length]}`}><User size={15} /></div>
                <div className="pay-body">
                  <div className="stock-info">
                    <span>{p.name}</span>
                    <b>{formatBRL(p.total)} <small style={{ color: '#a39aa4' }}>{allTimeTotal > 0 ? Math.round((p.total / allTimeTotal) * 100) : 0}%</small></b>
                  </div>
                  <div className="progress"><i style={{ width: `${allTimeTotal > 0 ? Math.round((p.total / allTimeTotal) * 100) : 0}%`, background: 'var(--purple)' }} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Nova retirada</h2><p>Registre uma retirada sua ou do seu sócio</p></div></div>
        <div style={{ marginTop: 16 }}>
          <WithdrawalForm partners={partnerNames} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Retiradas de {monthLabel}</h2><p>{monthWithdrawals.length} lançamentos</p></div></div>
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>DATA</th><th>SÓCIO</th><th>TIPO</th><th>DESCRIÇÃO</th><th>VALOR</th><th></th></tr></thead>
            <tbody>
              {monthWithdrawals.map((w) => (
                <WithdrawalRow
                  key={w.id}
                  id={w.id}
                  partnerName={w.partnerName}
                  description={w.description}
                  amount={Number(w.amount)}
                  kind={w.kind}
                  date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(w.date)}
                />
              ))}
              {monthWithdrawals.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Nenhuma retirada neste mês.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
