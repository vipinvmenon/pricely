'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured, SUPABASE_SETUP_HINT } from '@/lib/supabase/config'

const authAvailable = isSupabaseConfigured()

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authAvailable) {
      setError(SUPABASE_SETUP_HINT)
      return
    }

    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Glass variant="plate" style={{ padding: 40, maxWidth: 420, width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px', color: 'var(--text)' }}>
          Reset your password
        </h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
          Enter your account email and we&apos;ll send a secure reset link.
        </p>

        {sent ? (
          <div role="status" style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div role="alert" style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </label>
            <Button type="submit" variant="primary" size="md" fullWidth disabled={loading || !authAvailable}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p style={{ marginTop: 24, fontSize: '0.875rem', color: 'var(--text-faint)', textAlign: 'center' }}>
          <Link href="/signin" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </p>
      </Glass>
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
}
