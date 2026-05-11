import { scraperClient } from '@/lib/scraper/client'
import { redis } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import { priceHistoryService } from './priceHistoryService'
import type { CompareResponse, PlatformId } from '@/types'

const RETAIL_PLATFORMS: PlatformId[] = [
  'amazon', 'flipkart', 'croma', 'reliance_digital',
  'vijay_sales', 'tata_cliq', 'myntra',
]

export async function compare(query: string, city: string): Promise<CompareResponse> {
  const cacheKey = keys.compare(query, city)
  const cached = await redis.get<CompareResponse>(cacheKey).catch(() => null)
  if (cached) return cached

  const { results, errors } = await scraperClient.scrape({
    query, platforms: RETAIL_PLATFORMS, city, maxResults: 1,
  })

  const retailers = results
    .sort((a, b) => a.price - b.price)
    .map((r, i) => ({
      rank:     i + 1,
      name:     r.title,
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

  await redis.setex(cacheKey, TTL.compare, response).catch(() => null)
  return response
}

export const compareService = { compare }
