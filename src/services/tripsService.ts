import { scraperClient } from '@/lib/scraper/client'
import { redis } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import type { TripsResponse, PlatformId } from '@/types'

const CAB_PLATFORMS: PlatformId[] = ['blusmart', 'rapido', 'uber', 'ola']

function mockFareHistory() {
  const labels = ['-5h', '-4h', '-3h', '-2h', '-1h', 'Now']
  return labels.map((label, i) => ({
    label,
    blusmart: 480 + Math.round((Math.random() - 0.5) * 60) + i * 5,
    rapido:   560 + Math.round((Math.random() - 0.5) * 80) + i * 8,
    uber:     680 + Math.round((Math.random() - 0.5) * 100) + i * 12,
    ola:      720 + Math.round((Math.random() - 0.5) * 100) + i * 10,
  }))
}

export async function getFares(from: string, to: string, city: string): Promise<TripsResponse> {
  const cacheKey = keys.trips(from, to, city)
  const cached = await redis.get<TripsResponse>(cacheKey).catch(() => null)
  if (cached) return cached

  const { results, errors } = await scraperClient.scrapeCabs({
    from, to, platforms: CAB_PLATFORMS,
  })

  const fares = results
    .sort((a, b) => a.price - b.price)
    .map((r, i) => ({
      id:              r.platformId,
      name:            r.platformId,
      isLowest:        i === 0,
      price:           r.price,
      eta:             r.eta,
      surgeMultiplier: r.surgeMultiplier,
      bookUrl:         r.bookUrl,
    }))

  const response: TripsResponse = {
    fares,
    fareHistory: mockFareHistory(),
    errors,
  }

  await redis.setex(cacheKey, TTL.trips, response).catch(() => null)
  return response
}

export const tripsService = { getFares }
