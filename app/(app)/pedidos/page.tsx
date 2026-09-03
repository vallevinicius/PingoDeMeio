import { prisma } from '@/lib/prisma'
import { formatBRL, formatOrderCode, formatTime, paymentLabel, TIME_ZONE } from '@/lib/format'
import { OrderStatusSelect } from '@/components/order-status-select'
import { PaidToggle } from '@/components/paid-toggle'
import { DeleteOrderButton } from '@/components/delete-order-button'
import { EditOrderButton } from '@/components/edit-order-button'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams

  const where: Prisma.OrderWhereInput = {}
  if (status) where.status = status as Prisma.OrderWhereInput['status']
  if (q) {
    const digits = q.replace(/\D/g, '')
    const possibleId = digits ? Number(digits) - 1000 : null
    where.OR = [
      { items: { some: { product: { name: { contains: q } } } } },
      { customerName: { contains: q } },
      ...(possibleId && possibleId > 0 ? [{ id: possibleId }] : []),
    ]
  }

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { items: { include: { product: true } } },
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Histórico de pedidos</h1>
        <p className="section-sub">Todos os pedidos registrados no sistema.</p>
      </div>

      <section className="panel">
        <form className="inline-form" style={{ marginTop: 0, marginBottom: 20 }}>
          <div className="field-group">
            <label>Buscar por produto, cliente ou nº do pedido</label>
            <input name="q" defaultValue={q ?? ''} placeholder="Ex: Morango ou 1048" style={{ width: 240 }} />
          </div>
          <div className="field-group">
            <label>Status</label>
            <select name="status" defaultValue={status ?? ''}>
              <option value="">Todos</option>
              <option value="PREPARANDO">Preparando</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <button className="submit-btn" style={{ width: 'auto', padding: '10px 18px' }}>Filtrar</button>
        </form>

        <div className="table-wrap">
          <table>
            <thead><tr><th>PEDIDO</th><th>HORÁRIO</th><th>CLIENTE</th><th>PRODUTO</th><th>TOTAL</th><th>PAGAMENTO</th><th>PAGO</th><th>STATUS</th><th></th><th></th></tr></thead>
            <tbody>
              {orders.map((order) => {
                const item = order.items[0]
                return (
                  <tr key={order.id}>
                    <td><b>{formatOrderCode(order.id)}</b></td>
                    <td>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: TIME_ZONE }).format(order.createdAt)} {formatTime(order.createdAt)}</td>
                    <td>{order.customerName ?? '—'}</td>
                    <td><b>{item?.product.name ?? '—'}</b><small>{item ? `${item.quantity}x` : ''}</small></td>
                    <td><b>{formatBRL(Number(order.total))}</b></td>
                    <td>{paymentLabel(order.paymentMethod)}</td>
                    <td><PaidToggle id={order.id} paid={order.paid} /></td>
                    <td><OrderStatusSelect id={order.id} status={order.status} /></td>
                    <td>
                      <EditOrderButton
                        order={{
                          id: order.id,
                          customerName: order.customerName,
                          paymentMethod: order.paymentMethod,
                          items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                        }}
                        products={products.map((p) => ({ id: p.id, name: p.name, price: Number(p.price), sizeLabel: p.sizeLabel }))}
                      />
                    </td>
                    <td><DeleteOrderButton id={order.id} /></td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>Nenhum pedido encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
