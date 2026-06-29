import { NextResponse, type NextRequest } from 'next/server'
import {
  getSafeNextPath,
  OAUTH_NEXT_COOKIE,
  OAUTH_NEXT_COOKIE_OPTIONS,
} from '@/lib/supabase/authRedirect'
import { getRequestOrigin } from '@/lib/supabase/requestOrigin'
import { createRouteHandlerClient } from '@/lib/supabase/routeHandler'

function clearOAuthNextCookie(response: NextResponse) {
  response.cookies.set(OAUTH_NEXT_COOKIE, '', { ...OAUTH_NEXT_COOKIE_OPTIONS, maxAge: 0 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = getRequestOrigin(request)
  const code = searchParams.get('code')
  const next = getSafeNextPath(
    searchParams.get('next') ?? request.cookies.get(OAUTH_NEXT_COOKIE)?.value,
  )
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error')

  if (oauthError) {
    const response = NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(oauthError)}`,
    )
    clearOAuthNextCookie(response)
    return response
  }

  if (!code) {
    const response = NextResponse.redirect(`${origin}/signin?error=missing_code`)
    clearOAuthNextCookie(response)
    return response
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const response = NextResponse.redirect(`${origin}/signin?error=supabase_not_configured`)
    clearOAuthNextCookie(response)
    return response
  }

  const redirectTo = `${origin}${next}`
  const response = NextResponse.redirect(redirectTo)

  const supabase = createRouteHandlerClient(request, (cookies, headers) => {
    cookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const errorResponse = NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error.message)}`,
    )
    clearOAuthNextCookie(errorResponse)
    return errorResponse
  }

  clearOAuthNextCookie(response)
  return response
}
