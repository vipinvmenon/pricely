'use client'

import { useEffect } from 'react'
import { useSWRConfig } from 'swr'

const LS_KEY = 'pricely_pending_watchlist'

export interface PendingWatchlistItem {
  productId: string
  city: string
}

export function addPendingWatchlistItem(item: PendingWatchlistItem): void {
  if (typeof window === 'undefined') return
  const existing = getPendingWatchlistItems()
  const deduped = existing.filter(i => !(i.productId === item.productId && i.city === item.city))
  localStorage.setItem(LS_KEY, JSON.stringify([...deduped, item]))
}

export function getPendingWatchlistItems(): PendingWatchlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as PendingWatchlistItem[]
  } catch {
    return []
  }
}

function clearPendingWatchlistItems(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_KEY)
}

/**
 * On mount, if the user is authenticated and there are pending watchlist items
 * in localStorage, flush them to the server and then revalidate the watchlist cache.
 */
export function usePendingWatchlist(isAuthenticated: boolean): void {
  const { mutate } = useSWRConfig()

  useEffect(() => {
    if (!isAuthenticated) return

    const pending = getPendingWatchlistItems()
    if (pending.length === 0) return

    async function flush() {
      await Promise.allSettled(
        pending.map(item =>
          fetch('/api/watchlist', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(item),
          }),
        ),
      )
      clearPendingWatchlistItems()
      await mutate('/api/watchlist')
    }

    void flush()
  }, [isAuthenticated, mutate])
}
