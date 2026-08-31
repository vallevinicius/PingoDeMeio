import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { quantity, minQuantity } = await request.json()

  const data: { quantity?: number; minQuantity?: number } = {}
  if (quantity !== undefined) data.quantity = Number(quantity)
  if (minQuantity !== undefined) data.minQuantity = Number(minQuantity)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })
  }

  const ingredient = await prisma.ingredient.update({ where: { id: Number(id) }, data })
  return NextResponse.json({ ingredient })
}
