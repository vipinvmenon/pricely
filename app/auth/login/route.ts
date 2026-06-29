import { NextResponse, type NextRequest } from 'next/server'
import {
  getSafeNextPath,
  OAUTH_NEXT_COOKIE,
  OAUTH_NEXT_COOKIE_OPTIONS,
} from '@/lib/supabase/authRedirect'
import { getRequestOrigin } from '@/lib/supabase/requestOrigin'
import {
  applyRouteCookies,
  createRouteHandlerClient,
  type RouteCookie,
} from '@/lib/supabase/routeHandler'

/**
 * Start Google OAuth on the server so the PKCE code verifier is stored in cookies
 * (readable by /auth/callback). Client-side signInWithOAuth can lose the verifier
 * across redirects, especially after sign-out.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = getRequestOrigin(request)
  const next = getSafeNextPath(searchParams.get('next'))
  // Must match Supabase Redirect URLs exactly — no query string (use OAUTH_NEXT_COOKIE).
  const redirectTo = `${origin}/auth/callback`

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(`${origin}/signin?error=supabase_not_configured`)
  }

  const pendingCookies: RouteCookie[] = []
  let pendingHeaders: Record<string, string> = {}

  const supabase = createRouteHandlerClient(request, (cookies, headers) => {
    pendingCookies.push(...cookies)
    pendingHeaders = { ...pendingHeaders, ...headers }
  })

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error?.message ?? 'oauth_start_failed')}`,
    )
  }

  const response = NextResponse.redirect(data.url)
  applyRouteCookies(response, pendingCookies, pendingHeaders)
  response.cookies.set(OAUTH_NEXT_COOKIE, next, OAUTH_NEXT_COOKIE_OPTIONS)
  return response
}
