import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { zonedDate } from '@/lib/format'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { productId, quantity, note, date } = await request.json() as {
    productId: number
    quantity?: number
    note?: string
    date: string
  }

  if (!productId || !date) {
    return NextResponse.json({ error: 'productId e date são obrigatórios' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } })
  if (!product) {
    return NextResponse.json({ error: 'Sabor não encontrado' }, { status: 404 })
  }

  const qty = Math.max(1, Number(quantity) || 1)

  const [y, m, d] = date.split('-').map(Number)
  const deliveryDate = new Date(zonedDate(y, m - 1, d).getTime() + 12 * 60 * 60 * 1000)

  const delivery = await prisma.clientDelivery.create({
    data: {
      clientId: Number(id),
      productId: product.id,
      quantity: qty,
      note: note?.trim() || null,
      date: deliveryDate,
    },
    include: { product: true },
  })

  return NextResponse.json({ delivery }, { status: 201 })
}
