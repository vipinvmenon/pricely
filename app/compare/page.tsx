'use client'

import { useState, useEffect } from 'react'
import { Nav } from '@/components/ui/Nav'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { PriceBadge } from '@/components/ui/PriceBadge'
import { RetailerRow } from '@/components/ui/RetailerRow'
import { PriceChart } from '@/components/ui/PriceChart'
import type { CompareResponse } from '@/types'

const TRENDING_QUERIES = [
  'iPhone 15 128GB',
  'Dyson V12',
  'Asics Novablast 4',
  'Bose QC Ultra',
  'Lego Bonsai 10281',
]

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l3.5 3.5 6.5-7" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ComparePage() {
  const [data, setData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetch('/api/compare')
      .then((r) => r.json())
      .then((d) => {
        setData(d as CompareResponse)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const retailers = data?.retailers ?? []
  const visibleRetailers = showAll ? retailers : retailers.slice(0, 6)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />

      {/* Header */}
      <section style={{ padding: '60px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
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
            marginBottom: 20,
          }}
        >
          <span className="pulse-dot" />
          Compare · 12 retailers · live
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
          What are you{' '}
          <span style={{ color: 'var(--accent)' }}>actually</span>
          <br />
          buying?
        </h1>

        {/* Search bar */}
        <Glass
          variant="plate"
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--r-pill)',
            padding: '0 16px',
            marginBottom: 16,
          }}
        >
          <span style={{ color: 'var(--text-faint)', flexShrink: 0 }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for any product…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              padding: '16px 12px',
            }}
          />
          <Button variant="primary" size="md">Compare</Button>
        </Glass>

        {/* Trending chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TRENDING_QUERIES.map((q) => (
            <Chip key={q} variant="default" size="sm" onClick={() => setQuery(q)}>
              {q}
            </Chip>
          ))}
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Loading…
        </div>
      ) : data ? (
        <section style={{ padding: '0 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '320px 1fr',
              gap: 24,
            }}
            className="compare-grid"
          >
            {/* Left column — product info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Image placeholder */}
              <Glass
                variant="plate"
                style={{
                  borderRadius: 'var(--r-xl)',
                  aspectRatio: '4/3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  Product image
                </span>
              </Glass>

              {/* Product details */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    marginBottom: 8,
                  }}
                >
                  {data.product.brand} · {data.product.category}
                </div>
                <h2
                  style={{
                    fontSize: '1.375rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    margin: '0 0 16px',
                    lineHeight: 1.3,
                  }}
                >
                  {data.product.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <PriceBadge value={retailers[0]?.price ?? 0} size="lg" />
                  {retailers[0]?.mrp && (
                    <PriceBadge value={retailers[0].mrp} size="sm" strike />
                  )}
                  {retailers[0]?.mrp && retailers[0]?.price && (
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--accent)',
                      }}
                    >
                      -{Math.round(((retailers[0].mrp - retailers[0].price) / retailers[0].mrp) * 100)}%
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', marginBottom: 20 }}>
                  ₹6,540 below 90-day median · last drop 4 days ago
                </div>
              </div>

              {/* Verdict card */}
              <Glass
                variant="plate"
                style={{
                  padding: 'var(--sp-4)',
                  borderLeft: '2px solid var(--accent)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <CheckIcon />
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Buy now.</strong> Price model
                    says wait gives ≤2% upside.
                  </p>
                </div>
              </Glass>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="primary" size="md" style={{ flex: 1 }}>
                  Buy at Amazon
                </Button>
                <Button variant="ghost" size="md" style={{ flex: 1 }}>
                  Track
                </Button>
              </div>
            </div>

            {/* Right column — retailer table */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
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
                  }}
                >
                  <span className="pulse-dot" />6 of 12 retailers · sorted by price
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Price', 'Delivery', 'Trust'].map((s, i) => (
                    <Chip key={s} size="sm" variant={i === 0 ? 'active' : 'default'}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>

              <Glass variant="plate" style={{ padding: '8px 0', borderRadius: 'var(--r-lg)' }}>
                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr auto auto auto auto auto',
                    gap: '16px',
                    padding: '8px 20px 12px',
                    borderBottom: '1px solid var(--glass-plate-border)',
                  }}
                >
                  {['#', 'Retailer', 'Price', 'Delivery', 'Returns', 'Stock', ''].map((h) => (
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

                {visibleRetailers.map((r) => (
                  <RetailerRow
                    key={r.name}
                    rank={r.rank}
                    name={r.name}
                    isLowest={r.isLowest}
                    price={r.price}
                    mrp={r.mrp}
                    delivery={r.delivery}
                    returns={r.returns}
                    stock={r.stock}
                    onBuy={() => window.open(r.buyUrl, '_blank')}
                  />
                ))}

                <div
                  style={{
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--glass-plate-border)',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
                    + 6 more retailers · prices verified 12 min ago
                  </span>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--accent)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                    }}
                  >
                    {showAll ? 'Show less' : 'Show all →'}
                  </button>
                </div>
              </Glass>
            </div>
          </div>

          {/* Price history chart */}
          <div style={{ marginTop: 48 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8125rem',
                  color: 'var(--text-dim)',
                }}
              >
                <span className="pulse-dot" />
                Price history · 12 months
              </div>
            </div>

            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                margin: '0 0 24px',
              }}
            >
              Currently the <span style={{ color: 'var(--accent)' }}>lowest</span> in 7 months.
            </h2>

            <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
              <PriceChart data={data.history} />
            </Glass>
          </div>
        </section>
      ) : null}

      <style>{`
        @media (max-width: 900px) {
          .compare-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
