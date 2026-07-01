import { normalizeQuery } from '@/lib/utils/format'
import { platformName, SUPPORTED_PLATFORM_IDS } from '@/lib/utils/platforms'
import type { PlatformId, PriceResult } from '@/types'
import { deterministicInt } from './deterministic'

const DEMO_PLATFORMS = SUPPORTED_PLATFORM_IDS.slice(0, 3)

/** Deterministic search suggestions for local demo mode — varies by query. */
export function buildSearchMockResults(rawQuery: string): PriceResult[] {
  const query = normalizeQuery(rawQuery)
  const basePrice = deterministicInt(query, 12_000, 55_000, 'search-base')
  const updatedAt = new Date().toISOString()

  return DEMO_PLATFORMS.map((platformId: PlatformId, index) => {
    const price = basePrice + index * 900 + deterministicInt(query, 0, 400, platformId)
    const mrp = Math.round(price * 1.18)

    return {
      platformId,
      platformName: platformName(platformId),
      category: 'electronics',
      price,
      mrp,
      updatedAt,
      url: '#demo-price',
      title: query,
    }
  }).sort((a, b) => a.price - b.price)
}
