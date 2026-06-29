/** Only allow same-origin relative paths after sign-in. */
export function getSafeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/watchlist'
  }
  return next
}

/** Short-lived cookie holding post-OAuth redirect (keeps redirectTo URL exact for Supabase allow list). */
export const OAUTH_NEXT_COOKIE = 'pricely-oauth-next'

export const OAUTH_NEXT_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 600,
}

/** Route that starts Google OAuth on the server (PKCE verifier stored in cookies). */
export function getGoogleLoginPath(next: string): string {
  return `/auth/login?next=${encodeURIComponent(getSafeNextPath(next))}`
}
