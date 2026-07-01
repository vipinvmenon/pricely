import { Nav } from '@/components/layout/Nav'
import { Glass } from '@/components/ui/Glass'

export const metadata = {
  title: 'Terms of Service — Pricely',
  description: 'Terms governing use of the Pricely price comparison service.',
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />
      <main style={{ padding: '40px 24px 80px', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 32, fontSize: '0.875rem' }}>
          Last updated: 30 June 2026 · Version 1.0
        </p>

        <Glass variant="plate" style={{ padding: 'var(--sp-6)', borderRadius: 'var(--r-lg)', lineHeight: 1.7 }}>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>1. Service</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              Pricely provides price comparison, historical price charts, and optional email alerts
              for products sold by third-party retailers in India. We do not sell products directly.
            </p>
          </section>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>2. Accuracy</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              Prices, availability, and delivery estimates are sourced from retailers and may change
              without notice. Verdicts and alerts are informational only — not financial advice.
              Always confirm the final payable price on the retailer site before purchasing.
            </p>
          </section>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>3. Accounts</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              You are responsible for safeguarding your account credentials and for activity under your
              account. You may delete your account by contacting support.
            </p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>4. Contact</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              Questions about these terms: support@pricely.in
            </p>
          </section>
        </Glass>
      </main>
    </div>
  )
}
