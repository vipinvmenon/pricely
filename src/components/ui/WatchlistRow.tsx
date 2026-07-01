'use client'

import { formatINR } from '@/lib/utils/format'
import { SparkLine } from './SparkLine'
import { Button } from './Button'

type WatchlistStatus = 'Just dropped' | 'Watching' | 'Holding' | 'Target hit'

interface WatchlistRowProps {
  initials: string
  name: string
  subtitle: string
  target: number
  now: number
  mrp?: number
  vsTarget: number
  trend: number[]
  status: WatchlistStatus
  removeConfirming?: boolean
  onRemoveRequest?: () => void
  onConfirmRemove?: () => void
  onCancelRemove?: () => void
}

const statusColor: Record<WatchlistStatus, string> = {
  'Just dropped': 'var(--accent)',
  'Watching': 'var(--warn)',
  'Holding': 'var(--text-faint)',
  'Target hit': 'var(--accent)',
}

export function WatchlistRow({
  initials,
  name,
  subtitle,
  target,
  now,
  mrp,
  vsTarget,
  trend,
  status,
  removeConfirming = false,
  onRemoveRequest,
  onConfirmRemove,
  onCancelRemove,
}: WatchlistRowProps) {
  const isPositive = vsTarget <= 0

  return (
    <div
      className="watchlist-row"
      style={{
        background: status === 'Target hit' ? 'var(--accent-dim)' : 'transparent',
        borderLeft: status === 'Target hit' ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      <div className="watchlist-row-product">
        <div className="watchlist-row-avatar">{initials}</div>
        <div className="watchlist-row-copy">
          <div className="watchlist-row-name">{name}</div>
          <div className="watchlist-row-subtitle">{subtitle}</div>
        </div>
      </div>

      <span className="watchlist-row-target mono">{formatINR(target)}</span>

      <span className="watchlist-row-now mono">
        {formatINR(now)}
        {mrp && mrp > now && (
          <span className="watchlist-row-mrp strike">{formatINR(mrp)}</span>
        )}
      </span>

      <span
        className="watchlist-row-vs mono"
        style={{ color: isPositive ? 'var(--save)' : 'var(--danger)' }}
      >
        {vsTarget > 0 ? '+' : ''}
        {vsTarget}%
      </span>

      <SparkLine data={trend} width={80} height={32} />

      <div className="watchlist-row-status">
        <span
          className="watchlist-row-status-dot"
          style={{ background: statusColor[status] }}
        />
        <span>{status}</span>
      </div>

      <div className="watchlist-row-actions">
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

      <div className="watchlist-row-mobile-stats">
        <div>
          <span className="watchlist-row-mobile-label">Now</span>
          <div className="mono">{formatINR(now)}</div>
        </div>
        <div>
          <span className="watchlist-row-mobile-label">Target</span>
          <div className="mono">{formatINR(target)}</div>
        </div>
        <div>
          <span className="watchlist-row-mobile-label">vs target</span>
          <div className="mono" style={{ color: isPositive ? 'var(--save)' : 'var(--danger)' }}>
            {vsTarget > 0 ? '+' : ''}
            {vsTarget}%
          </div>
        </div>
        <SparkLine data={trend} width={72} height={28} />
      </div>
    </div>
  )
}
