import type { CSSProperties } from 'react'

export const authInputStyle: CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid var(--glass-plate-border)',
  borderRadius: 'var(--r-pill)',
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
}

export const authLabelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--text-dim)',
}

export const authErrorBoxStyle: CSSProperties = {
  background: 'var(--danger-soft)',
  border: '1px solid var(--danger-border)',
  borderRadius: 'var(--r-md)',
  padding: '10px 14px',
  marginBottom: 16,
  fontSize: '0.875rem',
  color: 'var(--danger)',
}
