import { scraperClient } from '@/lib/scraper/client'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import { PLATFORMS } from '@/lib/utils/platforms'
import { priceHistoryService } from './priceHistoryService'
import type { CompareResponse, PlatformId } from '@/types'

// Only platforms that reliably return data under headless scraping.
// croma (Akamai), myntra (HTTP/2 block), and vijay_sales (stale/degraded
// headless responses) are excluded until a stealth/proxy path is added.
const RETAIL_PLATFORMS: PlatformId[] = [
  'amazon', 'flipkart', 'reliance_digital', 'tata_cliq',
]

export async function compare(query: string, city: string): Promise<CompareResponse> {
  const cacheKey = keys.compare(query, city)
  const cached = await cacheGet<CompareResponse>(cacheKey)
  if (cached) return cached

  const { results, errors } = await scraperClient.scrape({
    query, platforms: RETAIL_PLATFORMS, city, maxResults: 1,
  })

  const retailers = results
    .sort((a, b) => a.price - b.price)
    .map((r, i) => ({
      rank:     i + 1,
      name:     PLATFORMS[r.platformId]?.name ?? String(r.platformId),
      isLowest: i === 0,
      price:    r.price,
      mrp:      r.mrp,
      delivery: r.delivery ?? '',
      returns:  r.returns ?? '',
      stock:    r.stock,
      buyUrl:   r.url,
    }))

  await priceHistoryService.writePricePoints(
    results.map((r) => ({
      productId:  query,
      platformId: r.platformId,
      city,
      price:      r.price,
    })),
  )

  const history = await priceHistoryService.getPriceHistory(query, city, 90)

  const response: CompareResponse = {
    product: {
      id:       query,
      name:     results[0]?.title ?? query,
      brand:    '',
      category: 'electronics',
    },
    retailers,
    history,
    errors,
  }

  await cacheSetex(cacheKey, TTL.compare, response)
  return response
}

export const compareService = { compare }
