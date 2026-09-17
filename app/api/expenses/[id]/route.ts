import { NextRequest, NextResponse } from 'next/server'
import { EntryType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { description, amount, date, type } = await request.json() as {
    description?: string
    amount?: number
    date?: string
    type?: string
  }

  if (type !== undefined && !['DESPESA', 'RECEITA'].includes(type)) {
    return NextResponse.json({ error: 'type inválido' }, { status: 400 })
  }

  const data: { description?: string; amount?: number; date?: Date; type?: EntryType } = {}
  if (description !== undefined) data.description = description.trim()
  if (amount !== undefined) data.amount = Number(amount)
  if (date !== undefined) data.date = new Date(`${date}T12:00:00`)
  if (type !== undefined) data.type = type as EntryType

  const expense = await prisma.expense.update({ where: { id: Number(id) }, data })
  return NextResponse.json({ expense })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.expense.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
