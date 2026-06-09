import { scraperClient } from '@/lib/scraper/client'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import { bestProductTitle, pickBestPerPlatform } from '@/lib/utils/productMatch'
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
    query, platforms: RETAIL_PLATFORMS, city, maxResults: 5,
  })

  const matched = pickBestPerPlatform(results, query)
    .sort((a, b) => a.price - b.price)

  const pricedRetailers = matched.map((r, i) => ({
    rank:      i + 1,
    name:      PLATFORMS[r.platformId]?.name ?? String(r.platformId),
    isLowest:  i === 0,
    available: true,
    price:     r.price,
    mrp:       r.mrp,
    delivery:  r.delivery ?? '',
    returns:   r.returns ?? '',
    stock:     r.stock,
    buyUrl:    r.url,
  }))

  const matchedIds = new Set(matched.map(r => r.platformId))
  const unlistedRetailers = RETAIL_PLATFORMS
    .filter(id => !matchedIds.has(id))
    .map((id, i) => ({
      rank:      pricedRetailers.length + i + 1,
      name:      PLATFORMS[id]?.name ?? String(id),
      isLowest:  false,
      available: false,
      price:     0,
      delivery:  '—',
      returns:   '—',
      stock:     'not_listed',
      buyUrl:    '',
    }))

  const retailers = [...pricedRetailers, ...unlistedRetailers]

  await priceHistoryService.writePricePoints(
    matched.map((r) => ({
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
      name:     bestProductTitle(matched, query),
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
