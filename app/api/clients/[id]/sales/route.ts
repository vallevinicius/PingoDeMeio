import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { zonedDate } from '@/lib/format'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { productId, quantity, unitPrice, date } = await request.json() as {
    productId: number
    quantity?: number
    unitPrice?: number
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
  const price = unitPrice !== undefined ? Number(unitPrice) : Number(product.price)

  const [y, m, d] = date.split('-').map(Number)
  const saleDate = new Date(zonedDate(y, m - 1, d).getTime() + 12 * 60 * 60 * 1000)

  const sale = await prisma.clientSale.create({
    data: {
      clientId: Number(id),
      productId: product.id,
      quantity: qty,
      unitPrice: price,
      date: saleDate,
    },
    include: { product: true },
  })

  return NextResponse.json({ sale }, { status: 201 })
}
