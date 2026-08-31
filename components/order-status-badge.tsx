import { statusLabel } from '@/lib/format'

const statusClass: Record<string, string> = {
  CONCLUIDO: 'done',
  PREPARANDO: 'preparing',
  CANCELADO: 'cancelled',
}

export function OrderStatusBadge({ status }: { status: string }) {
  return <span className={`status ${statusClass[status] ?? 'preparing'}`}>{statusLabel(status)}</span>
}
