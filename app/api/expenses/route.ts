import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { description, amount, date } = await request.json() as {
    description: string
    amount: number
    date: string
  }

  if (!description || amount === undefined || !date) {
    return NextResponse.json({ error: 'description, amount e date são obrigatórios' }, { status: 400 })
  }

  const expense = await prisma.expense.create({
    data: {
      description,
      amount: Number(amount),
      date: new Date(`${date}T12:00:00`),
    },
  })

  return NextResponse.json({ expense }, { status: 201 })
}
