import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import type { TrendingItem } from '@/types'

const QuerySchema = z.object({
  city: z.string().default('mumbai'),
})

const MOCK_TRENDING: TrendingItem[] = [
  { id: 'sony-wh-1000xm5',           query: 'Sony WH-1000XM5',       category: 'electronics' },
  { id: 'iphone-15-128gb',           query: 'iPhone 15 128GB',       category: 'electronics' },
  { id: 'dyson-v12-detect-slim',     query: 'Dyson V12 Detect Slim', category: 'electronics' },
  { id: 'asics-novablast-4',         query: 'Asics Novablast 4',     category: 'electronics' },
  { id: 'bose-qc-ultra',             query: 'Bose QC Ultra',         category: 'electronics' },
]

export async function GET(request: Request) {
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({ city: searchParams.get('city') ?? undefined })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { city } = parsed.data

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const response = NextResponse.json(MOCK_TRENDING)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  const cacheKey = keys.trending(city)
  const cached = await cacheGet<TrendingItem[]>(cacheKey)
  if (cached) {
    const response = NextResponse.json(cached)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  const { trendingService } = await import('@/services/trendingService')
  const items = await trendingService.getTrending(city)
  const result = items.length > 0 ? items : MOCK_TRENDING

  await cacheSetex(cacheKey, TTL.trending, result)

  const response = NextResponse.json(result)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
