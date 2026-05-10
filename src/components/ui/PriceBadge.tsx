import { formatINR } from '@/lib/utils/format'

type PriceBadgeSize = 'lg' | 'md' | 'sm'

interface PriceBadgeProps {
  value: number
  size?: PriceBadgeSize
  strike?: boolean
  className?: string
}

const sizeStyles: Record<PriceBadgeSize, { fontSize: string; fontWeight: number }> = {
  lg: { fontSize: '2.5rem', fontWeight: 500 },
  md: { fontSize: '1.5rem', fontWeight: 500 },
  sm: { fontSize: '1rem', fontWeight: 400 },
}

export function PriceBadge({ value, size = 'md', strike = false, className }: PriceBadgeProps) {
  const { fontSize, fontWeight } = sizeStyles[size]

  return (
    <span
      className={`mono${className ? ` ${className}` : ''}`}
      style={{
        fontSize,
        fontWeight,
        color: strike ? 'var(--text-faint)' : 'var(--text)',
        textDecoration: strike ? 'line-through' : 'none',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}
    >
      {formatINR(value)}
    </span>
  )
}
