import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatOrderCode, paymentLabel, statusLabel } from '@/lib/format'

export async function GET() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: 'asc' },
    include: { items: { include: { product: true } } },
  })

  const header = ['Pedido', 'Horário', 'Sabor', 'Quantidade', 'Total', 'Pagamento', 'Status']
  const rows = orders.map((order) => {
    const item = order.items[0]
    return [
      formatOrderCode(order.id),
      order.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      item ? `${item.product.name}` : '',
      item ? String(item.quantity) : '',
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
