import { createServiceClient } from '@/lib/supabase/server'
import type { TrendingItem } from '@/types'

type TrendingRow = {
  product_id: string
  products: {
    title: string
    category: string
    search_query: string | null
  } | null
}

const TRENDING_LIMIT = 10

function mapRow(row: TrendingRow): TrendingItem | null {
  const product = row.products
  if (!product) return null

  const query = product.search_query?.trim() || product.title.trim()
  if (!query) return null

  return {
    id:       row.product_id,
    query,
    category: product.category,
  }
}

export async function getTrending(city: string): Promise<TrendingItem[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return []
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('watchlist')
    .select('product_id, products(title, category, search_query)')
    .eq('city', city)

  if (error || !data?.length) return []

  const counts = new Map<string, { row: TrendingRow; count: number }>()

  for (const entry of data as unknown as TrendingRow[]) {
    const existing = counts.get(entry.product_id)
    if (existing) {
      existing.count += 1
    } else {
      counts.set(entry.product_id, { row: entry, count: 1 })
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, TRENDING_LIMIT)
    .map(({ row }) => mapRow(row))
    .filter((item): item is TrendingItem => item !== null)
}

export const trendingService = { getTrending }
