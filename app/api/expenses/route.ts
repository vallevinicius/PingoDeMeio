import { NextRequest, NextResponse } from 'next/server'
import { EntryType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

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

  const expense = await prisma.expense.create({
    data: {
      description,
      amount: Number(amount),
      date: new Date(`${date}T12:00:00`),
      type: (type as EntryType) ?? 'DESPESA',
    },
  })

  return NextResponse.json({ expense }, { status: 201 })
}
