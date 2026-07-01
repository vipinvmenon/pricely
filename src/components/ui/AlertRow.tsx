'use client'

import { Chip } from './Chip'
import { Button } from './Button'
import { formatINR } from '@/lib/utils/format'

interface AlertRowProps {
  initials: string
  name: string
  subtitle?: string | null
  targetPrice: number
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
  lastDeliveryStatus?: string | null
  lastDeliveryError?: string | null
  removeConfirming?: boolean
  onRemoveRequest?: () => void
  onConfirmRemove?: () => void
  onCancelRemove?: () => void
  onToggleActive?: () => void
  toggleLoading?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AlertRow({
  initials,
  name,
  subtitle,
  targetPrice,
  isActive,
  lastTriggeredAt,
  createdAt,
  lastDeliveryStatus,
  lastDeliveryError,
  removeConfirming = false,
  onRemoveRequest,
  onConfirmRemove,
  onCancelRemove,
  onToggleActive,
  toggleLoading = false,
}: AlertRowProps) {
  const statusLabel = lastTriggeredAt
    ? 'Triggered'
    : lastDeliveryStatus === 'failed'
      ? 'Delivery failed'
      : isActive
        ? 'Active'
        : 'Inactive'
  const statusVariant = lastTriggeredAt || isActive ? 'active' : 'default'
  const statusColor = lastTriggeredAt
    ? 'var(--save)'
    : lastDeliveryStatus === 'failed'
      ? 'var(--danger)'
      : isActive
        ? 'var(--accent)'
        : 'var(--text-faint)'

  return (
    <div
      className="alert-row"
      style={{
        borderLeft: isActive && !lastTriggeredAt ? '2px solid var(--accent)' : lastTriggeredAt ? '2px solid var(--save)' : '2px solid transparent',
      }}
    >
      <div className="alert-row-product">
        <div className="alert-row-avatar">{initials}</div>
        <div className="alert-row-copy">
          <div className="alert-row-name">{name}</div>
          {subtitle && <div className="alert-row-subtitle">{subtitle}</div>}
          {lastDeliveryStatus === 'failed' && lastDeliveryError && (
            <div className="alert-row-delivery-error" role="status">
              {lastDeliveryError}
            </div>
          )}
        </div>
      </div>

      <div className="alert-row-target">
        <div className="alert-row-target-label">Target</div>
        <span className="mono">{formatINR(targetPrice)}</span>
      </div>

      <div className="alert-row-status">
        <span className="alert-row-status-dot" style={{ background: statusColor }} />
        <Chip variant={statusVariant} size="sm">
          {statusLabel}
        </Chip>
      </div>

      <span className="alert-row-date mono">
        {lastTriggeredAt ? `Hit ${formatDate(lastTriggeredAt)}` : `Set ${formatDate(createdAt)}`}
      </span>

      <div className="alert-row-actions">
        {!lastTriggeredAt && onToggleActive && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled={toggleLoading}
            onClick={onToggleActive}
          >
            {toggleLoading ? 'Saving…' : isActive ? 'Pause' : 'Reactivate'}
          </Button>
        )}
        {removeConfirming ? (
          <div className="row-confirm-actions">
            <Button variant="ghost" size="sm" type="button" onClick={onCancelRemove}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={onConfirmRemove}>
              Remove
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" type="button" onClick={onRemoveRequest}>
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
