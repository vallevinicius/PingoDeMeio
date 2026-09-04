import { CircleDollarSign, ShoppingBag, Zap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatBRL, formatOrderCode, formatTime, paymentLabel, startOfDayBR } from '@/lib/format'
import { OrderStatusSelect } from '@/components/order-status-select'
import { PaidToggle } from '@/components/paid-toggle'
import { DeleteOrderButton } from '@/components/delete-order-button'

export const dynamic = 'force-dynamic'

export default async function VendasDoDiaPage() {
  const start = startOfDayBR(new Date())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  })

  const validOrders = orders.filter((o) => o.status === 'CONCLUIDO' && o.paid)
  const revenue = validOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const avgTicket = validOrders.length ? revenue / validOrders.length : 0

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Vendas do dia</h1>
        <p className="section-sub">Pedidos registrados hoje.</p>
      </div>

      <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric fin-card accent-green">
          <div className="metric-top"><div className="metric-icon tint-green"><CircleDollarSign /></div></div>
          <p>Receita de hoje</p><h3>{formatBRL(revenue)}</h3><small>{validOrders.length} pedidos válidos</small>
        </div>
        <div className="metric fin-card accent-gold">
          <div className="metric-top"><div className="metric-icon tint-gold"><ShoppingBag /></div></div>
          <p>Total de pedidos</p><h3>{orders.length}</h3><small>incluindo cancelados</small>
        </div>
        <div className="metric fin-card accent-berry">
          <div className="metric-top"><div className="metric-icon tint-berry"><Zap /></div></div>
          <p>Ticket médio</p><h3>{formatBRL(avgTicket)}</h3><small>por pedido válido</small>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head"><div><h2>Pedidos de hoje</h2><p>Ordenados do mais recente para o mais antigo</p></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>PEDIDO</th><th>HORÁRIO</th><th>CLIENTE</th><th>PRODUTO</th><th>TOTAL</th><th>PAGAMENTO</th><th>PAGO</th><th>STATUS</th><th></th></tr></thead>
            <tbody>
              {orders.map((order) => {
                const item = order.items[0]
                return (
                  <tr key={order.id}>
                    <td><b>{formatOrderCode(order.id)}</b></td>
                    <td>{formatTime(order.createdAt)}</td>
                    <td>{order.customerName ?? '—'}</td>
                    <td><b>{item?.product.name ?? '—'}</b><small>{item ? `${item.quantity}x` : ''}</small></td>
                    <td><b>{formatBRL(Number(order.total))}</b></td>
                    <td>{paymentLabel(order.paymentMethod)}</td>
                    <td><PaidToggle id={order.id} paid={order.paid} /></td>
                    <td><OrderStatusSelect id={order.id} status={order.status} /></td>
                    <td><DeleteOrderButton id={order.id} /></td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24 }}>Nenhum pedido hoje ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
