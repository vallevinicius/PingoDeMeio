export function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function formatOrderCode(id: number) {
  return `#${1000 + id}`
}

export function paymentLabel(method: string) {
  return { PIX: 'Pix', CARTAO: 'Cartão', DINHEIRO: 'Dinheiro' }[method] ?? method
}

export function statusLabel(status: string) {
  return { PREPARANDO: 'Preparando', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado' }[status] ?? status
}

export function stockStatus(quantity: number, minQuantity: number) {
  const pct = minQuantity > 0 ? Math.min(100, (quantity / minQuantity) * 100) : 100
  const status = pct < 40 ? 'low' : pct < 75 ? 'medium' : 'good'
  return { pct: Math.round(pct), status }
}
