import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatOrderCode, paymentLabel, startOfDayBR, statusLabel, TIME_ZONE } from '@/lib/format'

export async function GET() {
  const start = startOfDayBR(new Date())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: 'asc' },
    include: { items: { include: { product: true } } },
  })

  const header = ['Pedido', 'Horário', 'Sabor', 'Quantidade', 'Total', 'Pagamento', 'Status']
  const rows = orders.map((order) => {
    return [
      formatOrderCode(order.id),
      order.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }),
      order.items.map((i) => i.product.name).join(', '),
      order.items.map((i) => i.quantity).join(', '),
      Number(order.total).toFixed(2).replace('.', ','),
      paymentLabel(order.paymentMethod),
      statusLabel(order.status),
    ]
  })

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n')

  const dateStr = start.toISOString().slice(0, 10)
  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-${dateStr}.csv"`,
    },
  })
}
