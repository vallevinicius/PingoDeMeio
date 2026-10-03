import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CircleDollarSign, HandCoins, Package, Zap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatBRL, formatOrderCode, TIME_ZONE } from '@/lib/format'
import { consignmentPayout, getConsignmentFee } from '@/lib/consignment'
import { ClientSaleForm } from '@/components/client-sale-form'
import { ClientSaleRow } from '@/components/client-sale-row'
import { EditClientButton } from '@/components/edit-client-button'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const clientId = Number(id)

  const [client, products, consignmentFee] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        sales: { include: { product: true }, orderBy: { date: 'desc' } },
        orders: {
          where: { status: { not: 'CANCELADO' }, paid: true },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    getConsignmentFee(),
  ])

  if (!client) notFound()

  const manualEntries = client.sales.map((sale) => ({
    key: `manual-${sale.id}`,
    saleId: sale.id as number | null,
    date: sale.date,
    productName: sale.product.name,
    quantity: sale.quantity,
    unitPrice: Number(sale.unitPrice),
    source: 'Manual',
  }))

  const orderEntries = client.orders.flatMap((order) =>
    order.items.map((item, i) => ({
      key: `order-${order.id}-${i}`,
      saleId: null as number | null,
      date: order.createdAt,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      source: `Terminal PDV · ${formatOrderCode(order.id)}`,
    })),
  )

  const entries = [...manualEntries, ...orderEntries].sort((a, b) => b.date.getTime() - a.date.getTime())

  const totalRevenue = entries.reduce((sum, e) => sum + e.unitPrice * e.quantity, 0)
  const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0)
  const avgTicket = entries.length ? totalRevenue / entries.length : 0
  const payout = consignmentPayout(totalQuantity, client.isCompany, consignmentFee)

  return (
    <>
      <div className="page-header">
        <Link href="/clientes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 12, marginBottom: 10 }}>
          <ArrowLeft size={14} /> Clientes
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 className="section-title" style={{ margin: 0 }}>{client.name}</h1>
          {client.isCompany && <span className="status company">Empresa</span>}
          <EditClientButton id={client.id} name={client.name} notes={client.notes} isCompany={client.isCompany} />
        </div>
        <p className="section-sub">{client.notes || 'Vendas registradas para este cliente.'}</p>
      </div>

      <div className="metrics" style={{ gridTemplateColumns: client.isCompany ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)' }}>
        <div className="metric fin-card accent-green">
          <div className="metric-top"><div className="metric-icon tint-green"><CircleDollarSign /></div></div>
          <p>Total vendido</p><h3>{formatBRL(totalRevenue)}</h3><small>desde o início</small>
        </div>
        <div className="metric fin-card accent-gold">
          <div className="metric-top"><div className="metric-icon tint-gold"><Package /></div></div>
          <p>Unidades vendidas</p><h3>{totalQuantity}</h3><small>{entries.length} lançamento{entries.length === 1 ? '' : 's'}</small>
        </div>
        <div className="metric fin-card accent-berry">
          <div className="metric-top"><div className="metric-icon tint-berry"><Zap /></div></div>
          <p>Ticket médio</p><h3>{formatBRL(avgTicket)}</h3><small>por lançamento</small>
        </div>
        {!client.isCompany && (
          <div className="metric fin-card accent-purple">
            <div className="metric-top"><div className="metric-icon tint-lilac"><HandCoins /></div></div>
            <p>A repassar</p><h3>{formatBRL(payout)}</h3><small>{formatBRL(consignmentFee)} por unidade vendida</small>
          </div>
        )}
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Registrar venda</h2><p>Anote o que foi vendido neste ponto fora do Terminal PDV</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ClientSaleForm
            clientId={client.id}
            products={products.map((p) => ({ id: p.id, name: p.name, price: Number(p.price), sizeLabel: p.sizeLabel }))}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Vendas registradas</h2><p>{entries.length} lançamentos (manuais + Terminal PDV)</p></div></div>
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>DATA</th><th>SABOR</th><th>QTD</th><th>TOTAL</th><th>ORIGEM</th><th></th></tr></thead>
            <tbody>
              {entries.map((entry) => (
                entry.saleId !== null ? (
                  <ClientSaleRow
                    key={entry.key}
                    id={entry.saleId}
                    productName={entry.productName}
                    quantity={entry.quantity}
                    unitPrice={entry.unitPrice}
                    date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(entry.date)}
                  />
                ) : (
                  <tr key={entry.key}>
                    <td>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(entry.date)}</td>
                    <td><b>{entry.productName}</b></td>
                    <td>{entry.quantity}x</td>
                    <td><b>{formatBRL(entry.unitPrice * entry.quantity)}</b></td>
                    <td><small style={{ color: 'var(--muted)' }}>{entry.source}</small></td>
                    <td></td>
                  </tr>
                )
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Nenhuma venda registrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
