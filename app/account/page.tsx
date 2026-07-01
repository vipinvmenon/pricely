'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { useSupabaseUser } from '@/lib/hooks/useSupabaseUser'
import { fetchJson } from '@/lib/utils/fetchJson'

export default function AccountPage() {
  const router = useRouter()
  const { user, ready, signOut, configured } = useSupabaseUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDeleteAccount() {
    setLoading(true)
    setError(null)
    try {
      await fetchJson('/api/account', { method: 'DELETE' })
      await signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete account.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)' }}>
      <Nav />
      <main style={{ padding: '40px 24px 80px', maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 24, color: 'var(--text)' }}>
          Account
        </h1>

        {!configured || !ready ? (
          <p style={{ color: 'var(--text-dim)' }}>Loading account…</p>
        ) : !user ? (
          <Glass variant="plate" style={{ padding: 32, borderRadius: 'var(--r-lg)' }}>
            <p style={{ color: 'var(--text-dim)', marginBottom: 16 }}>Sign in to manage your account.</p>
            <Link href="/signin" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="md" type="button">Sign in</Button>
            </Link>
          </Glass>
        ) : (
          <Glass variant="plate" style={{ padding: 32, borderRadius: 'var(--r-lg)' }}>
            <p style={{ color: 'var(--text-dim)', marginBottom: 8 }}>Signed in as</p>
            <p style={{ color: 'var(--text)', marginBottom: 24, fontWeight: 500 }}>{user.email}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem' }}>
                Change password
              </Link>
              <a
                href="/api/account/export"
                style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                Download my data (JSON)
              </a>
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: 8, color: 'var(--text)' }}>Delete account</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16 }}>
                Permanently removes your watchlist, alerts, and profile. This cannot be undone.
              </p>
              {error && (
                <div role="alert" style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              {confirmDelete ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="button" disabled={loading} onClick={() => void handleDeleteAccount()}>
                    {loading ? 'Deleting…' : 'Confirm delete'}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" type="button" onClick={() => setConfirmDelete(true)}>
                  Delete my account
                </Button>
              )}
            </div>
          </Glass>
        )}
      </main>
    </div>
  )
}
