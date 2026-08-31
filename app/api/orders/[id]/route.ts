import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await request.json()

  if (!['PREPARANDO', 'CONCLUIDO', 'CANCELADO'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const order = await prisma.order.update({ where: { id: Number(id) }, data: { status } })
  return NextResponse.json({ order })
}
