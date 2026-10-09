import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatBRL } from '@/lib/format'
import { consignmentBalance, getConsignmentFee, hasOpenBalance } from '@/lib/consignment'
import { ClientForm } from '@/components/client-form'
import { ClientProductRateForm } from '@/components/client-product-rate-form'
import { ClientProductRateRow } from '@/components/client-product-rate-row'
import { DeleteClientButton } from '@/components/delete-client-button'
import { EditClientButton } from '@/components/edit-client-button'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const [clients, products, defaultPartnerAmount] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: {
        sales: true,
        orders: { where: { status: { not: 'CANCELADO' }, paid: true }, include: { items: true } },
        payouts: true,
        productRates: { include: { product: true }, orderBy: { product: { name: 'asc' } } },
      },
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    getConsignmentFee(),
  ])

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Clientes</h1>
        <p className="section-sub">Pontos onde vocês deixam açaí para vender, como o Vamo no Point.</p>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Novo cliente</h2><p>Cadastre um ponto de venda parceiro</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ClientForm defaultPartnerAmount={defaultPartnerAmount} />
        </div>
      </section>

      <div className="page-header"><h2 className="section-title" style={{ fontSize: 16 }}>Clientes cadastrados ({clients.length})</h2></div>
      {clients.length === 0 && <p className="subtext">Nenhum cliente cadastrado ainda.</p>}

      {clients.map((client) => {
        const manualTotal = client.sales.reduce((sum, s) => sum + Number(s.unitPrice) * s.quantity, 0)
        const manualQty = client.sales.reduce((sum, s) => sum + s.quantity, 0)
        const orderTotal = client.orders.reduce((sum, o) => sum + Number(o.total), 0)
        const orderQty = client.orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
        const total = manualTotal + orderTotal
        const qty = manualQty + orderQty
        const saleEntries = [
          ...client.sales.map((s) => ({ productId: s.productId, quantity: s.quantity })),
          ...client.orders.flatMap((o) => o.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))),
        ]
        const clientForCalc = {
          isCompany: client.isCompany,
          paymentType: client.paymentType,
          direction: client.direction,
          companyAmount: Number(client.companyAmount),
          partnerAmount: Number(client.partnerAmount),
        }
        const productRateMap = new Map(client.productRates.map((r) => [r.productId, { companyAmount: Number(r.companyAmount), partnerAmount: Number(r.partnerAmount) }]))
        const balanceGenerated = consignmentBalance(saleEntries, clientForCalc, productRateMap)
        const balancePaid = client.payouts.reduce((sum, p) => sum + Number(p.amount), 0)
        const balanceDue = balanceGenerated - balancePaid
        const showBalance = hasOpenBalance(clientForCalc)
        const balanceLabel = client.direction === 'RECEBER' ? 'a receber' : 'a repassar'
        return (
          <section className="panel" style={{ marginBottom: 16 }} key={client.id}>
            <div className="panel-head">
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {client.name}
                  {client.isCompany && <span className="status company">Empresa</span>}
                </h2>
                <p>{client.notes || 'Sem observações'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ display: 'block', fontSize: 16 }}>{formatBRL(total)}</b>
                  <small style={{ color: 'var(--muted)' }}>{qty} unidade{qty === 1 ? '' : 's'} vendida{qty === 1 ? '' : 's'}</small>
                </div>
                {showBalance && (
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ display: 'block', fontSize: 16, color: balanceDue > 0 ? 'var(--purple)' : 'var(--green)' }}>{formatBRL(balanceDue)}</b>
                    <small style={{ color: 'var(--muted)' }}>{balanceLabel}</small>
                  </div>
                )}
                <Link href={`/clientes/${client.id}`} className="link-button" style={{ textDecoration: 'none' }}>Ver vendas <span>→</span></Link>
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
                <DeleteClientButton id={client.id} />
              </div>
            </div>

            {!client.isCompany && (
              <details className="rates-toggle" style={{ marginTop: 16 }}>
                <summary>
                  Preços por sabor {client.productRates.length > 0 ? `(${client.productRates.length})` : ''}
                </summary>
                <div className="rates-toggle-body">
                  <ClientProductRateForm
                    clientId={client.id}
                    products={products.map((p) => ({ id: p.id, name: p.name, sizeLabel: p.sizeLabel }))}
                    defaultCompanyAmount={Number(client.companyAmount)}
                    defaultPartnerAmount={Number(client.partnerAmount)}
                  />
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
                </div>
              </details>
            )}
          </section>
        )
      })}
    </>
  )
}
