import { createClient } from '@/lib/supabase/server'
import { shouldUseMockData } from '@/lib/runtime/mockMode'
import { deriveWatchlistPricing } from '@/lib/watchlist/pricing'
import type { CompareResponse, WatchlistPageItem } from '@/types'

const LIVE_ENRICH_CONCURRENCY = 2

type WatchlistDbRow = {
  id: string
  product_id: string
  city: string
  products: { title: string; category: string; subtitle: string | null } | null
}

function mapBaseItem(row: WatchlistDbRow): WatchlistPageItem {
  return {
    id:       row.id,
    initials: row.products?.title.slice(0, 2).toUpperCase() ?? '??',
    name:     row.products?.title ?? row.product_id,
    subtitle: row.products?.subtitle ?? row.products?.category ?? '',
    target:   0,
    now:      0,
    vsTarget: 0,
    trend:    [],
    status:   'Watching',
  }
}

function alertTargetKey(productId: string, city: string): string {
  return `${productId}:${city}`
}

async function getAlertTargetMap(userId: string): Promise<Map<string, number>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('alerts')
    .select('product_id, city, target_price')
    .eq('user_id', userId)
    .eq('is_active', true)

  const map = new Map<string, number>()
  for (const row of data ?? []) {
    const productId = (row as { product_id: string }).product_id
    const city = (row as { city: string }).city
    const target = Number((row as { target_price: number }).target_price)
    if (target > 0) {
      map.set(alertTargetKey(productId, city), target)
    }
  }
  return map
}

async function fetchCompareData(productId: string, city: string): Promise<CompareResponse | null> {
  if (!shouldUseMockData() && process.env.SCRAPER_SERVICE_URL) {
    try {
      const { compareService } = await import('@/services/compareService')
      return await compareService.compareByProductId(productId, city)
    } catch {
      // Fall back to stored history when the scraper is unavailable.
    }
  }

  try {
    const { priceHistoryService } = await import('@/services/priceHistoryService')
    const history = await priceHistoryService.getPriceHistory(productId, city, 90)
    if (history.length === 0) return null

    const now = history[history.length - 1].price
    return {
      product: {
        id:       productId,
        name:     productId,
        brand:    '',
        category: 'electronics',
      },
      retailers: [
        {
          rank:      1,
          name:      '—',
          isLowest:  true,
          available: true,
          price:     now,
          delivery:  '—',
          returns:   '—',
          stock:     'In stock',
          buyUrl:    '',
        },
      ],
      history,
    }
  } catch {
    return null
  }
}

function lowestRetailerSubtitle(compare: CompareResponse): string | undefined {
  const lowest = compare.retailers.find((r) => r.available !== false && r.price > 0)
  return lowest?.name
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return []

  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await fn(items[index], index)
    }
  }

  const workers = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: workers }, () => worker()))
  return results
}

async function enrichWatchlistRow(
  row: WatchlistDbRow,
  alertTargets: Map<string, number>,
): Promise<WatchlistPageItem> {
  const item = mapBaseItem(row)
  const compare = await fetchCompareData(row.product_id, row.city)
  if (!compare) return item

  const retailer = lowestRetailerSubtitle(compare)
  if (retailer) {
    const category = row.products?.category
    item.subtitle = category ? `${retailer} · ${category}` : retailer
  }

  if (compare.product.name && compare.product.name !== row.product_id) {
    item.name = compare.product.name
    item.initials = compare.product.name.slice(0, 2).toUpperCase()
  }

  const pricing = deriveWatchlistPricing(
    compare,
    alertTargets.get(alertTargetKey(row.product_id, row.city)),
  )

  return { ...item, ...pricing }
}

export async function getWatchlist(userId: string): Promise<WatchlistPageItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('watchlist')
    .select('id, product_id, city, products(title, category, subtitle)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return ((data ?? []) as unknown as WatchlistDbRow[]).map(mapBaseItem)
}

export async function getWatchlistWithLivePrices(userId: string): Promise<WatchlistPageItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('watchlist')
    .select('id, product_id, city, products(title, category, subtitle)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as unknown as WatchlistDbRow[]
  if (rows.length === 0) return []

  const alertTargets = await getAlertTargetMap(userId)

  return mapWithConcurrency(rows, LIVE_ENRICH_CONCURRENCY, (row) =>
    enrichWatchlistRow(row, alertTargets),
  )
}

export async function addToWatchlist(
  userId: string,
  productId: string,
  city: string,
): Promise<{ id: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('watchlist')
    .insert({ user_id: userId, product_id: productId, city })
    .select('id')
    .single()
  if (error) throw error
  return { id: (data as { id: string }).id }
}

export async function removeFromWatchlist(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('watchlist').delete().eq('id', id).eq('user_id', userId)
}

export const watchlistService = {
  getWatchlist,
  getWatchlistWithLivePrices,
  addToWatchlist,
  removeFromWatchlist,
}
