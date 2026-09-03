import { CircleDollarSign, ShoppingBag, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { getDashboardData } from '@/lib/dashboard'
import { brParts, formatBRL, formatTime, TIME_ZONE } from '@/lib/format'
import { OrderStatusBadge } from '@/components/order-status-badge'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await getDashboardData()

  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: TIME_ZONE,
  }).format(new Date())

  const hour = brParts(new Date()).hour
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">{todayLabel.toUpperCase()}</p>
          <h1>{greeting}, Pingo de Meio <span>✦</span></h1>
          <p className="subtext">Acompanhe o desempenho do Pingo de Meio hoje.</p>
        </div>
        <a className="export" href="/api/export/today"><TrendingUp size={16} /> Exportar relatório</a>
      </div>

      <div className="metrics">
        <Metric tint="tint-green" icon={<CircleDollarSign />} label="Receita de hoje" value={formatBRL(data.revenue)} trend={data.revenueTrendPct} note="vs. ontem" />
        <Metric tint="tint-gold" icon={<ShoppingBag />} label="Açaís vendidos" value={String(data.itemsSold)} trend={data.itemsSoldTrendPct} note="vs. ontem" />
        <Metric tint="tint-berry" icon={<Zap />} label="Ticket médio" value={formatBRL(data.avgTicket)} trend={data.avgTicketTrendPct} note="vs. ontem" />
        <Metric tint="tint-lilac" icon={<Sparkles />} label="Mais pedido" value={data.topProduct?.name ?? '—'} note={data.topProduct ? `${data.topProduct.count} pedidos hoje` : 'Sem pedidos hoje'} />
      </div>

      <div className="main-grid">
        <section className="panel sales-panel">
          <div className="panel-head">
            <div><h2>Vendas por horário</h2><p>Movimento de pedidos ao longo do dia</p></div>
          </div>
          <div className="chart">
            <div className="y-labels">
              <span>{formatBRL(data.maxHourlyRevenue)}</span>
              <span>{formatBRL(data.maxHourlyRevenue * 0.66)}</span>
              <span>{formatBRL(data.maxHourlyRevenue * 0.33)}</span>
              <span>R$ 0</span>
            </div>
            <div className="chart-area">
              <div className="grid-lines"><i /><i /><i /><i /></div>
              <div className="bars">
                {data.hourlySales.map(({ hour: h, revenue }) => {
                  const height = Math.max(4, Math.round((revenue / data.maxHourlyRevenue) * 100))
                  return (
                    <div className="bar-col" key={h}>
                      <div className={`bar ${revenue === data.maxHourlyRevenue && revenue > 0 ? 'highlight' : ''}`} style={{ height: `${height}%` }} title={formatBRL(revenue)} />
                    </div>
                  )
                })}
              </div>
              <div className="x-labels">
                {data.hourlySales.filter((_, i) => i % 2 === 0).map(({ hour: h }) => <span key={h}>{h}h</span>)}
              </div>
            </div>
          </div>
        </section>

        <section className="panel category-panel">
          <div className="panel-head">
            <div><h2>Pedidos por sabor</h2><p>Distribuição de vendas hoje</p></div>
          </div>
          {data.flavorTotal > 0 ? (
            <div className="donut-wrap">
              <div className="donut" style={{ background: donutGradient(data.flavorDistribution) }}>
                <div><b>{data.flavorTotal}</b><span>pedidos</span></div>
              </div>
              <ul>
                {data.flavorDistribution.map((s) => <Legend key={s.label} color={s.color} label={s.label} value={`${s.pct}%`} />)}
              </ul>
            </div>
          ) : (
            <p className="subtext" style={{ padding: '30px 0', textAlign: 'center' }}>Nenhum pedido registrado hoje ainda.</p>
          )}
        </section>
      </div>

      <div className="bottom-grid">
        <section className="panel stock-panel">
          <div className="panel-head">
            <div><h2>Estoque em atenção</h2><p>Ingredientes que precisam de reposição</p></div>
            <a className="link-button" href="/estoque">Ver estoque <span>→</span></a>
          </div>
          {data.lowStock.length === 0 && <p className="subtext" style={{ marginTop: 18 }}>Estoque em dia.</p>}
          {data.lowStock.map((s) => (
            <div className="stock-row" key={s.id}>
              <div className="stock-info"><span>{s.name}</span><b className={s.status}>{s.amount}</b></div>
              <div className="progress"><i className={s.status} style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </section>

        <section className="panel orders-panel">
          <div className="panel-head">
            <div><h2>Pedidos recentes</h2><p>Últimas vendas registradas</p></div>
            <a className="link-button" href="/pedidos">Ver todos <span>→</span></a>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>PEDIDO</th><th>HORÁRIO</th><th>PRODUTO</th><th>TOTAL</th><th>STATUS</th></tr></thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.code}</b></td>
                    <td>{formatTime(o.time)}</td>
                    <td><b>{o.productName}</b><small>{o.quantity > 1 ? `${o.quantity} unidades` : '1 unidade'}</small></td>
                    <td><b>{formatBRL(o.total)}</b><small>{o.payment}</small></td>
                    <td><OrderStatusBadge status={o.status} /></td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Nenhum pedido ainda. Crie um no Terminal PDV.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

function donutGradient(dist: { color: string; pct: number }[]) {
  const colorMap: Record<string, string> = { berry: 'var(--berry)', lilac: '#b99ac7', gold: 'var(--gold)', sage: '#9ab29b' }
  let acc = 0
  const stops = dist.map((d) => {
    const from = acc
    acc += d.pct
    return `${colorMap[d.color] ?? '#ccc'} ${from}% ${acc}%`
  })
  if (acc < 100) stops.push(`#eee ${acc}% 100%`)
  return `conic-gradient(${stops.join(', ')})`
}

function Metric({ icon, label, value, trend, note, tint }: { icon: React.ReactNode; label: string; value: string; trend?: number | null; note: string; tint: string }) {
  return (
    <div className="metric">
      <div className="metric-top">
        <div className={`metric-icon ${tint}`}>{icon}</div>
        {trend !== undefined && trend !== null && (
          <span className={`trend ${trend < 0 ? 'negative' : ''}`}>{trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%</span>
        )}
      </div>
      <p>{label}</p>
      <h3>{value}</h3>
      <small>{note}</small>
    </div>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return <li><i className={color} /> <span>{label}</span><b>{value}</b></li>
}
