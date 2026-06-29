'use client'

import { Chip } from './Chip'
import { formatINR } from '@/lib/utils/format'

interface AlertRowProps {
  initials: string
  name: string
  subtitle?: string | null
  targetPrice: number
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
  onDelete?: () => void
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
  onDelete,
}: AlertRowProps) {
  const statusLabel = lastTriggeredAt ? 'Triggered' : isActive ? 'Active' : 'Inactive'
  const statusVariant = lastTriggeredAt ? 'active' : isActive ? 'active' : 'default'
  const statusColor = lastTriggeredAt
    ? 'var(--save)'
    : isActive
      ? 'var(--accent)'
      : 'var(--text-faint)'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 20px',
        borderLeft: isActive && !lastTriggeredAt ? '2px solid var(--accent)' : lastTriggeredAt ? '2px solid var(--save)' : '2px solid transparent',
      }}
    >
      {/* Product identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--r-sm)',
            background: 'var(--bg3)',
            border: '1px solid var(--glass-plate-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{subtitle}</div>
          )}
        </div>
      </div>

      {/* Target price */}
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            marginBottom: 3,
          }}
        >
          Target
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          {formatINR(targetPrice)}
        </span>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: statusColor,
            flexShrink: 0,
          }}
        />
        <Chip variant={statusVariant} size="sm">
          {statusLabel}
        </Chip>
      </div>

      {/* Date */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-faint)',
          whiteSpace: 'nowrap',
        }}
      >
        {lastTriggeredAt ? `Hit ${formatDate(lastTriggeredAt)}` : `Set ${formatDate(createdAt)}`}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-faint)',
          fontSize: '1rem',
          width: 44,
          height: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--r-pill)',
          lineHeight: 1,
        }}
        aria-label="Remove alert"
      >
        ···
      </button>
    </div>
  )
}
