'use client'

import { Glass } from './Glass'
import { Button } from './Button'
import { formatINR } from '@/lib/utils/format'

interface FareCardProps {
  name: string
  isLowest?: boolean
  price: number
  eta: string
  surgeMultiplier?: number
  onBook: () => void
}

export function FareCard({ name, isLowest, price, eta, surgeMultiplier, onBook }: FareCardProps) {
  return (
    <Glass
      variant="plate"
      style={{
        padding: 'var(--sp-6)',
        background: isLowest ? 'rgba(30,215,96,0.08)' : undefined,
        border: isLowest ? '1px solid var(--accent-border)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text)',
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
            }}
          >
            LOWEST
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '2rem',
          fontWeight: 600,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {formatINR(price)}
      </div>

      <div style={{ fontSize: '0.8125rem', color: surgeMultiplier ? 'var(--warn)' : 'var(--text-dim)' }}>
        {eta}
        {surgeMultiplier && ` · ${surgeMultiplier}× surge`}
      </div>

      <Button variant={isLowest ? 'primary' : 'ghost'} size="md" fullWidth onClick={onBook}>
        Book
      </Button>
    </Glass>
  )
}
