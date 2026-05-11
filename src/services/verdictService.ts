import type { HistoryPoint, Verdict } from '@/types'

export function computeVerdict(history: HistoryPoint[]): Verdict {
  if (history.length < 7) {
    return gptFallback(history)
  }

  const prices  = history.map((h) => h.price)
  const current = prices[prices.length - 1]
  const min90   = Math.min(...prices)
  const avg90   = prices.reduce((a, b) => a + b, 0) / prices.length
  const recent7 = prices.slice(-7)
  const trend   = recent7[6] - recent7[0]  // positive = rising, negative = falling

  const vsMin = (current - min90) / min90   // 0 = at 90d low
  const vsAvg = (current - avg90) / avg90   // negative = below avg

  if (vsMin <= 0.03 && vsAvg <= -0.05) {
    return { action: 'buy', confidence: 0.9, reason: 'Near 90-day low and below average price' }
  }
  if (vsMin <= 0.10 && trend < 0) {
    return { action: 'buy', confidence: 0.75, reason: 'Close to 90-day low with downward trend' }
  }
  if (vsMin > 0.15 && trend > 0) {
    return { action: 'wait', confidence: 0.8, reason: 'Price is above average and trending up' }
  }

  const confidence = 0.45
  if (confidence < 0.5) return gptFallback(history)

  return { action: 'buy', confidence: 0.55, reason: 'Price is near historical average' }
}

function gptFallback(history: HistoryPoint[]): Verdict {
  if (!process.env.OPENAI_API_KEY || history.length === 0) {
    return { action: 'buy', confidence: 0.5, reason: 'Insufficient history — check manually' }
  }

  // Dynamic import at runtime to avoid bundling openai into the edge runtime
  return runGptFallback(history)
}

function runGptFallback(history: HistoryPoint[]): Verdict {
  // Synchronous stub: async GPT call resolved at call site (compare route) if needed
  // For now, return a neutral verdict; the route can await a separate async path
  void history
  return { action: 'buy', confidence: 0.5, reason: 'Insufficient price history' }
}

export const verdictService = { computeVerdict }
