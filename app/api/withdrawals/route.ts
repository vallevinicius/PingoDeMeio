import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { zonedDate } from '@/lib/format'

export async function POST(request: NextRequest) {
  const { partnerName, amount, date, description } = await request.json() as {
    partnerName: string
    amount: number
    date: string
    description?: string
  }

  if (!partnerName || amount === undefined || !date) {
    return NextResponse.json({ error: 'partnerName, amount e date são obrigatórios' }, { status: 400 })
  }

  const [y, m, d] = date.split('-').map(Number)
  const withdrawalDate = new Date(zonedDate(y, m - 1, d).getTime() + 12 * 60 * 60 * 1000)

  const withdrawal = await prisma.withdrawal.create({
    data: {
      partnerName: partnerName.trim(),
      amount: Number(amount),
      description: description?.trim() || null,
      date: withdrawalDate,
    },
  })

  return NextResponse.json({ withdrawal }, { status: 201 })
}
