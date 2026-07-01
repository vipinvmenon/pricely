import { Nav } from '@/components/layout/Nav'
import { Glass } from '@/components/ui/Glass'

export const metadata = {
  title: 'Privacy Policy — Pricely',
  description: 'How Pricely collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />
      <main style={{ padding: '40px 24px 80px', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 32, fontSize: '0.875rem' }}>
          Last updated: 30 June 2026 · Version 1.0
        </p>

        <Glass variant="plate" style={{ padding: 'var(--sp-6)', borderRadius: 'var(--r-lg)', lineHeight: 1.7 }}>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>Data we collect</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              Account email and display name (if you sign up), city preference, watchlist and alert
              settings, and technical logs needed to operate the service.
            </p>
          </section>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>How we use it</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              To show comparisons for your city, sync your watchlist, send price-drop emails you
              request, and improve reliability. We do not sell your personal data.
            </p>
          </section>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>Retention & deletion</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              You may request export or deletion of your account data by emailing support@pricely.in.
              Price history for products is retained in aggregate form for charts.
            </p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.125rem', marginBottom: 8 }}>Consent</h2>
            <p style={{ color: 'var(--text-dim)', margin: 0 }}>
              By creating an account you agree to this policy (version 1.0). Material changes will
              be reflected on this page with an updated date.
            </p>
          </section>
        </Glass>
      </main>
    </div>
  )
}
