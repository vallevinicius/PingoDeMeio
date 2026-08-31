import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const [productCount, ingredientCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.ingredient.count(),
    prisma.order.count(),
  ])

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Configurações</h1>
        <p className="section-sub">Informações gerais do sistema.</p>
      </div>

      <section className="panel">
        <div className="panel-head"><div><h2>Loja</h2><p>Pingo de Meio — Loja principal</p></div></div>
        <div className="stock-row"><div className="stock-info"><span>Produtos cadastrados</span><b>{productCount}</b></div></div>
        <div className="stock-row"><div className="stock-info"><span>Ingredientes em estoque</span><b>{ingredientCount}</b></div></div>
        <div className="stock-row"><div className="stock-info"><span>Pedidos registrados</span><b>{orderCount}</b></div></div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head"><div><h2>Banco de dados</h2><p>Conexão ativa via Prisma</p></div></div>
        <p className="subtext">MySQL — banco <b>opingodemeio</b>. Gerencie produtos em <a href="/pdv">Terminal PDV</a> e ingredientes em <a href="/estoque">Estoque</a>.</p>
      </section>
    </>
  )
}
