import { scraperClient } from '@/lib/scraper/client'
import { buildSearchMockResults } from '@/lib/mock/buildSearchMock'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import {
  canServeMockData,
  isScraperConfigured,
  ScraperNotConfiguredError,
} from '@/lib/runtime/mockMode'
import { platformName, SUPPORTED_PLATFORM_IDS } from '@/lib/utils/platforms'
import type { PriceResult, ScrapeResult } from '@/types'

const ALL_PLATFORMS = SUPPORTED_PLATFORM_IDS

function normaliseAndRank(raw: ScrapeResult[]): PriceResult[] {
  const seen = new Map<string, PriceResult>()
  for (const r of raw) {
    const key = r.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    const existing = seen.get(key)
    if (!existing || r.price < existing.price) {
      seen.set(key, {
        platformId:   r.platformId,
        platformName: platformName(r.platformId),
        category:     'electronics',
        price:        r.price,
        mrp:          r.mrp,
        updatedAt:    r.scrapedAt,
        url:          r.url,
        title:        r.title,
      })
    }
  }
  return [...seen.values()].sort((a, b) => a.price - b.price)
}

export async function search(
  query: string,
  city: string,
): Promise<PriceResult[]> {
  if (!isScraperConfigured() && !canServeMockData()) {
    throw new ScraperNotConfiguredError()
  }

  if (canServeMockData()) {
    return buildSearchMockResults(query)
  }

  const cacheKey = keys.search(query, city)
  const cached = await cacheGet<PriceResult[]>(cacheKey)
  if (cached) return cached

  const { results } = await scraperClient.scrape({ query, platforms: ALL_PLATFORMS, city, maxResults: 3 })
  const ranked = normaliseAndRank(results)

  await cacheSetex(cacheKey, TTL.search, ranked)
  return ranked
}

export const searchService = { search }
