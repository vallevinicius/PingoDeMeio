import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { productId, paymentMethod, quantity, paid, customerName } = body as {
    productId: number
    paymentMethod: 'PIX' | 'CARTAO' | 'DINHEIRO'
    quantity?: number
    paid?: boolean
    customerName?: string
  }

  if (!productId || !paymentMethod) {
    return NextResponse.json({ error: 'productId e paymentMethod são obrigatórios' }, { status: 400 })
  }

  const qty = Math.max(1, Number(quantity) || 1)

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { recipe: true },
  })
  if (!product || !product.active) {
    return NextResponse.json({ error: 'Sabor não encontrado' }, { status: 404 })
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        paymentMethod,
        paid: paid ?? true,
        customerName: customerName?.trim() || null,
        total: Number(product.price) * qty,
        items: {
          create: [
            {
              product: { connect: { id: product.id } },
              quantity: qty,
              unitPrice: product.price,
            },
          ],
        },
      },
      include: { items: { include: { product: true } } },
    })

    for (const recipeItem of product.recipe) {
      await tx.ingredient.update({
        where: { id: recipeItem.ingredientId },
        data: { quantity: { decrement: Number(recipeItem.quantity) * qty } },
      })
    }

    return created
  })

  return NextResponse.json({ order }, { status: 201 })
}
