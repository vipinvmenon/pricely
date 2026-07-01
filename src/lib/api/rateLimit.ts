import { NextResponse } from 'next/server'
import { rateLimitConsume } from '@/lib/redis/client'
import { keys } from '@/lib/redis/keys'

const COMPARE_LIMIT = 30
const COMPARE_WINDOW_SECONDS = 3_600

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function enforceCompareRateLimit(
  request: Request,
): Promise<NextResponse | null> {
  const ip = getClientIp(request)
  const { allowed, remaining } = await rateLimitConsume(
    keys.rateLimitCompare(ip),
    COMPARE_LIMIT,
    COMPARE_WINDOW_SECONDS,
  )

  if (allowed) return null

  return NextResponse.json(
    {
      error: 'rate_limit_exceeded',
      message: 'Too many comparison requests. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(COMPARE_WINDOW_SECONDS),
        'X-RateLimit-Remaining': String(remaining),
      },
    },
  )
}
