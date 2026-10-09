import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CircleDollarSign, HandCoins, Package, Zap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatBRL, formatOrderCode, TIME_ZONE } from '@/lib/format'
import { consignmentBalance, hasOpenBalance } from '@/lib/consignment'
import { ClientSaleForm } from '@/components/client-sale-form'
import { ClientSaleRow } from '@/components/client-sale-row'
import { ClientPayoutForm } from '@/components/client-payout-form'
import { ClientPayoutRow } from '@/components/client-payout-row'
import { ClientDeliveryForm } from '@/components/client-delivery-form'
import { ClientDeliveryRow } from '@/components/client-delivery-row'
import { ClientProductRateForm } from '@/components/client-product-rate-form'
import { ClientProductRateRow } from '@/components/client-product-rate-row'
import { EditClientButton } from '@/components/edit-client-button'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const clientId = Number(id)

  const [client, products] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        sales: { include: { product: true }, orderBy: { date: 'desc' } },
        orders: {
          where: { status: { not: 'CANCELADO' }, paid: true },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
        },
        payouts: { orderBy: { date: 'desc' } },
        deliveries: { include: { product: true }, orderBy: { date: 'desc' } },
        productRates: { include: { product: true }, orderBy: { product: { name: 'asc' } } },
      },
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ])

  if (!client) notFound()

  const manualEntries = client.sales.map((sale) => ({
    key: `manual-${sale.id}`,
    saleId: sale.id as number | null,
    productId: sale.productId,
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
      productId: item.productId,
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
  const clientForCalc = {
    isCompany: client.isCompany,
    paymentType: client.paymentType,
    direction: client.direction,
    companyAmount: Number(client.companyAmount),
    partnerAmount: Number(client.partnerAmount),
  }
  const productRateMap = new Map(client.productRates.map((r) => [r.productId, { companyAmount: Number(r.companyAmount), partnerAmount: Number(r.partnerAmount) }]))
  const payoutGenerated = consignmentBalance(entries, clientForCalc, productRateMap)
  const payoutPaid = client.payouts.reduce((sum, p) => sum + Number(p.amount), 0)
  const payoutDue = payoutGenerated - payoutPaid
  const showPayout = hasOpenBalance(clientForCalc)
  const isReceivable = client.direction === 'RECEBER'

  const stockByProduct = new Map<number, { name: string; sizeLabel: string; delivered: number; sold: number }>()
  for (const delivery of client.deliveries) {
    const row = stockByProduct.get(delivery.productId) ?? { name: delivery.product.name, sizeLabel: delivery.product.sizeLabel, delivered: 0, sold: 0 }
    row.delivered += delivery.quantity
    stockByProduct.set(delivery.productId, row)
  }
  for (const entry of entries) {
    const row = stockByProduct.get(entry.productId)
    if (row) row.sold += entry.quantity
  }
  const stockRows = [...stockByProduct.entries()].map(([productId, row]) => ({ productId, ...row, remaining: row.delivered - row.sold }))
  const totalDelivered = client.deliveries.reduce((sum, d) => sum + d.quantity, 0)

  return (
    <>
      <div className="page-header">
        <Link href="/clientes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 12, marginBottom: 10 }}>
          <ArrowLeft size={14} /> Clientes
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 className="section-title" style={{ margin: 0 }}>{client.name}</h1>
          {client.isCompany && <span className="status company">Empresa</span>}
          <EditClientButton client={{
            id: client.id,
            name: client.name,
            notes: client.notes,
            isCompany: client.isCompany,
            paymentType: client.paymentType,
            direction: client.direction,
            siteSalePrice: Number(client.siteSalePrice),
            companyAmount: Number(client.companyAmount),
            partnerAmount: Number(client.partnerAmount),
          }} />
        </div>
        <p className="section-sub">{client.notes || 'Vendas registradas para este cliente.'}</p>
      </div>

      <div className="metrics" style={{ gridTemplateColumns: showPayout ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }}>
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
        {showPayout && (
          <div className="metric fin-card accent-purple">
            <div className="metric-top"><div className="metric-icon tint-lilac"><HandCoins /></div></div>
            <p>{isReceivable ? 'Ainda a receber' : 'Ainda a repassar'}</p>
            <h3 style={{ color: payoutDue > 0 ? undefined : 'var(--green)' }}>{formatBRL(payoutDue)}</h3>
            <small>{formatBRL(payoutGenerated)} gerado · {formatBRL(payoutPaid)} já {isReceivable ? 'recebido' : 'repassado'}</small>
          </div>
        )}
      </div>

      {!client.isCompany && (
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-head"><div><h2>Preços por sabor</h2><p>Nossos açaís têm sabores com preços diferentes — defina aqui quanto cada um vende no local e quanto a empresa recebe</p></div></div>
          <div style={{ marginTop: 16 }}>
            <ClientProductRateForm
              clientId={client.id}
              products={products.map((p) => ({ id: p.id, name: p.name, sizeLabel: p.sizeLabel }))}
              defaultCompanyAmount={Number(client.companyAmount)}
              defaultPartnerAmount={Number(client.partnerAmount)}
            />
          </div>
          {client.productRates.length > 0 && (
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table>
                <thead><tr><th>SABOR</th><th>VENDA NO LOCAL</th><th>EMPRESA RECEBE</th><th>CLIENTE RECEBE</th><th></th></tr></thead>
                <tbody>
                  {client.productRates.map((r) => (
                    <ClientProductRateRow
                      key={r.id}
                      id={r.id}
                      productName={r.product.name}
                      siteSalePrice={Number(r.siteSalePrice)}
                      companyAmount={Number(r.companyAmount)}
                      partnerAmount={Number(r.partnerAmount)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {client.productRates.length === 0 && (
            <p className="subtext" style={{ marginTop: 16 }}>Nenhum sabor com preço próprio ainda — usando o padrão do cliente ({formatBRL(Number(client.companyAmount))} empresa / {formatBRL(Number(client.partnerAmount))} cliente, por unidade).</p>
          )}
        </section>
      )}

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Estoque no cliente</h2><p>O que já foi entregue e quanto ainda deve estar lá, por sabor</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ClientDeliveryForm
            clientId={client.id}
            products={products.map((p) => ({ id: p.id, name: p.name, sizeLabel: p.sizeLabel }))}
          />
        </div>

        {stockRows.length > 0 && (
          <div style={{ marginTop: 20 }}>
            {stockRows.map((row) => (
              <div className="stock-row" key={row.productId}>
                <div className="stock-info">
                  <span>{row.name} <small style={{ color: '#a39aa4' }}>({row.sizeLabel})</small></span>
                  <b className={row.remaining <= 0 ? 'low' : row.remaining <= row.delivered * 0.25 ? 'medium' : 'good'}>
                    {row.remaining < 0 ? 0 : row.remaining} em estoque
                  </b>
                </div>
                <small style={{ color: 'var(--muted)' }}>{row.delivered} entregue{row.delivered === 1 ? '' : 's'}, {row.sold} vendido{row.sold === 1 ? '' : 's'}</small>
              </div>
            ))}
          </div>
        )}

        {client.deliveries.length > 0 && (
          <div className="table-wrap" style={{ marginTop: 20 }}>
            <table>
              <thead><tr><th>DATA</th><th>SABOR</th><th>QTD</th><th>OBSERVAÇÃO</th><th></th></tr></thead>
              <tbody>
                {client.deliveries.map((d) => (
                  <ClientDeliveryRow
                    key={d.id}
                    id={d.id}
                    productName={d.product.name}
                    quantity={d.quantity}
                    note={d.note}
                    date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(d.date)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {client.deliveries.length === 0 && (
          <p className="subtext" style={{ marginTop: 16 }}>Nenhuma entrega registrada ainda. Total entregue: {totalDelivered}.</p>
        )}
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Registrar venda</h2><p>Anote o que foi vendido neste ponto fora do Terminal PDV</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ClientSaleForm
            clientId={client.id}
            products={products.map((p) => ({ id: p.id, name: p.name, price: Number(p.price), sizeLabel: p.sizeLabel }))}
          />
        </div>
      </section>

      {showPayout && (
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-head">
            <div>
              <h2>{isReceivable ? 'Registrar recebimento' : 'Registrar repasse'}</h2>
              <p>{isReceivable ? 'Anote quanto este cliente já pagou à empresa' : 'Anote quanto já foi pago a este ponto de venda'}</p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <ClientPayoutForm clientId={client.id} direction={client.direction} />
          </div>
          {client.payouts.length > 0 && (
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table>
                <thead><tr><th>DATA</th><th>VALOR</th><th>FORMA</th><th>OBSERVAÇÃO</th><th></th></tr></thead>
                <tbody>
                  {client.payouts.map((p) => (
                    <ClientPayoutRow
                      key={p.id}
                      id={p.id}
                      amount={Number(p.amount)}
                      paymentMethod={p.paymentMethod}
                      note={p.note}
                      date={new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE }).format(p.date)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

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
