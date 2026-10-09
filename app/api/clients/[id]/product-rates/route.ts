import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { productId, siteSalePrice, companyAmount, partnerAmount } = await request.json() as {
    productId: number
    siteSalePrice?: number
    companyAmount?: number
    partnerAmount?: number
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } })
  if (!product) {
    return NextResponse.json({ error: 'Sabor não encontrado' }, { status: 404 })
  }

  const data = {
    siteSalePrice: Math.max(0, Number(siteSalePrice) || 0),
    companyAmount: Math.max(0, Number(companyAmount) || 0),
    partnerAmount: Math.max(0, Number(partnerAmount) || 0),
  }

  const rate = await prisma.clientProductRate.upsert({
    where: { clientId_productId: { clientId: Number(id), productId: product.id } },
    create: { clientId: Number(id), productId: product.id, ...data },
    update: data,
    include: { product: true },
  })

  return NextResponse.json({ rate }, { status: 201 })
}
