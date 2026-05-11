import { createClient } from '@/lib/supabase/server'
import type { HistoryPoint, PlatformId } from '@/types'

interface PricePoint {
  productId:  string
  platformId: PlatformId
  city:       string
  price:      number
}

export async function writePricePoints(points: PricePoint[]): Promise<void> {
  const supabase = await createClient()

  for (const point of points) {
    // Deduplication: skip if price unchanged within last hour
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
    if (last && last.price === point.price && last.recorded_at > oneHourAgo) {
      continue
    }

    await supabase.from('price_history').insert({
      product_id:  point.productId,
      platform_id: point.platformId,
      city:        point.city,
      price:       point.price,
    })
  }
}

export async function getPriceHistory(
  productId: string,
  city: string,
  days: number,
): Promise<HistoryPoint[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()

  const { data } = await supabase
    .from('price_history')
    .select('price, recorded_at')
    .eq('product_id', productId)
    .eq('city', city)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true })

  return (data ?? []).map((row) => ({
    date:  (row.recorded_at as string).slice(0, 10),
    price: row.price as number,
  }))
}

export const priceHistoryService = { writePricePoints, getPriceHistory }
