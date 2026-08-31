import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { recipe } = await request.json() as { recipe: { ingredientId: number; quantity: number }[] }

  const productId = Number(id)
  const cleanRecipe = (recipe ?? []).filter((r) => r.ingredientId && r.quantity > 0)

  const product = await prisma.$transaction(async (tx) => {
    await tx.productIngredient.deleteMany({ where: { productId } })
    return tx.product.update({
      where: { id: productId },
      data: {
        recipe: {
          create: cleanRecipe.map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity) })),
        },
      },
      include: { recipe: { include: { ingredient: true } } },
    })
  })

  return NextResponse.json({ product })
}
