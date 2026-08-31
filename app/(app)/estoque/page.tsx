import { prisma } from '@/lib/prisma'
import { stockStatus } from '@/lib/format'
import { StockRow } from '@/components/stock-row'
import { AddIngredientForm } from '@/components/add-ingredient-form'

export const dynamic = 'force-dynamic'

export default async function EstoquePage() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } })

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Estoque</h1>
        <p className="section-sub">Controle os ingredientes e adicionais da loja.</p>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head"><div><h2>Adicionar ingrediente</h2><p>Cadastre um novo item de estoque</p></div></div>
        <AddIngredientForm />
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Itens em estoque</h2><p>{ingredients.length} ingredientes cadastrados</p></div></div>
        {ingredients.map((ing) => {
          const { pct, status } = stockStatus(Number(ing.quantity), Number(ing.minQuantity))
          return (
            <StockRow
              key={ing.id}
              id={ing.id}
              name={ing.name}
              unit={ing.unit}
              quantity={Number(ing.quantity)}
              minQuantity={Number(ing.minQuantity)}
              pct={pct}
              status={status}
            />
          )
        })}
      </section>
    </>
  )
}
