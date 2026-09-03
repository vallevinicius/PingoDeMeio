export const TIME_ZONE = 'America/Sao_Paulo'

// Brasília (America/Sao_Paulo) has been fixed at UTC-3 since Brazil abolished DST in 2019,
// so day/month/year boundaries can be computed with plain ms arithmetic instead of a full
// IANA timezone lookup. This keeps "hoje"/"este mês" correct no matter which timezone the
// server process itself runs in (a local dev machine vs. a UTC serverless host, for example).
const BR_OFFSET_MS = 3 * 60 * 60 * 1000

export function brParts(date: Date) {
  const shifted = new Date(date.getTime() - BR_OFFSET_MS)
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate(), hour: shifted.getUTCHours() }
}

/** Real UTC instant for midnight of the given Brasília calendar date (month is 0-indexed). */
export function zonedDate(year: number, month: number, day = 1) {
  return new Date(Date.UTC(year, month, day) + BR_OFFSET_MS)
}

export function startOfDayBR(date: Date) {
  const { year, month, day } = brParts(date)
  return zonedDate(year, month, day)
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(date)
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
