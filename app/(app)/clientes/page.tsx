import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatBRL } from '@/lib/format'
import { ClientForm } from '@/components/client-form'
import { DeleteClientButton } from '@/components/delete-client-button'
import { EditClientButton } from '@/components/edit-client-button'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { sales: true },
  })

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
        const total = client.sales.reduce((sum, s) => sum + Number(s.unitPrice) * s.quantity, 0)
        const qty = client.sales.reduce((sum, s) => sum + s.quantity, 0)
        return (
          <section className="panel" style={{ marginBottom: 16 }} key={client.id}>
            <div className="panel-head">
              <div>
                <h2>{client.name}</h2>
                <p>{client.notes || 'Sem observações'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ display: 'block', fontSize: 16 }}>{formatBRL(total)}</b>
                  <small style={{ color: 'var(--muted)' }}>{qty} unidade{qty === 1 ? '' : 's'} vendida{qty === 1 ? '' : 's'}</small>
                </div>
                <Link href={`/clientes/${client.id}`} className="link-button" style={{ textDecoration: 'none' }}>Ver vendas <span>→</span></Link>
                <EditClientButton id={client.id} name={client.name} notes={client.notes} />
                <DeleteClientButton id={client.id} />
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
