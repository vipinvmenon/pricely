import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import type { TrendingItem } from '@/types'

const QuerySchema = z.object({
  city: z.string().default('mumbai'),
})

const MOCK_TRENDING: TrendingItem[] = [
  { id: '1', query: 'Milk 1L Amul',           category: 'grocery' },
  { id: '2', query: 'Bread Brown 400g',        category: 'grocery' },
  { id: '3', query: 'Sony WH-1000XM5',         category: 'electronics' },
  { id: '4', query: 'iPhone 15 128GB',         category: 'electronics' },
  { id: '5', query: 'Dyson V12 Detect Slim',   category: 'electronics' },
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

  // Supabase query: top-10 most-watched products by watchlist count in city
  // Falls back to mock until Supabase is configured
  const items = MOCK_TRENDING
  await cacheSetex(cacheKey, TTL.trending, items)

  const response = NextResponse.json(items)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
