import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Glass } from '@/components/ui/Glass'

export const metadata: Metadata = {
  title: 'How Pricely works — Methodology',
  description:
    'How Pricely compares prices, builds history, and issues buy or wait verdicts across supported Indian retailers.',
}

export default function MethodologyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />
      <main style={{ padding: '40px 24px 0', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>
          Methodology
        </h1>
        <Glass variant="plate" style={{ padding: 'var(--sp-6)', borderRadius: 'var(--r-lg)', lineHeight: 1.7 }}>
          <p style={{ color: 'var(--text-dim)', marginTop: 0 }}>
            Pricely is a price intelligence tool for electronics and fashion in India. We
            compare <strong>listed prices</strong> from supported retailers in your selected
            city — not grocery or cab fares.
          </p>
          <h2 style={{ fontSize: '1.125rem', color: 'var(--text)', marginTop: 24 }}>What we compare</h2>
          <ul style={{ color: 'var(--text-dim)', paddingLeft: 20 }}>
            <li>Listed product price and MRP where retailers expose it</li>
            <li>Stock status when available from the retailer page or API</li>
            <li>Daily lowest in-stock price for verdict history (one series per product)</li>
          </ul>
          <h2 style={{ fontSize: '1.125rem', color: 'var(--text)', marginTop: 24 }}>What we do not guarantee</h2>
          <ul style={{ color: 'var(--text-dim)', paddingLeft: 20 }}>
            <li>Final payable price after shipping, coupons, bank offers, or EMI</li>
            <li>Real-time updates on every retailer at all times</li>
            <li>Perfect product variant matching without your confirmation</li>
          </ul>
          <h2 style={{ fontSize: '1.125rem', color: 'var(--text)', marginTop: 24 }}>Alerts</h2>
          <p style={{ color: 'var(--text-dim)' }}>
            Email alerts are checked on a scheduled cadence (currently every 15 minutes when
            configured). Delivery depends on your email provider and our sender reputation.
          </p>
          <p style={{ marginTop: 24 }}>
            <Link href="/compare" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Start a comparison →
            </Link>
          </p>
        </Glass>
      </main>
      <SiteFooter />
    </div>
  )
}
