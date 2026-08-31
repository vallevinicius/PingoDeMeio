import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, price, active } = await request.json()

  const data: { name?: string; price?: number; active?: boolean } = {}
  if (name !== undefined) data.name = name
  if (price !== undefined) data.price = Number(price)
  if (active !== undefined) data.active = active

  const product = await prisma.product.update({ where: { id: Number(id) }, data })
  return NextResponse.json({ product })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.product.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Este sabor já tem pedidos registrados. Desative-o em vez de excluir.' },
        { status: 409 },
      )
    }
    throw error
  }
}
