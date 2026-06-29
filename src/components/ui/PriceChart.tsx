'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Chip } from './Chip'
import { formatINR } from '@/lib/utils/format'
import type { HistoryPoint } from '@/types'

interface PriceChartProps {
  data: HistoryPoint[]
}

type Range = '1M' | '3M' | '6M' | '12M' | 'All'

const RANGES: Range[] = ['1M', '3M', '6M', '12M', 'All']

const ACCENT_FALLBACK = '#1ED760'
const BG_FALLBACK = '#0A0A0B'
const LINE_FALLBACK = 'rgba(255,255,255,0.06)'

/**
 * Resolve token colors from CSS variables. Recharts renders SVG presentation
 * attributes, which don't accept `var(--token)`, so we read the computed values
 * (once, lazily) instead of hardcoding hex in the component. Token values match
 * the fallbacks, so server/client render the same attributes.
 */
function useChartColors() {
  const [colors] = useState(() => {
    if (typeof document === 'undefined') {
      return { accent: ACCENT_FALLBACK, line: LINE_FALLBACK, bg: BG_FALLBACK }
    }
    const root = getComputedStyle(document.documentElement)
    return {
      accent: root.getPropertyValue('--accent').trim() || ACCENT_FALLBACK,
      line: root.getPropertyValue('--line').trim() || LINE_FALLBACK,
      bg: root.getPropertyValue('--bg0').trim() || BG_FALLBACK,
    }
  })
  return colors
}

function filterByRange(data: HistoryPoint[], range: Range): HistoryPoint[] {
  if (range === 'All') return data
  const months = { '1M': 1, '3M': 3, '6M': 6, '12M': 12 }[range]
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return data.filter((d) => new Date(d.date) >= cutoff)
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--glass-solid-bg)',
        border: '1px solid var(--glass-solid-border)',
        borderRadius: 'var(--r-sm)',
        padding: '8px 14px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9375rem',
          color: 'var(--accent)',
          fontWeight: 600,
        }}
      >
        {formatINR(payload[0].value)}
      </span>
    </div>
  )
}

export function PriceChart({ data }: PriceChartProps) {
  const [range, setRange] = useState<Range>('12M')
  const colors = useChartColors()
  const filtered = filterByRange(data, range)
  const lastPrice = filtered[filtered.length - 1]?.price

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--sp-8)',
          textAlign: 'center',
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
        }}
      >
        No price history yet.
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          marginBottom: 'var(--sp-4)',
          flexWrap: 'wrap',
        }}
      >
        {RANGES.map((r) => (
          <Chip
            key={r}
            size="sm"
            variant={range === r ? 'active' : 'default'}
            onClick={() => setRange(r)}
          >
            {r}
          </Chip>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={filtered} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal
            vertical={false}
            stroke={colors.line}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => {
              const date = new Date(d)
              return date.toLocaleString('en-IN', { month: 'short' })
            }}
            tick={{ fill: 'var(--text-faint)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fill: 'var(--text-faint)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          {lastPrice && (
            <ReferenceLine
              y={lastPrice}
              stroke={colors.accent}
              strokeOpacity={0.3}
              strokeDasharray="4 4"
              label={{
                value: formatINR(lastPrice),
                position: 'right',
                fill: 'var(--accent)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke={colors.accent}
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: colors.accent, stroke: colors.bg, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
