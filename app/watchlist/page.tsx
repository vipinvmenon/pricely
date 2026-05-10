'use client'

import { useState, useEffect } from 'react'
import { Nav } from '@/components/ui/Nav'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { WatchlistRow } from '@/components/ui/WatchlistRow'
import type { WatchlistPageItem } from '@/types'

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistPageItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/watchlist')
      .then((r) => r.json())
      .then((d) => {
        setItems(d as WatchlistPageItem[])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />

      {/* Header */}
      <section style={{ padding: '60px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div>
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
              Watchlist · {items.length} items · 1 alert today
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 500,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                margin: 0,
              }}
            >
              Tracking quietly.{' '}
              <span style={{ color: 'var(--accent)' }}>Saved ₹14,228</span> this month.
            </h1>
          </div>

          <Button variant="primary" size="md">+ Add product</Button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 40,
          }}
          className="stats-grid"
        >
          <StatCard label="Tracked" value="5" sub="products" />
          <StatCard label="Below Target" value="1" sub="Asics Novablast" />
          <StatCard label="Total Saved" value="₹14,228" sub="this month" />
          <StatCard label="Next Drop Est." value="8 days" sub="Sony WH-1000XM5" />
        </div>

        {/* Table */}
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
        ) : (
          <Glass variant="plate" style={{ padding: '8px 0', borderRadius: 'var(--r-xl)' }}>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto auto auto',
                gap: '16px',
                padding: '8px 20px 14px',
                borderBottom: '1px solid var(--glass-plate-border)',
              }}
            >
              {['Product', 'Target', 'Now', 'Vs. Target', 'Trend', 'Status'].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {items.map((item) => (
              <WatchlistRow
                key={item.id}
                initials={item.initials}
                name={item.name}
                subtitle={item.subtitle}
                target={item.target}
                now={item.now}
                mrp={item.mrp}
                vsTarget={item.vsTarget}
                trend={item.trend}
                status={item.status}
              />
            ))}
          </Glass>
        )}
      </section>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
