import { createServiceClient } from '@/lib/supabase/server'
import { isServiceRoleConfigured } from '@/lib/supabase/config'
import { logError } from '@/lib/observability/logger'
import type { HistoryPoint, PlatformId } from '@/types'

interface PricePoint {
  productId:  string
  platformId: PlatformId
  city:       string
  price:      number
}

export type PriceHistoryBundle = {
  /** One point per calendar day: lowest price recorded that day across retailers. */
  dailyLowest: HistoryPoint[]
  /** Per-retailer series preserved for transparency. */
  byPlatform: Partial<Record<PlatformId, HistoryPoint[]>>
  distinctDays: number
}

function aggregateHistory(
  rows: { price: number; recorded_at: string; platform_id: string }[],
): PriceHistoryBundle {
  const byPlatform: Partial<Record<PlatformId, HistoryPoint[]>> = {}
  const dailyByDate = new Map<string, number>()

  for (const row of rows) {
    const date = row.recorded_at.slice(0, 10)
    const price = row.price
    const platformId = row.platform_id as PlatformId
    const point: HistoryPoint = { date, price, platformId }

    const platformSeries = byPlatform[platformId] ?? []
    platformSeries.push(point)
    byPlatform[platformId] = platformSeries

    const currentMin = dailyByDate.get(date)
    if (currentMin === undefined || price < currentMin) {
      dailyByDate.set(date, price)
    }
  }

  const dailyLowest = [...dailyByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, price]) => ({ date, price }))

  return {
    dailyLowest,
    byPlatform,
    distinctDays: dailyByDate.size,
  }
}

export async function writePricePoints(points: PricePoint[]): Promise<void> {
  if (!isServiceRoleConfigured()) return
  const supabase = createServiceClient()

  for (const point of points) {
    const { data: last } = await supabase
      .from('price_history')
      .select('price, recorded_at')
      .eq('product_id', point.productId)
      .eq('platform_id', point.platformId)
      .eq('city', point.city)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
    if (last && (last as { price: number; recorded_at: string }).price === point.price
      && (last as { price: number; recorded_at: string }).recorded_at > oneHourAgo) {
      continue
    }

    const { error } = await supabase.from('price_history').insert({
      product_id:  point.productId,
      platform_id: point.platformId,
      city:        point.city,
      price:       point.price,
    })

    if (error) {
      logError('price_history_insert_failed', error, {
        productId: point.productId,
        platformId: point.platformId,
        city: point.city,
      })
      throw error
    }
  }
}

export async function getPriceHistory(
  productId: string,
  city: string,
  days: number,
): Promise<PriceHistoryBundle> {
  if (!isServiceRoleConfigured()) {
    return { dailyLowest: [], byPlatform: {}, distinctDays: 0 }
  }

  const supabase = createServiceClient()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()

  const { data, error } = await supabase
    .from('price_history')
    .select('price, recorded_at, platform_id')
    .eq('product_id', productId)
    .eq('city', city)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true })

  if (error) {
    logError('price_history_read_failed', error, { productId, city, days })
    throw error
  }

  return aggregateHistory(
    (data ?? []).map((row) => ({
      price: row.price as number,
      recorded_at: row.recorded_at as string,
      platform_id: row.platform_id as string,
    })),
  )
}

export const priceHistoryService = { writePricePoints, getPriceHistory }
