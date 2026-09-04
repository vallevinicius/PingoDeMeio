import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { items, paymentMethod, paid, customerName } = body as {
    items: { productId: number; quantity?: number; unitPrice?: number }[]
    paymentMethod: 'PIX' | 'CARTAO' | 'DINHEIRO'
    paid?: boolean
    customerName?: string
  }

  if (!items?.length || !paymentMethod) {
    return NextResponse.json({ error: 'items e paymentMethod são obrigatórios' }, { status: 400 })
  }

  const normalizedItems = items
    .map((i) => ({
      productId: Number(i.productId),
      quantity: Math.max(1, Number(i.quantity) || 1),
      unitPrice: i.unitPrice !== undefined && Number(i.unitPrice) >= 0 ? Number(i.unitPrice) : undefined,
    }))
    .filter((i) => i.productId)

  if (normalizedItems.length === 0) {
    return NextResponse.json({ error: 'Nenhum item válido no pedido' }, { status: 400 })
  }

  const products = await prisma.product.findMany({
    where: { id: { in: normalizedItems.map((i) => i.productId) } },
    include: { recipe: true },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId)
    if (!product || !product.active) {
      return NextResponse.json({ error: 'Um dos sabores selecionados não foi encontrado' }, { status: 404 })
    }
  }

  const itemPrice = (item: (typeof normalizedItems)[number]) =>
    item.unitPrice ?? Number(productMap.get(item.productId)!.price)

  const total = normalizedItems.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        paymentMethod,
        paid: paid ?? true,
        customerName: customerName?.trim() || null,
        total,
        items: {
          create: normalizedItems.map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            unitPrice: itemPrice(item),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId)!
      for (const recipeItem of product.recipe) {
        await tx.ingredient.update({
          where: { id: recipeItem.ingredientId },
          data: { quantity: { decrement: Number(recipeItem.quantity) * item.quantity } },
        })
      }
    }

    return created
  })

  return NextResponse.json({ order }, { status: 201 })
}
