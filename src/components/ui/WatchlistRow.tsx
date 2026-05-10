'use client'

import { formatINR } from '@/lib/utils/format'
import { SparkLine } from './SparkLine'

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
  onMenu?: () => void
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
  onMenu,
}: WatchlistRowProps) {
  const isPositive = vsTarget <= 0

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto auto',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 20px',
        borderRadius: 'var(--r-md)',
        background: status === 'Target hit' ? 'var(--accent-dim)' : 'transparent',
        borderLeft: status === 'Target hit' ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
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
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{subtitle}</div>
        </div>
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          color: 'var(--text-dim)',
        }}
      >
        {formatINR(target)}
      </span>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: 'var(--text)',
        }}
      >
        {formatINR(now)}
        {mrp && mrp > now && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-faint)',
              textDecoration: 'line-through',
              marginLeft: '6px',
            }}
          >
            {formatINR(mrp)}
          </span>
        )}
      </span>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: isPositive ? 'var(--save)' : 'var(--danger)',
        }}
      >
        {vsTarget > 0 ? '+' : ''}
        {vsTarget}%
      </span>

      <SparkLine data={trend} width={80} height={32} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusColor[status],
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{status}</span>
        </div>
        <button
          onClick={onMenu}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-faint)',
            fontSize: '1rem',
            padding: '4px',
            borderRadius: 'var(--r-pill)',
            lineHeight: 1,
          }}
          aria-label="More options"
        >
          ···
        </button>
      </div>
    </div>
  )
}
