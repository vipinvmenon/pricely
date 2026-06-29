import { scraperClient } from '@/lib/scraper/client'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import { shouldUseMockData } from '@/lib/runtime/mockMode'
import { platformName, SUPPORTED_PLATFORM_IDS } from '@/lib/utils/platforms'
import type { PriceResult, ScrapeResult } from '@/types'

const ALL_PLATFORMS = SUPPORTED_PLATFORM_IDS

const MOCK_SEARCH_RESULTS: PriceResult[] = [
  { platformId: 'amazon',   platformName: 'Amazon',   category: 'electronics', price: 23450, mrp: 29990, updatedAt: new Date().toISOString(), url: '#' },
  { platformId: 'flipkart', platformName: 'Flipkart', category: 'electronics', price: 24499, mrp: 29990, updatedAt: new Date().toISOString(), url: '#' },
  { platformId: 'croma',    platformName: 'Croma',    category: 'electronics', price: 25990, mrp: 29990, updatedAt: new Date().toISOString(), url: '#' },
]

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
      })
    }
  }
  return [...seen.values()].sort((a, b) => a.price - b.price)
}

export async function search(
  query: string,
  city: string,
): Promise<PriceResult[]> {
  if (shouldUseMockData() || !process.env.SCRAPER_SERVICE_URL) return MOCK_SEARCH_RESULTS

  const cacheKey = keys.search(query, city)
  const cached = await cacheGet<PriceResult[]>(cacheKey)
  if (cached) return cached

  const { results } = await scraperClient.scrape({ query, platforms: ALL_PLATFORMS, city, maxResults: 3 })
  const ranked = normaliseAndRank(results)

  await cacheSetex(cacheKey, TTL.search, ranked)
  return ranked
}

export const searchService = { search }
