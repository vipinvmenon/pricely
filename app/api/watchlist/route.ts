import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cacheDel, cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import type { WatchlistPageItem } from '@/types'

const MOCK_WATCHLIST: WatchlistPageItem[] = [
  {
    id: '1', initials: 'SW', name: 'Sony WH-1000XM5',    subtitle: 'Amazon · Headphones',
    target: 22000, now: 23450, mrp: 29990, vsTarget: 7,
    trend: [27000, 26200, 25100, 24800, 24200, 23800, 23450], status: 'Watching',
  },
  {
    id: '2', initials: 'AI', name: 'Apple iPad Air 11"', subtitle: 'Flipkart · Tablets',
    target: 55000, now: 58999, mrp: 64900, vsTarget: 7,
    trend: [64900, 63000, 61500, 60000, 59500, 59000, 58999], status: 'Watching',
  },
  {
    id: '3', initials: 'DV', name: 'Dyson V12 Detect Slim', subtitle: 'Amazon · Vacuum',
    target: 42000, now: 44990, mrp: 52900, vsTarget: 7,
    trend: [52900, 50000, 48000, 47000, 46000, 45500, 44990], status: 'Holding',
  },
  {
    id: '4', initials: 'AN', name: 'Asics Novablast 4', subtitle: 'Flipkart · Running Shoes',
    target: 8500, now: 8249, mrp: 12999, vsTarget: -3,
    trend: [12999, 11000, 10000, 9500, 9000, 8500, 8249], status: 'Target hit',
  },
  {
    id: '5', initials: 'BQ', name: 'Bose QC Ultra',     subtitle: 'Croma · Headphones',
    target: 30000, now: 32490, mrp: 37990, vsTarget: 8,
    trend: [37990, 36000, 35000, 34000, 33500, 33000, 32490], status: 'Watching',
  },
]

const PostBodySchema = z.object({
  productId: z.string().min(1),
  city:      z.string().min(1).default('mumbai'),
})

const DeleteQuerySchema = z.object({
  id: z.string().uuid(),
})

export async function GET() {
  const start = Date.now()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const response = NextResponse.json(MOCK_WATCHLIST)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const cacheKey = keys.watchlist(user.id)
  const cached = await cacheGet<WatchlistPageItem[]>(cacheKey)
  if (cached) {
    const response = NextResponse.json(cached)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  const { watchlistService } = await import('@/services/watchlistService')
  const items = await watchlistService.getWatchlist(user.id)
  await cacheSetex(cacheKey, TTL.watchlist, items)

  const response = NextResponse.json(items)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}

export async function POST(request: Request) {
  const start = Date.now()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = PostBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { watchlistService } = await import('@/services/watchlistService')
  const result = await watchlistService.addToWatchlist(user.id, parsed.data.productId, parsed.data.city)
  await cacheDel(keys.watchlist(user.id))

  const response = NextResponse.json(result, { status: 201 })
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}

export async function DELETE(request: Request) {
  const start = Date.now()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = DeleteQuerySchema.safeParse({ id: searchParams.get('id') })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { watchlistService } = await import('@/services/watchlistService')
  await watchlistService.removeFromWatchlist(parsed.data.id, user.id)
  await cacheDel(keys.watchlist(user.id))

  const response = NextResponse.json({ success: true })
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
