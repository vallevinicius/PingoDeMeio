import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { done } = await request.json() as { done?: boolean }

  if (done === undefined) {
    return NextResponse.json({ error: 'done é obrigatório' }, { status: 400 })
  }

  const task = await prisma.task.update({ where: { id: Number(id) }, data: { done } })
  return NextResponse.json({ task })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.task.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
