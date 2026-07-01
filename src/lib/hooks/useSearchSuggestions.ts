'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { useCity } from '@/lib/hooks/useCity'
import { useRecentSearches } from '@/lib/hooks/useRecentSearches'
import { fetchJson } from '@/lib/utils/fetchJson'
import { normalizeQuery } from '@/lib/utils/format'
import type { PriceResult } from '@/types'

const TRENDING_FALLBACK = [
  'iPhone 16',
  'Sony WH-1000XM5',
  'MacBook Air M3',
  'Dyson V12',
  'Nike Pegasus 41',
]

export function useSearchSuggestions(query: string): string[] {
  const { recent, filterRecent } = useRecentSearches()
  const { city, ready: cityReady } = useCity()
  const trimmed = query.trim()
  const shouldFetch = trimmed.length >= 2 && cityReady

  const { data: remote } = useSWR<PriceResult[]>(
    shouldFetch ? `/api/search?q=${encodeURIComponent(trimmed)}&city=${encodeURIComponent(city)}` : null,
    (url: string) => fetchJson<PriceResult[]>(url),
    { dedupingInterval: 60_000, revalidateOnFocus: false },
  )

  const [trending, setTrending] = useState<string[]>(TRENDING_FALLBACK)

  useEffect(() => {
    if (!cityReady) return
    void fetchJson<Array<{ query: string }>>(`/api/trending?city=${encodeURIComponent(city)}`)
      .then((items) => {
        const labels = items
          .map((item) => item.query)
          .filter((label) => normalizeQuery(label))
        if (labels.length > 0) setTrending(labels)
      })
      .catch(() => {
        // Keep local fallback chips.
      })
  }, [city, cityReady])

  return useMemo(() => {
    const local = filterRecent(trimmed)
    const remoteTitles = (remote ?? [])
      .map((item) => item.title?.trim())
      .filter((title): title is string => Boolean(title))

    const pool = trimmed
      ? [...local, ...remoteTitles, ...trending.filter((item) => item.toLowerCase().includes(trimmed.toLowerCase()))]
      : [...recent, ...trending]

    const seen = new Set<string>()
    const unique: string[] = []
    for (const item of pool) {
      const normalized = normalizeQuery(item)
      if (!normalized || seen.has(normalized)) continue
      seen.add(normalized)
      unique.push(normalized)
      if (unique.length >= 6) break
    }
    return unique
  }, [filterRecent, recent, remote, trending, trimmed])
}
