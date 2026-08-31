import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  const { amount } = await request.json() as { amount: number }

  if (amount === undefined || Number.isNaN(Number(amount))) {
    return NextResponse.json({ error: 'amount é obrigatório' }, { status: 400 })
  }

  const balance = await prisma.accountBalance.upsert({
    where: { id: 1 },
    create: { id: 1, amount: Number(amount) },
    update: { amount: Number(amount) },
  })

  return NextResponse.json({ balance })
}
