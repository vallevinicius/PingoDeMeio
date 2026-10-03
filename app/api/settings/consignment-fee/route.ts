import { NextRequest, NextResponse } from 'next/server'
import { setConsignmentFee } from '@/lib/consignment'

export async function PATCH(request: NextRequest) {
  const { value } = await request.json() as { value: number }

  if (value === undefined || Number.isNaN(Number(value)) || Number(value) < 0) {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  }

  await setConsignmentFee(Number(value))
  return NextResponse.json({ ok: true })
}
