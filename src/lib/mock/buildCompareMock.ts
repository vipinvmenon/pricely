import { normalizeQuery } from '@/lib/utils/format'
import { deriveProductId } from '@/lib/utils/productId'
import { platformName, SUPPORTED_PLATFORM_IDS } from '@/lib/utils/platforms'
import type { CompareResponse, HistoryPoint, PlatformId } from '@/types'
import { deterministicFloat, deterministicInt } from './deterministic'

const DEMO_PLATFORMS = SUPPORTED_PLATFORM_IDS.slice(0, 6)

function titleCaseQuery(query: string): string {
  return query
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function buildHistory(query: string): HistoryPoint[] {
  const base = deterministicInt(query, 15_000, 45_000, 'base')
  const history: HistoryPoint[] = []
  const now = new Date()

  for (let i = 89; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(day.getDate() - i)
    const noise = (deterministicFloat(query, `day-${i}`) - 0.5) * base * 0.12
    history.push({
      date: day.toISOString().slice(0, 10),
      price: Math.round(base + noise),
    })
  }

  history[history.length - 1].price = deterministicInt(
    query,
    Math.round(base * 0.78),
    Math.round(base * 0.92),
    'low',
  )

  return history
}

/** Deterministic compare payload for local demo mode — varies by search query. */
export function buildCompareMockResponse(rawQuery: string): CompareResponse {
  const query = normalizeQuery(rawQuery)
  const displayName = titleCaseQuery(query)
  const productId = deriveProductId(query)
  const basePrice = deterministicInt(query, 12_000, 55_000, 'price')

  const retailers = DEMO_PLATFORMS.map((platformId: PlatformId, index) => {
    const markup = deterministicInt(query, 0, 2_500, platformId)
    const price = basePrice + index * 800 + markup
    const mrp = Math.round(
      price * (1 + deterministicFloat(query, `mrp-${platformId}`) * 0.25),
    )

    return {
      rank: index + 1,
      name: platformName(platformId),
      isLowest: index === 0,
      available: true,
      price,
      mrp,
      delivery: index === 0 ? 'Free · 1 day' : `₹${99 + index * 50} · ${index + 1} days`,
      returns: '7 days',
      stock: index === 2 ? 'Low stock' : 'In stock',
      buyUrl: '#demo-price',
    }
  })
    .sort((a, b) => a.price - b.price)
    .map((row, index) => ({ ...row, rank: index + 1, isLowest: index === 0 }))

  return {
    product: {
      id: productId,
      name: displayName,
      brand: query.split(' ')[0] ?? '',
      category: 'electronics',
    },
    retailers,
    history: buildHistory(query),
    verdict: {
      action: 'wait',
      confidence: 0.35,
      reason: 'Demo data only — not based on live retailer prices.',
    },
    matchConfidence: 'high',
    isDemoData: true,
    fetchedAt: new Date().toISOString(),
  }
}
