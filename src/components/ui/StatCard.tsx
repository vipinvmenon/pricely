import { Glass } from './Glass'

interface StatCardProps {
  label: string
  value: string
  sub?: string
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <Glass variant="plate" style={{ padding: 'var(--sp-6)', flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          marginBottom: 'var(--sp-2)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.75rem',
          fontWeight: 600,
          color: 'var(--text)',
          lineHeight: 1.1,
          marginBottom: sub ? 'var(--sp-1)' : 0,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{sub}</div>
      )}
    </Glass>
  )
}
