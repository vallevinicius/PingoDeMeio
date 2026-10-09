import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { zonedDate } from '@/lib/format'

const PAYMENT_METHODS = ['PIX', 'CARTAO', 'DINHEIRO'] as const

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { amount, paymentMethod, note, date } = await request.json() as {
    amount: number
    paymentMethod?: string
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
      paymentMethod: paymentMethod && PAYMENT_METHODS.includes(paymentMethod as never) ? (paymentMethod as (typeof PAYMENT_METHODS)[number]) : null,
      note: note?.trim() || null,
      date: payoutDate,
    },
  })

  return NextResponse.json({ payout }, { status: 201 })
}
