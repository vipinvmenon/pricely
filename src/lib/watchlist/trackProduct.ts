import { addPendingWatchlistItem } from '@/lib/hooks/usePendingWatchlist'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { fetchJson } from '@/lib/utils/fetchJson'
export type TrackProductPayload = {
  productId: string
  city: string
  title?: string
  category?: string
  subtitle?: string
  imageUrl?: string
}

export async function trackProduct(
  payload: TrackProductPayload,
  isAuthenticated: boolean,
): Promise<'synced' | 'pending'> {
  const item = {
    productId: payload.productId,
    city:      payload.city,
    title:     payload.title,
    category:  payload.category,
    subtitle:  payload.subtitle,
    imageUrl:  payload.imageUrl,
  }

  if (!isSupabaseConfigured()) {
    addPendingWatchlistItem(item)
    return 'pending'
  }

  if (isAuthenticated) {
    await fetchJson('/api/watchlist', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(item),
    })
    return 'synced'
  }

  addPendingWatchlistItem(item)
  return 'pending'
}
