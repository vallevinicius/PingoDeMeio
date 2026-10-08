import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { zonedDate } from '@/lib/format'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { amount, note, date } = await request.json() as {
    amount: number
    note?: string
    date: string
  }

  if (amount === undefined || Number(amount) <= 0 || !date) {
    return NextResponse.json({ error: 'amount e date são obrigatórios' }, { status: 400 })
  }

  const [y, m, d] = date.split('-').map(Number)
  const payoutDate = new Date(zonedDate(y, m - 1, d).getTime() + 12 * 60 * 60 * 1000)

  const payout = await prisma.clientPayout.create({
    data: {
      clientId: Number(id),
      amount: Number(amount),
      note: note?.trim() || null,
      date: payoutDate,
    },
  })

  return NextResponse.json({ payout }, { status: 201 })
}
