'use client'

import { useCity } from '@/lib/hooks/useCity'
import type { City } from '@/lib/constants'

const CITY_LABELS: Record<City, string> = {
  mumbai:    'Mumbai',
  delhi:     'Delhi',
  bangalore: 'Bangalore',
  hyderabad: 'Hyderabad',
  chennai:   'Chennai',
  pune:      'Pune',
}

export function CitySelector() {
  const { city, setCity, ready } = useCity()

  if (!ready) return null

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.8125rem',
        color: 'var(--text-dim)',
      }}
    >
      <span className="sr-only">Delivery city</span>
      <span aria-hidden style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
        City
      </span>
      <select
        value={city}
        onChange={(event) => setCity(event.target.value as City)}
        style={{
          background: 'var(--bg2)',
          color: 'var(--text)',
          border: '1px solid var(--line-strong)',
          borderRadius: 'var(--r-pill)',
          padding: '6px 12px',
          fontSize: '0.8125rem',
          fontFamily: 'inherit',
          minHeight: 44,
          cursor: 'pointer',
        }}
      >
        {Object.entries(CITY_LABELS).map(([slug, label]) => (
          <option key={slug} value={slug}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
