'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost'
type ButtonSize = 'lg' | 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  loading = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || loading

  const padding = {
    lg: '14px 28px',
    md: '10px 20px',
    sm: '6px 14px',
  }[size]

  const fontSize = {
    lg: '1rem',
    md: '0.875rem',
    sm: '0.8125rem',
  }[size]

  // Touch-target minimums: md/lg meet the 44px floor; sm is desktop-dense.
  const minHeight = {
    lg: 48,
    md: 44,
    sm: 36,
  }[size]

  const variantStyle =
    variant === 'primary'
      ? {
          background: 'var(--accent)',
          color: 'var(--bg0)',
          border: '1px solid transparent',
        }
      : {
          background: 'var(--glass-plate-bg)',
          color: 'var(--text)',
          border: '1px solid var(--glass-plate-border)',
        }

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: 'inherit',
        borderRadius: 'var(--r-pill)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'filter 0.15s, transform 0.1s',
        width: fullWidth ? '100%' : undefined,
        minHeight,
        opacity: isDisabled ? 0.55 : 1,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...variantStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return
        ;(e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.06)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)'
      }}
      onMouseDown={(e) => {
        if (isDisabled) return
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'
      }}
      onMouseUp={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
      }}
    >
      {children}
    </button>
  )
}
