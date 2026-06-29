'use client'

import { CSSProperties, ReactNode } from 'react'

export type GlassVariant = 'plate' | 'strong' | 'solid'

interface GlassCardProps {
  variant?: GlassVariant
  className?: string
  children?: ReactNode
  style?: CSSProperties
  onClick?: () => void
}

const variantStyles: Record<GlassVariant, CSSProperties> = {
  plate: {
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  strong: {
    background: 'var(--glass-strong)',
    border: '1px solid var(--glass-strong-border)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  solid: {
    background: 'var(--glass-solid-bg)',
    border: '1px solid var(--glass-solid-border)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
}

/**
 * Canonical glass surface. All glass panels must use this component rather than
 * a bare `<div>` with `backdrop-filter`.
 */
export function GlassCard({
  variant = 'plate',
  className,
  children,
  style,
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        ...variantStyles[variant],
        ...style,
      }}
      onClick={onClick}
    >
      {children}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: '5%',
          width: '90%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, var(--glass-plate-highlight), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
