'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { getGoogleLoginPath } from '@/lib/supabase/authRedirect'
import { isSupabaseConfigured, SUPABASE_SETUP_HINT } from '@/lib/supabase/config'

const authAvailable = isSupabaseConfigured()

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l3.5 3.5 6.5-7" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const BULLETS = [
  'Compare prices across 7 Indian retailers in one view',
  'Set target prices and get notified the moment they drop',
  'Price history and a clear buy-or-wait verdict — all free',
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

export default function SignUpPage() {
  const router                          = useRouter()
  const [fullName, setFullName]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [confirmed, setConfirmed]       = useState(false)

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!authAvailable) {
      setError(SUPABASE_SETUP_HINT)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: fullName } },
      })
      if (authError) { setError(authError.message); return }
      setConfirmed(true)
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignIn() {
    if (!authAvailable) {
      setError(SUPABASE_SETUP_HINT)
      return
    }
    setError(null)
    setLoading(true)
    window.location.assign(getGoogleLoginPath('/watchlist'))
  }

  if (confirmed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Glass variant="plate" style={{ padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 16px' }}>Check your email</h2>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.65, marginBottom: 24 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Button variant="ghost" size="md" onClick={() => router.push('/signin')}>Back to sign in</Button>
        </Glass>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg0)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
      className="signup-grid"
    >
      {/* Left — editorial */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(40px, 6vw, 80px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 50% at 10% 50%, var(--save-soft) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
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
            Create account
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              margin: '0 0 24px',
            }}
          >
            Start watching{' '}
            <span style={{ color: 'var(--accent)' }}>prices.</span>
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-dim)',
              lineHeight: 1.65,
              margin: '0 0 36px',
              maxWidth: 440,
            }}
          >
            Stop overpaying on electronics and fashion. Pricely tracks the price across India&apos;s
            major retailers and tells you when to buy.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BULLETS.map((b) => (
              <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckIcon />
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(40px, 6vw, 80px)',
          borderLeft: '1px solid var(--line)',
        }}
      >
        <Glass
          variant="plate"
          style={{ padding: 'clamp(24px, 4vw, 40px)', width: '100%', maxWidth: 400 }}
        >
          <h2
            style={{
              fontSize: '1.375rem',
              fontWeight: 600,
              color: 'var(--text)',
              margin: '0 0 28px',
            }}
          >
            Create your account
          </h2>

          {!authAvailable && (
            <div
              style={{
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--r-md)',
                padding: '12px 14px',
                marginBottom: 16,
                fontSize: '0.875rem',
                color: 'var(--text-dim)',
                lineHeight: 1.5,
              }}
            >
              Local dev mode — sign-up needs Supabase env vars. Browse with mock data on{' '}
              <Link href="/compare" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                compare
              </Link>{' '}
              or{' '}
              <Link href="/watchlist" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                watchlist
              </Link>
              .
            </div>
          )}

          {error && (
            <div
              style={{
                background: 'var(--danger-soft)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--r-md)',
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: '0.875rem',
                color: 'var(--danger)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dim)' }}>
                Full name
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                autoComplete="name"
                disabled={!authAvailable}
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dim)' }}>
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={!authAvailable}
                autoComplete="email"
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dim)' }}>
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                disabled={!authAvailable}
                autoComplete="new-password"
                style={inputStyle}
              />
            </label>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', margin: '4px 0', lineHeight: 1.5 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms</a> and{' '}
              <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</a>.
            </p>

            <Button variant="primary" size="md" fullWidth disabled={loading || !authAvailable}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-plate-border)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-plate-border)' }} />
          </div>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            disabled={loading || !authAvailable}
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon /> Continue with Google
          </Button>

          <div style={{ display: 'none' }}>{/* Apple/SSO removed — not configured */}
          </div>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-faint)',
              textAlign: 'center',
              margin: '20px 0 0',
            }}
          >
            Already have an account?{' '}
            <Link href="/signin" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </Glass>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .signup-grid { grid-template-columns: 1fr !important; }
          .signup-grid > *:first-child { display: none; }
          .signup-grid > *:last-child { border-left: none !important; }
        }
      `}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid var(--glass-plate-border)',
  borderRadius: 'var(--r-pill)',
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
}
