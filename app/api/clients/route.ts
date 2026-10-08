import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { name, notes, isCompany, paymentType, direction, siteSalePrice, companyAmount, partnerAmount } = await request.json() as {
    name: string
    notes?: string
    isCompany?: boolean
    paymentType?: 'SOBRE_VENDA' | 'ADIANTADO'
    direction?: 'REPASSAR' | 'RECEBER'
    siteSalePrice?: number
    companyAmount?: number
    partnerAmount?: number
  }

  if (!name) {
    return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      name: name.trim(),
      notes: notes?.trim() || null,
      isCompany: Boolean(isCompany),
      paymentType: paymentType === 'ADIANTADO' ? 'ADIANTADO' : 'SOBRE_VENDA',
      direction: direction === 'RECEBER' ? 'RECEBER' : 'REPASSAR',
      siteSalePrice: Math.max(0, Number(siteSalePrice) || 0),
      companyAmount: Math.max(0, Number(companyAmount) || 0),
      partnerAmount: Math.max(0, Number(partnerAmount) || 0),
    },
  })

  return NextResponse.json({ client }, { status: 201 })
}
