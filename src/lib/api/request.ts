import { NextResponse } from 'next/server'
import { z } from 'zod'
import { coerceCity, isSupportedCity, type City } from '@/lib/constants'

/**
 * Resolve the serviceable city for a request.
 *
 * Priority: an explicit, supported `city` query/body value wins; otherwise we
 * auto-detect from the Vercel edge header (`x-vercel-ip-city`); anything
 * unknown falls back to the default city. There is no city-selector UI in v1,
 * so detection + coercion is the only path that reaches the data layer.
 */
export function resolveCity(request: Request, explicit?: string | null): City {
  if (explicit) {
    const slug = explicit.trim().toLowerCase()
    if (isSupportedCity(slug)) return slug
  }
  const header = request.headers.get('x-vercel-ip-city')
  return coerceCity(header ? safeDecode(header) : undefined)
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Zod schema for a city field on a request body — always coerces to a supported city. */
export const citySchema = z
  .string()
  .optional()
  .transform((value) => coerceCity(value))

/* ── Standard error responses ── */

export function invalidParams(issues: z.ZodIssue[]): NextResponse {
  return NextResponse.json({ error: 'invalid_params', issues }, { status: 400 })
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

export function serviceRoleMissing(): NextResponse {
  return NextResponse.json(
    {
      error: 'service_role_not_configured',
      message: 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local',
    },
    { status: 503 },
  )
}

export function scraperUnavailable(): NextResponse {
  return NextResponse.json(
    {
      error: 'scraper_unavailable',
      message: 'Live price comparison is temporarily unavailable.',
    },
    { status: 503 },
  )
}
