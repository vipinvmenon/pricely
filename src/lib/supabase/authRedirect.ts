import type { SupabaseClient } from '@supabase/supabase-js'

/** Only allow same-origin relative paths after sign-in. */
export function getSafeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/watchlist'
  }
  return next
}

export function getAuthCallbackUrl(next: string): string {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
}

/**
 * PKCE OAuth — @supabase/ssr does not auto-redirect; navigate to provider URL.
 */
export async function signInWithGoogle(
  supabase: SupabaseClient,
  next: string,
): Promise<{ error: Error | null }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl(getSafeNextPath(next)),
    },
  })

  if (error) {
    return { error }
  }

  if (data.url) {
    window.location.assign(data.url)
    return { error: null }
  }

  return { error: new Error('No OAuth URL returned. Check Google provider in Supabase.') }
}
