import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { name, notes, isCompany } = await request.json() as { name: string; notes?: string; isCompany?: boolean }

  if (!name) {
    return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: { name: name.trim(), notes: notes?.trim() || null, isCompany: Boolean(isCompany) },
  })

  return NextResponse.json({ client }, { status: 201 })
}
