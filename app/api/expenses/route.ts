import { NextRequest, NextResponse } from 'next/server'
import { EntryType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { zonedDate } from '@/lib/format'

export async function POST(request: NextRequest) {
  const { description, amount, date, type } = await request.json() as {
    description: string
    amount: number
    date: string
    type?: string
  }

  if (!description || amount === undefined || !date) {
    return NextResponse.json({ error: 'description, amount e date são obrigatórios' }, { status: 400 })
  }

  if (type !== undefined && !['DESPESA', 'RECEITA'].includes(type)) {
    return NextResponse.json({ error: 'type inválido' }, { status: 400 })
  }

  const [y, m, d] = date.split('-').map(Number)
  // Anchored at noon Brasília time for the chosen calendar day, independent of the server's own timezone.
  const entryDate = new Date(zonedDate(y, m - 1, d).getTime() + 12 * 60 * 60 * 1000)

  const expense = await prisma.expense.create({
    data: {
      description,
      amount: Number(amount),
      date: entryDate,
      type: (type as EntryType) ?? 'DESPESA',
    },
  })

  return NextResponse.json({ expense }, { status: 201 })
}
