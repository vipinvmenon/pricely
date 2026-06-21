import { scraperClient } from '@/lib/scraper/client'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import { normalizeQuery } from '@/lib/utils/format'
import { deriveProductId } from '@/lib/utils/productId'
import { bestProductTitle, pickBestPerPlatform } from '@/lib/utils/productMatch'
import { PLATFORMS } from '@/lib/utils/platforms'
import { priceHistoryService } from './priceHistoryService'
import type { CompareResponse, PlatformId } from '@/types'

const RETAIL_PLATFORMS: PlatformId[] = [
  'amazon',
  'flipkart',
  'croma',
  'reliance_digital',
  'vijay_sales',
  'tata_cliq',
  'myntra',
]

async function persistProduct(
  productId: string,
  title: string,
  searchQuery: string,
): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return

  const { productsService } = await import('./productsService')
  await productsService.upsertProduct({
    id:          productId,
    title,
    category:    'electronics',
    searchQuery,
  })
}

export async function compare(
  query: string,
  city: string,
  stableProductId?: string,
): Promise<CompareResponse> {
  const searchQuery = normalizeQuery(query)
  const queryCacheKey = keys.compareQuery(searchQuery, city)
  const cachedByQuery = await cacheGet<CompareResponse>(queryCacheKey)
  if (cachedByQuery) return cachedByQuery

  if (stableProductId) {
    const cachedById = await cacheGet<CompareResponse>(keys.compare(stableProductId, city))
    if (cachedById) return cachedById
  }

  const { results, errors } = await scraperClient.scrape({
    query: searchQuery, platforms: RETAIL_PLATFORMS, city, maxResults: 5,
  })

  const matched = pickBestPerPlatform(results, searchQuery)
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
  const title = bestProductTitle(matched, searchQuery)
  const productId = stableProductId ?? deriveProductId(title)

  await priceHistoryService.writePricePoints(
    matched.map((r) => ({
      productId,
      platformId: r.platformId,
      city,
      price:      r.price,
    })),
  )

  const history = await priceHistoryService.getPriceHistory(productId, city, 90)

  const response: CompareResponse = {
    product: {
      id:       productId,
      name:     title,
      brand:    '',
      category: 'electronics',
    },
    retailers,
    history,
    errors,
  }

  await persistProduct(productId, title, searchQuery)
  await cacheSetex(keys.compare(productId, city), TTL.compare, response)
  await cacheSetex(queryCacheKey, TTL.compare, response)
  return response
}

/** Re-scrape using the stored search query for a stable product id (watchlist, alerts cron). */
export async function compareByProductId(productId: string, city: string): Promise<CompareResponse> {
  const { productsService } = await import('./productsService')
  const searchQuery = await productsService.getSearchQuery(productId) ?? productId
  return compare(searchQuery, city, productId)
}

export const compareService = { compare, compareByProductId }
