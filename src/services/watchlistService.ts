import { createClient } from '@/lib/supabase/server'
import type { WatchlistPageItem } from '@/types'

function mapToPageItems(
  data: Array<{
    id: string
    product_id: string
    city: string
    products: { title: string; category: string; subtitle: string | null } | null
  }>,
): WatchlistPageItem[] {
  return data.map((row) => ({
    id:       row.id,
    initials: row.products?.title.slice(0, 2).toUpperCase() ?? '??',
    name:     row.products?.title ?? row.product_id,
    subtitle: row.products?.subtitle ?? row.products?.category ?? '',
    target:   0,
    now:      0,
    vsTarget: 0,
    trend:    [],
    status:   'Watching' as const,
  }))
}

export async function getWatchlist(userId: string): Promise<WatchlistPageItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('watchlist')
    .select('id, product_id, city, products(title, category, subtitle)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  type Row = { id: string; product_id: string; city: string; products: { title: string; category: string; subtitle: string | null } | null }
  return mapToPageItems((data ?? []) as unknown as Row[])
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

export const watchlistService = { getWatchlist, addToWatchlist, removeFromWatchlist }
