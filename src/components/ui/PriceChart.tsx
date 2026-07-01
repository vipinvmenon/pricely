'use client'

import { useMemo, useState } from 'react'
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

function historySpanDays(data: HistoryPoint[]): number {
  if (data.length < 2) return data.length > 0 ? 1 : 0
  const oldest = new Date(data[0].date).getTime()
  const newest = new Date(data[data.length - 1].date).getTime()
  return Math.max(1, Math.round((newest - oldest) / 86_400_000))
}

function rangesWithCoverage(data: HistoryPoint[]): Range[] {
  const spanDays = historySpanDays(data)
  const thresholds: Record<Exclude<Range, 'All'>, number> = {
    '1M': 7,
    '3M': 45,
    '6M': 90,
    '12M': 180,
  }

  const viable = RANGES.filter((range) => {
    if (range === 'All') return data.length > 1
    return spanDays >= thresholds[range]
  })

  return viable.length > 0 ? viable : (['All'] as Range[])
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
  const colors = useChartColors()
  const availableRanges = useMemo(() => rangesWithCoverage(data), [data])
  const [range, setRange] = useState<Range>(() => availableRanges[availableRanges.length - 1] ?? 'All')
  const activeRange = availableRanges.includes(range) ? range : availableRanges[availableRanges.length - 1] ?? 'All'
  const filtered = filterByRange(data, activeRange)
  const lastPrice = filtered[filtered.length - 1]?.price
  const coverageDays = historySpanDays(data)

  if (data.length === 0) {
    return (
      <div
        role="status"
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
    <div className="price-chart">
      <p className="sr-only">
        Price chart with {coverageDays} days of daily lowest prices.
        {lastPrice ? ` Current lowest tracked price ${formatINR(lastPrice)}.` : ''}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          marginBottom: 'var(--sp-4)',
          flexWrap: 'wrap',
        }}
      >
        {availableRanges.map((r) => (
          <Chip
            key={r}
            size="sm"
            variant={activeRange === r ? 'active' : 'default'}
            onClick={() => setRange(r)}
          >
            {r}
          </Chip>
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          {coverageDays} days tracked
        </span>
      </div>

      <div className="price-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filtered}
            margin={{ top: 12, right: 72, left: 4, bottom: 8 }}
          >
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
              minTickGap={24}
            />
            <YAxis
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fill: 'var(--text-faint)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={52}
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
                  position: 'insideTopRight',
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
    </div>
  )
}
