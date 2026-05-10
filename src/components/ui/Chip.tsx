'use client'

import { ReactNode } from 'react'

type ChipVariant = 'active' | 'default' | 'ghost'
type ChipSize = 'sm' | 'md'

interface ChipProps {
  variant?: ChipVariant
  size?: ChipSize
  withDot?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}

export function Chip({
  variant = 'default',
  size = 'md',
  withDot = false,
  onClick,
  children,
  className,
}: ChipProps) {
  const padding = size === 'sm' ? '4px 10px' : '6px 14px'
  const fontSize = size === 'sm' ? '0.75rem' : '0.875rem'

  const variantStyle = {
    active: {
      background: 'var(--accent-dim)',
      border: '1px solid var(--accent-border)',
      color: 'var(--accent)',
    },
    default: {
      background: 'var(--glass-plate-bg)',
      border: '1px solid var(--glass-plate-border)',
      color: 'var(--text-dim)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid var(--glass-plate-border)',
      color: 'var(--text-dim)',
    },
  }[variant]

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: 500,
        borderRadius: 'var(--r-pill)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        fontFamily: 'inherit',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...variantStyle,
      }}
    >
      {withDot && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent)',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </button>
  )
}
