'use client'

import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { trackEvent } from '@/lib/analytics/track'
import { fetchJson } from '@/lib/utils/fetchJson'

const LS_KEY = 'pricely_pending_alert'

export type PendingAlertItem = {
  productId: string
  city: string
  targetPrice: number
  title?: string
  category?: string
  subtitle?: string
  imageUrl?: string
  searchQuery?: string
}

export function addPendingAlert(item: PendingAlertItem): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(item))
  trackEvent('alert_journey_pending', {
    productId: item.productId,
    city: item.city,
  })
}

export function getPendingAlert(): PendingAlertItem | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as PendingAlertItem) : null
  } catch {
    return null
  }
}

function clearPendingAlert(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_KEY)
}

/** Flush a buffered alert after the user signs in. */
export function usePendingAlert(isAuthenticated: boolean): void {
  const { mutate } = useSWRConfig()

  useEffect(() => {
    if (!isAuthenticated) return

    const pending = getPendingAlert()
    if (!pending) return

    const snapshot = pending

    async function flush() {
      try {
        await fetchJson('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(snapshot),
        })
        clearPendingAlert()
        await mutate('/api/alerts')
        trackEvent('alert_journey_flushed', {
          productId: snapshot.productId,
          city: snapshot.city,
        })
      } catch {
        trackEvent('alert_journey_failed', {
          productId: snapshot.productId,
          city: snapshot.city,
        })
      }
    }

    void flush()
  }, [isAuthenticated, mutate])
}
