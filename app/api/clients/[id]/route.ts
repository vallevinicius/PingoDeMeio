import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, notes, isCompany, paymentType, direction, siteSalePrice, companyAmount, partnerAmount } = await request.json() as {
    name?: string
    notes?: string
    isCompany?: boolean
    paymentType?: 'SOBRE_VENDA' | 'ADIANTADO'
    direction?: 'REPASSAR' | 'RECEBER'
    siteSalePrice?: number
    companyAmount?: number
    partnerAmount?: number
  }

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'name não pode ficar vazio' }, { status: 400 })
  }

  const data: {
    name?: string
    notes?: string | null
    isCompany?: boolean
    paymentType?: 'SOBRE_VENDA' | 'ADIANTADO'
    direction?: 'REPASSAR' | 'RECEBER'
    siteSalePrice?: number
    companyAmount?: number
    partnerAmount?: number
  } = {}
  if (name !== undefined) data.name = name.trim()
  if (notes !== undefined) data.notes = notes.trim() || null
  if (isCompany !== undefined) data.isCompany = Boolean(isCompany)
  if (paymentType !== undefined) data.paymentType = paymentType === 'ADIANTADO' ? 'ADIANTADO' : 'SOBRE_VENDA'
  if (direction !== undefined) data.direction = direction === 'RECEBER' ? 'RECEBER' : 'REPASSAR'
  if (siteSalePrice !== undefined) data.siteSalePrice = Math.max(0, Number(siteSalePrice) || 0)
  if (companyAmount !== undefined) data.companyAmount = Math.max(0, Number(companyAmount) || 0)
  if (partnerAmount !== undefined) data.partnerAmount = Math.max(0, Number(partnerAmount) || 0)

  const client = await prisma.client.update({ where: { id: Number(id) }, data })
  return NextResponse.json({ client })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.client.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
