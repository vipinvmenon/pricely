'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost'
type ButtonSize = 'lg' | 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  style,
  ...rest
}: ButtonProps) {
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

  const variantStyle =
    variant === 'primary'
      ? {
          background: 'var(--accent)',
          color: '#0A0A0B',
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: 'inherit',
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        transition: 'filter 0.15s, transform 0.1s',
        width: fullWidth ? '100%' : undefined,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...variantStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.06)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)'
      }}
      onMouseDown={(e) => {
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
