'use client'

import { CSSProperties, ReactNode } from 'react'

type GlassVariant = 'plate' | 'strong' | 'solid'

interface GlassProps {
  variant?: GlassVariant
  className?: string
  children?: ReactNode
  style?: CSSProperties
  onClick?: () => void
}

const variantStyles: Record<GlassVariant, CSSProperties> = {
  plate: {
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.11)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow:
      '0 1px 3px rgba(0,0,0,0.45), 0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)',
  },
  strong: {
    background: 'rgba(255,255,255,0.09)',
    border: '1px solid rgba(255,255,255,0.16)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.5), 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14)',
  },
  solid: {
    background: 'rgba(17,18,20,0.92)',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow:
      '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.45)',
  },
}

export function Glass({ variant = 'plate', className, children, style, onClick }: GlassProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        ...variantStyles[variant],
        ...style,
      }}
      onClick={onClick}
    >
      {/* Top-edge rim highlight — simulates light hitting the glass */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.18) 70%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
