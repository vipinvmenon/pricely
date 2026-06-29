import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          )
        },
      },
    },
  )

  // Refresh session cookie on navigation (no redirects — pages handle auth UX).
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  // Skip /api — routes read cookies directly; avoids duplicate auth work per SWR poll.
  // Skip /auth/callback and /auth/login — middleware session refresh can clear PKCE cookies.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/callback|auth/login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
