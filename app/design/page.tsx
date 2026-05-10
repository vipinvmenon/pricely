'use client'

import { Nav } from '@/components/ui/Nav'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { PriceBadge } from '@/components/ui/PriceBadge'

const COLOR_SWATCHES = [
  { token: '--bg0', hex: '#0A0A0B', label: 'bg0', desc: 'Page floor' },
  { token: '--bg1', hex: '#111214', label: 'bg1', desc: 'Surface' },
  { token: '--bg2', hex: '#1A1C1F', label: 'bg2', desc: 'Raised' },
  { token: '--bg3', hex: '#222528', label: 'bg3', desc: 'Inset' },
  { token: '--accent', hex: '#1ED760', label: 'accent', desc: 'Pricely green' },
  { token: '--text', hex: '#F4F4F6', label: 'text', desc: 'Primary ink' },
  { token: '--text-dim', hex: '#8A8F98', label: 'textDim', desc: 'Secondary / muted' },
  { token: '--save', hex: '#1ED760', label: 'save', desc: 'Positive / drop' },
  { token: '--warn', hex: '#F5A623', label: 'warn', desc: 'Surge / caution' },
  { token: '--danger', hex: '#F05252', label: 'danger', desc: 'Negative / rise' },
]

const RADIUS_SCALE = [
  { token: '--r-xs', value: '6px' },
  { token: '--r-sm', value: '10px' },
  { token: '--r-md', value: '14px' },
  { token: '--r-lg', value: '20px' },
  { token: '--r-xl', value: '28px' },
  { token: '--r-xxl', value: '36px' },
  { token: '--r-pill', value: '999px' },
]

const SPACING = [
  { token: '--sp-1', value: '4px' },
  { token: '--sp-2', value: '8px' },
  { token: '--sp-3', value: '12px' },
  { token: '--sp-4', value: '16px' },
  { token: '--sp-6', value: '24px' },
  { token: '--sp-8', value: '32px' },
  { token: '--sp-12', value: '48px' },
]

export default function DesignPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-faint)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Design system · v0.1 · single-file reference
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              margin: 0,
            }}
          >
            Liquid glass,{' '}
            <span style={{ color: 'var(--accent)' }}>system-quiet.</span>
          </h1>
        </div>

        {/* 01 Color */}
        <section style={{ marginBottom: 64 }}>
          <SectionLabel index="01" title="Color" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 'var(--sp-3)',
            }}
          >
            {COLOR_SWATCHES.map((s) => (
              <div key={s.token}>
                <div
                  style={{
                    height: 64,
                    borderRadius: 'var(--r-md)',
                    background: s.hex,
                    border: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text)',
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{s.desc}</div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-faint)',
                  }}
                >
                  {s.hex}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02 Type */}
        <section style={{ marginBottom: 64 }}>
          <SectionLabel index="02" title="Type" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Display · Geist 500 · -3% ls
              </div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 500,
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em',
                  color: 'var(--text)',
                }}
              >
                Never overpay again.
              </div>
            </Glass>

            <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Numerals · Geist Mono · tabular
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PriceBadge value={23450} size="lg" />
                <PriceBadge value={23450} size="md" />
                <PriceBadge value={29990} size="sm" strike />
              </div>
            </Glass>
          </div>
        </section>

        {/* 03 Glass surfaces */}
        <section style={{ marginBottom: 64 }}>
          <SectionLabel index="03" title="Glass surfaces" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-4)' }}>
            {(['plate', 'strong', 'solid'] as const).map((variant) => (
              <Glass key={variant} variant={variant} style={{ padding: 'var(--sp-6)' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 8,
                    textTransform: 'capitalize',
                  }}
                >
                  {variant}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
                  {variant === 'plate' && 'Default card surface — rgba(255,255,255,0.04)'}
                  {variant === 'strong' && 'Elevated surface — rgba(255,255,255,0.08)'}
                  {variant === 'solid' && 'Opaque overlay — rgba(20,22,26,0.85)'}
                </div>
              </Glass>
            ))}
          </div>
        </section>

        {/* 04 Controls */}
        <section style={{ marginBottom: 64 }}>
          <SectionLabel index="04" title="Controls" />
          <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Buttons
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button variant="primary" size="lg">Primary LG</Button>
                <Button variant="primary" size="md">Primary MD</Button>
                <Button variant="primary" size="sm">Primary SM</Button>
                <Button variant="ghost" size="lg">Ghost LG</Button>
                <Button variant="ghost" size="md">Ghost MD</Button>
                <Button variant="ghost" size="sm">Ghost SM</Button>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Chips
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip variant="active" withDot>Live · 12 retailers</Chip>
                <Chip variant="active">Active</Chip>
                <Chip variant="default">Default</Chip>
                <Chip variant="ghost">Ghost</Chip>
                <Chip variant="default" size="sm">Small</Chip>
                <Chip variant="active" size="sm">Small active</Chip>
              </div>
            </div>
          </Glass>
        </section>

        {/* 05 Spacing & Radius */}
        <section style={{ marginBottom: 64 }}>
          <SectionLabel index="05" title="Spacing & Radius" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Radius scale
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RADIUS_SCALE.map(({ token, value }) => (
                  <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 24,
                        background: 'var(--bg3)',
                        border: '1px solid var(--glass-plate-border)',
                        borderRadius: value === '999px' ? '999px' : value,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-dim)',
                      }}
                    >
                      {token} — {value}
                    </span>
                  </div>
                ))}
              </div>
            </Glass>

            <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-faint)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Spacing rhythm (4px base)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SPACING.map(({ token, value }) => {
                  const px = parseInt(value)
                  return (
                    <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: px * 2,
                          height: 12,
                          background: 'var(--accent-dim)',
                          border: '1px solid var(--accent-border)',
                          borderRadius: 2,
                          flexShrink: 0,
                          maxWidth: 120,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          color: 'var(--text-dim)',
                        }}
                      >
                        {token} — {value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Glass>
          </div>
        </section>

        {/* 06 Use it */}
        <section>
          <SectionLabel index="06" title="Use it" />
          <Glass variant="plate" style={{ padding: 'var(--sp-6)' }}>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, margin: 0, fontSize: '0.9375rem' }}>
              Tokens live in{' '}
              <code
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  background: 'var(--bg3)',
                  padding: '2px 6px',
                  borderRadius: 'var(--r-xs)',
                  color: 'var(--accent)',
                }}
              >
                src/styles/tokens.css
              </code>
              . Components reference them via CSS custom properties — never hardcoded hex values. The
              five-file system:{' '}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                tokens.css · Glass · Button · Chip · PriceBadge
              </code>{' '}
              compose everything else.
            </p>
          </Glass>
        </section>
      </main>
    </div>
  )
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 24,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          color: 'var(--accent)',
          fontWeight: 600,
        }}
      >
        {index}
      </span>
      <h2
        style={{
          fontSize: '1.375rem',
          fontWeight: 500,
          color: 'var(--text)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
    </div>
  )
}
