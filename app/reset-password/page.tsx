'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured, SUPABASE_SETUP_HINT } from '@/lib/supabase/config'
import { passwordStrengthLabel, passwordValidationError, passwordsMatch } from '@/lib/utils/password'

const authAvailable = isSupabaseConfigured()

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const strength = passwordStrengthLabel(password)
  const validationError = passwordValidationError(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authAvailable) {
      setError(SUPABASE_SETUP_HINT)
      return
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setError('Passwords do not match.')
      return
    }
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      router.push('/watchlist')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Glass variant="plate" style={{ padding: 40, maxWidth: 420, width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px', color: 'var(--text)' }}>
          Choose a new password
        </h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
          Set a new password for your Pricely account.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div role="alert" style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>New password</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={{ ...inputStyle, flex: 1 }}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            {strength && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>{strength}</span>
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>Confirm password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={inputStyle}
            />
          </label>

          <Button type="submit" variant="primary" size="md" fullWidth disabled={loading || !authAvailable}>
            {loading ? 'Saving…' : 'Update password'}
          </Button>
        </form>

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
