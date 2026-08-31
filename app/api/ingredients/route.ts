import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ ingredients })
}

export async function POST(request: NextRequest) {
  const { name, unit, quantity, minQuantity } = await request.json()

  if (!name || !unit || quantity === undefined || minQuantity === undefined) {
    return NextResponse.json({ error: 'name, unit, quantity e minQuantity são obrigatórios' }, { status: 400 })
  }

  const ingredient = await prisma.ingredient.create({
    data: { name, unit, quantity: Number(quantity), minQuantity: Number(minQuantity) },
  })

  return NextResponse.json({ ingredient }, { status: 201 })
}
