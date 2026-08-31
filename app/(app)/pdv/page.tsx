import { prisma } from '@/lib/prisma'
import { PdvForm } from '@/components/pdv-form'

export const dynamic = 'force-dynamic'

export default async function PdvPage() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } })

  return (
    <>
      <div className="page-header">
        <h1 className="section-title">Terminal PDV</h1>
        <p className="section-sub">Registre um novo pedido no caixa.</p>
      </div>
      <PdvForm products={products.map((p) => ({ id: p.id, name: p.name, price: Number(p.price), sizeLabel: p.sizeLabel }))} />
    </>
  )
}
