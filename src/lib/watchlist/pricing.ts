import type { CompareResponse, HistoryPoint, WatchlistPageItem } from '@/types'

const TREND_POINTS = 7
const DROP_THRESHOLD_PCT = 3

function lowestAvailablePrice(compare: CompareResponse): number {
  const priced = compare.retailers.filter((r) => r.available !== false && r.price > 0)
  return priced[0]?.price ?? compare.retailers.find((r) => r.price > 0)?.price ?? 0
}

function highestMrp(compare: CompareResponse, now: number): number | undefined {
  const mrps = compare.retailers
    .map((r) => r.mrp)
    .filter((mrp): mrp is number => typeof mrp === 'number' && mrp > 0)
  if (mrps.length === 0) return undefined
  return Math.max(...mrps, now)
}

function buildTrend(history: HistoryPoint[], now: number): number[] {
  const prices = history.map((point) => point.price)
  if (prices.length === 0) return now > 0 ? [now] : []

  const recent = prices.slice(-TREND_POINTS)
  if (recent[recent.length - 1] !== now && now > 0) {
    recent.push(now)
  }
  return recent.slice(-TREND_POINTS)
}

function defaultTarget(compare: CompareResponse, now: number): number {
  const historyHigh = compare.history.reduce((max, point) => Math.max(max, point.price), 0)
  const mrp = highestMrp(compare, now) ?? 0
  const peak = Math.max(historyHigh, mrp, now)
  if (peak <= 0) return 0
  return Math.round(peak * 0.95)
}

function deriveStatus(now: number, target: number, trend: number[]): WatchlistPageItem['status'] {
  if (target > 0 && now > 0 && now <= target) return 'Target hit'

  if (trend.length >= 2) {
    const previous = trend[trend.length - 2]
    if (previous > 0) {
      const dropPct = ((previous - now) / previous) * 100
      if (dropPct >= DROP_THRESHOLD_PCT) return 'Just dropped'
    }
  }

  if (trend.length >= 2) {
    const oldest = trend[0]
    if (now >= oldest) return 'Holding'
  }

  return 'Watching'
}

function deriveVsTarget(now: number, target: number): number {
  if (target <= 0 || now <= 0) return 0
  return Math.round(((now - target) / target) * 100)
}

export function deriveWatchlistPricing(
  compare: CompareResponse,
  alertTarget?: number,
): Pick<WatchlistPageItem, 'target' | 'now' | 'mrp' | 'vsTarget' | 'trend' | 'status'> {
  const now = lowestAvailablePrice(compare)
  const target = alertTarget && alertTarget > 0 ? Math.round(alertTarget) : defaultTarget(compare, now)
  const trend = buildTrend(compare.history, now)
  const mrp = highestMrp(compare, now)

  return {
    target,
    now,
    mrp,
    vsTarget: deriveVsTarget(now, target),
    trend,
    status: deriveStatus(now, target, trend),
  }
}
