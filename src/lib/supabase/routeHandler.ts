import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'

export type RouteCookie = {
  name: string
  value: string
  options?: Parameters<NextResponse['cookies']['set']>[2]
}

/** Supabase server client for App Router route handlers (reads request cookies). */
export function createRouteHandlerClient(
  request: NextRequest,
  onCookies?: (cookies: RouteCookie[], headers: Record<string, string>) => void,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          onCookies?.(cookiesToSet, headers ?? {})
        },
      },
    },
  )
}

export function applyRouteCookies(
  response: NextResponse,
  cookies: RouteCookie[],
  headers: Record<string, string>,
) {
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
}
