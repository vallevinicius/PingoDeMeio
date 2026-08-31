import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { name, price, sizeLabel, recipe } = await request.json() as {
    name: string
    price: number
    sizeLabel?: string
    recipe: { ingredientId: number; quantity: number }[]
  }

  if (!name || price === undefined) {
    return NextResponse.json({ error: 'name e price são obrigatórios' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      price: Number(price),
      ...(sizeLabel ? { sizeLabel } : {}),
      recipe: {
        create: (recipe ?? [])
          .filter((r) => r.ingredientId && r.quantity > 0)
          .map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity) })),
      },
    },
    include: { recipe: { include: { ingredient: true } } },
  })

  return NextResponse.json({ product }, { status: 201 })
}
