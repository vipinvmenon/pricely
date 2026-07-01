'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { getSafeNextPath, getGoogleLoginPath } from '@/lib/supabase/authRedirect'
import { isSupabaseConfigured, SUPABASE_SETUP_HINT } from '@/lib/supabase/config'
import { formatAuthError } from '@/lib/utils/authErrors'
import { authInputStyle, authErrorBoxStyle, authLabelStyle } from '@/lib/auth/fieldStyles'

const authAvailable = isSupabaseConfigured()

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l3.5 3.5 6.5-7" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const BULLETS = [
  'Your watchlist and alerts, exactly where you left them',
  'Price history across 7 retailers, always up to date',
  'Instant notifications when your target price drops',
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

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = formatAuthError(searchParams.get('error'))
  const nextPath = getSafeNextPath(searchParams.get('next'))
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [error, setError]           = useState<string | null>(urlError)

  const showResendConfirmation = Boolean(error?.includes('Confirm your email'))

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!authAvailable) {
      setError(SUPABASE_SETUP_HINT)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(formatAuthError(authError.message) ?? authError.message)
        return
      }
      router.refresh()
      router.push(nextPath)
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
    window.location.assign(getGoogleLoginPath(nextPath))
  }

  async function handleResendConfirmation() {
    if (!authAvailable) {
      setError(SUPABASE_SETUP_HINT)
      return
    }
    if (!email.trim()) {
      setResendMessage('Enter your email above first.')
      return
    }

    setResendLoading(true)
    setResendMessage(null)
    try {
      const supabase = createClient()
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })
      if (resendError) {
        setResendMessage(resendError.message)
        return
      }
      setResendMessage('Confirmation email sent — check your inbox.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg0)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
      className="signin-grid"
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
            Sign In
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
            Welcome back.
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
            Pick up where Pricely left off — your watchlist and price alerts are exactly where you
            parked them.
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
            Sign in to Pricely
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
              Local dev mode — sign-in is disabled without Supabase env vars. You can still use{' '}
              <Link href="/watchlist" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                watchlist
              </Link>{' '}
              and{' '}
              <Link href="/compare" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                compare
              </Link>{' '}
              with mock data.
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={authErrorBoxStyle}
            >
              {error}
            </div>
          )}

          {showResendConfirmation && (
            <div style={{ marginBottom: 16 }}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                fullWidth
                disabled={resendLoading || !authAvailable}
                onClick={() => void handleResendConfirmation()}
              >
                {resendLoading ? 'Sending…' : 'Resend confirmation email'}
              </Button>
              {resendMessage && (
                <p role="status" style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: 8 }}>
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={authLabelStyle}>
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
                style={authInputStyle}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={authLabelStyle}>
                  Password
                </span>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={!authAvailable}
                  autoComplete="current-password"
                  style={{ ...authInputStyle, flex: 1 }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
            </label>

            <Button type="submit" variant="primary" size="md" fullWidth disabled={loading || !authAvailable}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-plate-border)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-plate-border)' }} />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="md"
            fullWidth
            disabled={loading || !authAvailable}
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon /> Continue with Google
          </Button>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-faint)',
              textAlign: 'center',
              margin: '20px 0 0',
            }}
          >
            New to Pricely?{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
        </Glass>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .signin-grid { grid-template-columns: 1fr !important; }
          .signin-grid > *:first-child { display: none; }
          .signin-grid > *:last-child { border-left: none !important; }
        }
      `}</style>
    </div>
  )
}
