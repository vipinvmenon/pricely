import { scraperClient } from '@/lib/scraper/client'
import { cacheGet, cacheSetex } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import { normalizeQuery } from '@/lib/utils/format'
import { deriveProductId } from '@/lib/utils/productId'
import { bestProductTitle, pickBestPerPlatform } from '@/lib/utils/productMatch'
import { platformName, SUPPORTED_PLATFORM_IDS } from '@/lib/utils/platforms'
import { priceHistoryService } from './priceHistoryService'
import type { CompareResponse } from '@/types'

const RETAIL_PLATFORMS = SUPPORTED_PLATFORM_IDS

async function persistProduct(
  productId: string,
  title: string,
  searchQuery: string,
): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return

  const { productsService } = await import('./productsService')
  // Category is intentionally omitted: a fresh scrape can't reliably classify a
  // product, so we preserve any previously-stored category (or the DB default)
  // instead of forcing every product to "electronics".
  await productsService.upsertProduct({
    id:    productId,
    title,
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
    name:      platformName(r.platformId),
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
      name:      platformName(id),
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

  // We can't classify a product from a scrape, so reuse the stored category for
  // a known product and fall back to "unknown" rather than guessing.
  let category = 'unknown'
  if (stableProductId) {
    const { productsService } = await import('./productsService')
    const existing = await productsService.getProduct(stableProductId)
    if (existing?.category) category = existing.category
  }

  const response: CompareResponse = {
    product: {
      id:       productId,
      name:     title,
      brand:    '',
      category,
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

/**
 * Re-scrape for a stable product id (watchlist, alerts cron).
 *
 * Uses the stored search query; if that's missing it falls back to the stored
 * human-readable title. If neither is usable (e.g. an opaque hash id), it
 * returns a history-only result instead of scraping by the id, which would
 * pollute history with bad matches.
 */
export async function compareByProductId(productId: string, city: string): Promise<CompareResponse> {
  const { productsService } = await import('./productsService')
  const product = await productsService.getProduct(productId)

  const searchQuery = product?.searchQuery
  if (searchQuery) return compare(searchQuery, city, productId)

  const title = product?.title?.trim()
  if (title && title.toLowerCase() !== productId.toLowerCase()) {
    return compare(title, city, productId)
  }

  return compareFromHistory(productId, city, product)
}

/** Build a compare response from stored history only — no scrape. */
async function compareFromHistory(
  productId: string,
  city: string,
  product: { title: string | null; category: string | null } | null,
): Promise<CompareResponse> {
  const history = await priceHistoryService.getPriceHistory(productId, city, 90)
  return {
    product: {
      id:       productId,
      name:     product?.title ?? productId,
      brand:    '',
      category: product?.category ?? 'unknown',
    },
    retailers: [],
    history,
    errors: [],
  }
}

export const compareService = { compare, compareByProductId }
