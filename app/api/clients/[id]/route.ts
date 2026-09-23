import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, notes } = await request.json() as { name?: string; notes?: string }

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'name não pode ficar vazio' }, { status: 400 })
  }

  const data: { name?: string; notes?: string | null } = {}
  if (name !== undefined) data.name = name.trim()
  if (notes !== undefined) data.notes = notes.trim() || null

  const client = await prisma.client.update({ where: { id: Number(id) }, data })
  return NextResponse.json({ client })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.client.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
