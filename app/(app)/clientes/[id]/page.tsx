import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CircleDollarSign, Package, Zap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatBRL, TIME_ZONE } from '@/lib/format'
import { ClientSaleForm } from '@/components/client-sale-form'
import { ClientSaleRow } from '@/components/client-sale-row'
import { EditClientButton } from '@/components/edit-client-button'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const clientId = Number(id)

  const [client, products] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: { sales: { include: { product: true }, orderBy: { date: 'desc' } } },
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ])

  if (!client) notFound()

  const totalRevenue = client.sales.reduce((sum, s) => sum + Number(s.unitPrice) * s.quantity, 0)
  const totalQuantity = client.sales.reduce((sum, s) => sum + s.quantity, 0)
  const avgTicket = client.sales.length ? totalRevenue / client.sales.length : 0

  return (
    <>
      <div className="page-header">
        <Link href="/clientes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 12, marginBottom: 10 }}>
          <ArrowLeft size={14} /> Clientes
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 className="section-title" style={{ margin: 0 }}>{client.name}</h1>
          <EditClientButton id={client.id} name={client.name} notes={client.notes} />
        </div>
        <p className="section-sub">{client.notes || 'Vendas registradas para este cliente.'}</p>
      </div>

      <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric fin-card accent-green">
          <div className="metric-top"><div className="metric-icon tint-green"><CircleDollarSign /></div></div>
          <p>Total vendido</p><h3>{formatBRL(totalRevenue)}</h3><small>desde o início</small>
        </div>
        <div className="metric fin-card accent-gold">
          <div className="metric-top"><div className="metric-icon tint-gold"><Package /></div></div>
          <p>Unidades vendidas</p><h3>{totalQuantity}</h3><small>{client.sales.length} lançamento{client.sales.length === 1 ? '' : 's'}</small>
        </div>
        <div className="metric fin-card accent-berry">
          <div className="metric-top"><div className="metric-icon tint-berry"><Zap /></div></div>
          <p>Ticket médio</p><h3>{formatBRL(avgTicket)}</h3><small>por lançamento</small>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Registrar venda</h2><p>Anote o que foi vendido neste ponto</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ClientSaleForm
            clientId={client.id}
            products={products.map((p) => ({ id: p.id, name: p.name, price: Number(p.price), sizeLabel: p.sizeLabel }))}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Vendas registradas</h2><p>{client.sales.length} lançamentos</p></div></div>
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>DATA</th><th>SABOR</th><th>QTD</th><th>TOTAL</th><th></th></tr></thead>
            <tbody>
              {client.sales.map((sale) => (
                <ClientSaleRow
                  key={sale.id}
                  id={sale.id}
                  productName={sale.product.name}
                  quantity={sale.quantity}
                  unitPrice={Number(sale.unitPrice)}
                  date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(sale.date)}
                />
              ))}
              {client.sales.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Nenhuma venda registrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
