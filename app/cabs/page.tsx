'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Nav } from '@/components/ui/Nav'
import { Glass } from '@/components/ui/Glass'
import { Chip } from '@/components/ui/Chip'
import { FareCard } from '@/components/ui/FareCard'
import { formatINR } from '@/lib/utils/format'
import type { TripsResponse, FareResult } from '@/types'

type VehicleType = 'Mini' | 'Sedan' | 'SUV' | 'Auto'
const VEHICLE_TYPES: VehicleType[] = ['Mini', 'Sedan', 'SUV', 'Auto']

type TimeOffset = 'Now' | '+1h' | '+2h' | 'Custom'
const TIME_OFFSETS: TimeOffset[] = ['Now', '+1h', '+2h', 'Custom']

const FARE_COLORS: Record<string, string> = {
  blusmart: '#1ED760',
  rapido: '#F5A623',
  uber: '#4F8EF7',
  ola: '#F05252',
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--glass-solid-bg)',
        border: '1px solid var(--glass-solid-border)',
        borderRadius: 'var(--r-sm)',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-faint)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: p.color }}>
            {p.name}: {formatINR(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CabsPage() {
  const [data, setData] = useState<TripsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [vehicleType, setVehicleType] = useState<VehicleType>('Sedan')
  const [timeOffset, setTimeOffset] = useState<TimeOffset>('Now')

  useEffect(() => {
    fetch('/api/trips')
      .then((r) => r.json())
      .then((d) => {
        setData(d as TripsResponse)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const lowestFare = data?.fares.find((f) => f.isLowest)
  const highestFare = data?.fares[data.fares.length - 1]
  const savings = lowestFare && highestFare ? highestFare.price - lowestFare.price : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />

      {/* Header */}
      <section style={{ padding: '60px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          <span className="pulse-dot" />
          Trips · cab fares across 4 apps
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            fontWeight: 500,
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            margin: '0 0 40px',
          }}
        >
          One ride. Four apps.{' '}
          <span style={{ color: 'var(--accent)' }}>Real prices.</span>
        </h1>
      </section>

      {/* Main layout */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Loading…
        </div>
      ) : data ? (
        <section style={{ padding: '0 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}
            className="trips-grid"
          >
            {/* Left — route card */}
            <Glass variant="plate" style={{ padding: 'var(--sp-6)', alignSelf: 'start' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8125rem',
                  color: 'var(--text-dim)',
                  fontWeight: 600,
                  marginBottom: 24,
                }}
              >
                <span className="pulse-dot" />
                Route
              </div>

              {/* FROM */}
              <div
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--glass-plate-border)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px',
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>From</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text)' }}>
                  Indiranagar Metro, Bangalore
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>ETA 0 min</div>
              </div>

              {/* connector */}
              <div
                style={{
                  width: 1,
                  height: 20,
                  background: 'rgba(255,255,255,0.12)',
                  margin: '0 auto 4px',
                  marginLeft: 28,
                }}
              />

              {/* TO */}
              <div
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--glass-plate-border)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px 16px',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>To</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text)' }}>
                  Kempegowda Intl. Airport (T2)
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>42 km · 58 min</div>
              </div>

              {/* Time chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {TIME_OFFSETS.map((t) => (
                  <Chip
                    key={t}
                    size="sm"
                    variant={timeOffset === t ? 'active' : 'default'}
                    onClick={() => setTimeOffset(t)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>

              {/* Surge notice */}
              <div
                style={{
                  background: 'rgba(245,166,35,0.08)',
                  border: '1px solid rgba(245,166,35,0.25)',
                  borderRadius: 'var(--r-md)',
                  padding: '10px 14px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-dim)',
                  lineHeight: 1.5,
                }}
              >
                Surge: <strong style={{ color: 'var(--warn)' }}>1.4×</strong> on Ola &amp; Uber. No surge on
                Rapido or BluSmart.
              </div>
            </Glass>

            {/* Right — fares card */}
            <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.875rem',
                    color: 'var(--text-dim)',
                    fontWeight: 600,
                  }}
                >
                  <span className="pulse-dot" />
                  Fares · Sedan AC · 4 seats
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {VEHICLE_TYPES.map((v) => (
                    <Chip
                      key={v}
                      size="sm"
                      variant={vehicleType === v ? 'active' : 'default'}
                      onClick={() => setVehicleType(v)}
                    >
                      {v}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Fare cards 2×2 grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 14,
                  marginBottom: 20,
                }}
                className="fare-cards-grid"
              >
                {data.fares.map((fare: FareResult) => (
                  <FareCard
                    key={fare.id}
                    name={fare.name}
                    isLowest={fare.isLowest}
                    price={fare.price}
                    eta={fare.eta}
                    surgeMultiplier={fare.surgeMultiplier}
                    onBook={() => window.open(fare.bookUrl, '_blank')}
                  />
                ))}
              </div>

              {/* Savings banner */}
              {savings > 0 && lowestFare && (
                <div
                  style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--r-md)',
                    padding: '12px 16px',
                    fontSize: '0.875rem',
                    color: 'var(--text-dim)',
                  }}
                >
                  You'd save{' '}
                  <strong style={{ color: 'var(--accent)' }}>{formatINR(savings)}</strong> picking{' '}
                  {lowestFare.name} over {data.fares[data.fares.length - 1]?.name} right now. Refreshes
                  every 90 seconds.
                </div>
              )}
            </Glass>
          </div>

          {/* Fare history chart */}
          <div style={{ marginTop: 40 }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'var(--text)',
                margin: '0 0 20px',
              }}
            >
              Fare history · last 6 hours
            </h2>

            <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
                {data.fares.map((f: FareResult) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 12,
                        height: 3,
                        borderRadius: 2,
                        background: FARE_COLORS[f.id] ?? 'var(--text-dim)',
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{f.name}</span>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={data.fareHistory}
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    horizontal
                    vertical={false}
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'var(--text-faint)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `₹${v}`}
                    tick={{ fill: 'var(--text-faint)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {(['blusmart', 'rapido', 'uber', 'ola'] as const).map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={FARE_COLORS[key]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, stroke: 'var(--bg0)', strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Glass>
          </div>
        </section>
      ) : null}

      <style>{`
        @media (max-width: 900px) {
          .trips-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .fare-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
