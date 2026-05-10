'use client'

import { PriceBadge } from './PriceBadge'
import { Button } from './Button'

interface RetailerRowProps {
  rank: number
  name: string
  isLowest?: boolean
  price: number
  mrp?: number
  delivery: string
  returns: string
  stock: string
  onBuy: () => void
}

export function RetailerRow({
  rank,
  name,
  isLowest,
  price,
  mrp,
  delivery,
  returns,
  stock,
  onBuy,
}: RetailerRowProps) {
  const isLowStock = stock.toLowerCase().includes('low')

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto auto auto auto auto',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 20px',
        borderRadius: 'var(--r-md)',
        background: isLowest ? 'var(--accent-dim)' : 'transparent',
        borderLeft: isLowest ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-faint)',
          textAlign: 'center',
        }}
      >
        {rank}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <span
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
        </span>
        {isLowest && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '2px 8px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--accent)',
              color: '#0A0A0B',
              flexShrink: 0,
            }}
          >
            LOWEST
          </span>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        <PriceBadge value={price} size="md" />
        {mrp && mrp > price && (
          <div>
            <PriceBadge value={mrp} size="sm" strike />
          </div>
        )}
      </div>

      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-dim)',
          whiteSpace: 'nowrap',
        }}
      >
        {delivery}
      </span>

      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-dim)',
          whiteSpace: 'nowrap',
        }}
      >
        {returns}
      </span>

      <span
        style={{
          fontSize: '0.8125rem',
          color: isLowStock ? 'var(--warn)' : 'var(--text-dim)',
          whiteSpace: 'nowrap',
        }}
      >
        {stock}
      </span>

      <Button variant={isLowest ? 'primary' : 'ghost'} size="sm" onClick={onBuy}>
        Buy
      </Button>
    </div>
  )
}
