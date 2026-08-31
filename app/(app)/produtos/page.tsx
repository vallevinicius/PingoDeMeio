import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/product-form'
import { ProductRow } from '@/components/product-row'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
  const [products, ingredients] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: 'asc' }, include: { recipe: { include: { ingredient: true } } } }),
    prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
  ])

  const ingredientOptions = ingredients.map((i) => ({ id: i.id, name: i.name, unit: i.unit }))

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Produtos</h1>
        <p className="section-sub">Cadastre os sabores de açaí (garrafa 300ml). O Terminal PDV usa esta lista automaticamente.</p>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Novo sabor</h2><p>Defina nome, preço e a receita de ingredientes</p></div></div>
        <div style={{ marginTop: 16 }}>
          <ProductForm ingredients={ingredientOptions} />
        </div>
      </section>

      <div className="page-header"><h2 className="section-title" style={{ fontSize: 16 }}>Sabores cadastrados ({products.length})</h2></div>
      {products.length === 0 && <p className="subtext">Nenhum sabor cadastrado ainda.</p>}
      {products.map((p) => (
        <ProductRow
          key={p.id}
          id={p.id}
          name={p.name}
          price={Number(p.price)}
          active={p.active}
          ingredients={ingredientOptions}
          recipe={p.recipe.map((r) => ({
            ingredientId: r.ingredientId,
            ingredientName: r.ingredient.name,
            quantity: Number(r.quantity),
            unit: r.ingredient.unit,
          }))}
        />
      ))}
    </>
  )
}
