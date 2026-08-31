import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, paid } = await request.json()

  const data: { status?: OrderStatus; paid?: boolean } = {}

  if (status !== undefined) {
    if (!['PREPARANDO', 'CONCLUIDO', 'CANCELADO'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }
    data.status = status
  }

  if (paid !== undefined) data.paid = Boolean(paid)

  const order = await prisma.order.update({ where: { id: Number(id) }, data })
  return NextResponse.json({ order })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.order.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
