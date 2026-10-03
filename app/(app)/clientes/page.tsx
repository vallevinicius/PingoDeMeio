import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatBRL } from '@/lib/format'
import { consignmentPayout, getConsignmentFee } from '@/lib/consignment'
import { ClientForm } from '@/components/client-form'
import { DeleteClientButton } from '@/components/delete-client-button'
import { EditClientButton } from '@/components/edit-client-button'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const [clients, consignmentFee] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: {
        sales: true,
        orders: { where: { status: { not: 'CANCELADO' }, paid: true }, include: { items: true } },
      },
    }),
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
          <ClientForm />
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
        const payout = consignmentPayout(qty, client.isCompany, consignmentFee)
        return (
          <section className="panel" style={{ marginBottom: 16 }} key={client.id}>
            <div className="panel-head">
              <div>
                <h2>{client.name}{client.isCompany && <small style={{ marginLeft: 8, fontWeight: 400, color: 'var(--muted)' }}>(empresa)</small>}</h2>
                <p>{client.notes || 'Sem observações'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ display: 'block', fontSize: 16 }}>{formatBRL(total)}</b>
                  <small style={{ color: 'var(--muted)' }}>{qty} unidade{qty === 1 ? '' : 's'} vendida{qty === 1 ? '' : 's'}</small>
                </div>
                {!client.isCompany && (
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ display: 'block', fontSize: 16, color: 'var(--purple)' }}>{formatBRL(payout)}</b>
                    <small style={{ color: 'var(--muted)' }}>a repassar</small>
                  </div>
                )}
                <Link href={`/clientes/${client.id}`} className="link-button" style={{ textDecoration: 'none' }}>Ver vendas <span>→</span></Link>
                <EditClientButton id={client.id} name={client.name} notes={client.notes} isCompany={client.isCompany} />
                <DeleteClientButton id={client.id} />
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
