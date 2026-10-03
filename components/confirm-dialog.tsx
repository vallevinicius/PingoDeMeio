'use client'

import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({ title, description, confirmLabel = 'Excluir', onConfirm, onCancel, loading }: {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  return (
    <div className="modal-overlay" onClick={() => !loading && onCancel()}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div className="metric-icon tint-red" style={{ flexShrink: 0 }}><AlertTriangle size={18} /></div>
          <div>
            <h2 style={{ marginBottom: 6 }}>{title}</h2>
            <p className="subtext" style={{ margin: 0 }}>{description}</p>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="cancel-btn" disabled={loading} onClick={onCancel}>Cancelar</button>
          <button
            type="button"
            className="submit-btn"
            style={{ background: '#b2465a' }}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Excluindo...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
