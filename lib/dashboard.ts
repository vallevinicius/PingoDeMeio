import { prisma } from '@/lib/prisma'
import { brParts, formatOrderCode, paymentLabel, pctChange, startOfDayBR, stockStatus } from '@/lib/format'

function dayRange(date: Date) {
  const start = startOfDayBR(date)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

const CHART_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
const FLAVOR_COLORS = ['berry', 'lilac', 'gold', 'sage']

export async function getDashboardData(referenceDate: Date = new Date()) {
  const { start: todayStart, end: todayEnd } = dayRange(referenceDate)
  const yesterdayRef = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
  const { start: yesterdayStart, end: yesterdayEnd } = dayRange(yesterdayRef)

  const [todayOrders, yesterdayOrders, lowStockIngredients, recentOrdersRaw] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: todayStart, lt: todayEnd }, status: 'CONCLUIDO', paid: true },
      include: { items: { include: { product: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd }, status: 'CONCLUIDO', paid: true },
      include: { items: true },
    }),
    prisma.ingredient.findMany({ orderBy: { quantity: 'asc' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { items: { include: { product: true } } },
    }),
  ])

  const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const itemsSold = todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
  const avgTicket = todayOrders.length ? revenue / todayOrders.length : 0

  const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const yesterdayItems = yesterdayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
  const yesterdayAvgTicket = yesterdayOrders.length ? yesterdayRevenue / yesterdayOrders.length : 0

  const productCounts = new Map<string, number>()
  for (const order of todayOrders) {
    for (const item of order.items) {
      productCounts.set(item.product.name, (productCounts.get(item.product.name) ?? 0) + item.quantity)
    }
  }
  const topProduct = [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  const hourlyRevenue = new Map<number, number>()
  for (const order of todayOrders) {
    const hour = brParts(order.createdAt).hour
    hourlyRevenue.set(hour, (hourlyRevenue.get(hour) ?? 0) + Number(order.total))
  }
  const hourlySales = CHART_HOURS.map((hour) => ({ hour, revenue: hourlyRevenue.get(hour) ?? 0 }))
  const maxHourlyRevenue = Math.max(1, ...hourlySales.map((h) => h.revenue))

  const flavorTotal = [...productCounts.values()].reduce((a, b) => a + b, 0)
  const flavorDistribution = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count], i) => ({
      label: name,
      count,
      pct: flavorTotal ? Math.round((count / flavorTotal) * 100) : 0,
      color: FLAVOR_COLORS[i % FLAVOR_COLORS.length],
    }))

  const lowStock = lowStockIngredients
    .map((ing) => {
      const { pct, status } = stockStatus(Number(ing.quantity), Number(ing.minQuantity))
      return { id: ing.id, name: ing.name, amount: `${Number(ing.quantity)} ${ing.unit}`, pct, status }
    })
    .filter((i) => i.status !== 'good')
    .slice(0, 4)

  const recentOrders = recentOrdersRaw.map((order) => {
    const item = order.items[0]
    return {
      id: order.id,
      code: formatOrderCode(order.id),
      time: order.createdAt,
      productName: item ? item.product.name : '—',
      quantity: item?.quantity ?? 1,
      total: Number(order.total),
      payment: paymentLabel(order.paymentMethod),
      status: order.status,
    }
  })

  return {
    revenue,
    revenueTrendPct: pctChange(revenue, yesterdayRevenue),
    itemsSold,
    itemsSoldTrendPct: pctChange(itemsSold, yesterdayItems),
    avgTicket,
    avgTicketTrendPct: pctChange(avgTicket, yesterdayAvgTicket),
    topProduct: topProduct ? { name: topProduct[0], count: topProduct[1] } : null,
    hourlySales,
    maxHourlyRevenue,
    flavorDistribution,
    flavorTotal,
    lowStock,
    recentOrders,
    ordersCount: todayOrders.length,
  }
}
