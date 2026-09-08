import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, paid, customerName, paymentMethod, productId, quantity, unitPrice } = await request.json()

  const data: Prisma.OrderUpdateInput = {}

  if (status !== undefined) {
    if (!['PREPARANDO', 'CONCLUIDO', 'CANCELADO'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }
    data.status = status
  }

  if (paid !== undefined) data.paid = Boolean(paid)

  if (customerName !== undefined) data.customerName = customerName?.trim() || null

  if (paymentMethod !== undefined) {
    if (!['PIX', 'CARTAO', 'DINHEIRO'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 })
    }
    data.paymentMethod = paymentMethod
  }

  const order = await prisma.$transaction(async (tx) => {
    if (productId !== undefined || quantity !== undefined || unitPrice !== undefined) {
      const existing = await tx.order.findUnique({ where: { id: Number(id) }, include: { items: true } })
      const item = existing?.items[0]
      if (!item) return tx.order.update({ where: { id: Number(id) }, data })

      const qty = Math.max(1, Number(quantity) || item.quantity)
      const product = productId !== undefined
        ? await tx.product.findUnique({ where: { id: Number(productId) } })
        : await tx.product.findUnique({ where: { id: item.productId } })
      if (!product) throw new Error('Sabor não encontrado')

      const price = unitPrice !== undefined && Number(unitPrice) >= 0 ? Number(unitPrice) : Number(product.price)

      await tx.orderItem.update({
        where: { id: item.id },
        data: { productId: product.id, quantity: qty, unitPrice: price },
      })

      const otherItemsTotal = existing.items
        .slice(1)
        .reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0)
      data.total = price * qty + otherItemsTotal
    }

    return tx.order.update({ where: { id: Number(id) }, data })
  })

  return NextResponse.json({ order })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.order.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
