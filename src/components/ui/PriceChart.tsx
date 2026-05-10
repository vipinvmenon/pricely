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
  const filtered = filterByRange(data, range)
  const lastPrice = filtered[filtered.length - 1]?.price

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
              <stop offset="0%" stopColor="#1ED760" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1ED760" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal
            vertical={false}
            stroke="rgba(255,255,255,0.04)"
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
              stroke="rgba(30,215,96,0.3)"
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
            stroke="#1ED760"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#1ED760', stroke: 'var(--bg0)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
