import type { NextRequest } from 'next/server'

/**
 * Canonical app origin for OAuth redirectTo / post-login redirects.
 *
 * Set NEXT_PUBLIC_APP_URL in .env.local when developing (e.g. http://localhost:3000)
 * so redirects stay on your dev server. Supabase must list the same callback URL under
 * Authentication → URL Configuration → Redirect URLs.
 */
export function getRequestOrigin(request: NextRequest): string {
  // Always honour the host the user actually opened in local dev (localhost vs 127.0.0.1).
  if (process.env.NODE_ENV === 'development') {
    return request.nextUrl.origin
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (configured) return configured

  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const host = forwardedHost.split(',')[0]?.trim()
    const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? 'https'
    if (host) return `${proto}://${host}`
  }

  return request.nextUrl.origin
}
