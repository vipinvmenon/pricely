import type { HistoryPoint, Verdict } from '@/types'

/**
 * Minimum number of price points before the rule engine is allowed to make a
 * confident call. Below this we only emit cautious, low-confidence signals so
 * we never tell someone to "buy" with high confidence off a few data points.
 */
const MIN_POINTS_FOR_CONFIDENT = 14

/** Confidence ceiling for the ambiguous GPT / no-signal fallback. */
const FALLBACK_CONFIDENCE_CAP = 0.7

export async function computeVerdict(history: HistoryPoint[]): Promise<Verdict> {
  if (history.length === 0) {
    return {
      action: 'wait',
      confidence: 0.2,
      reason: 'No price history yet — not enough data to make a call.',
    }
  }

  if (history.length < MIN_POINTS_FOR_CONFIDENT) {
    return sparseVerdict(history)
  }

  const prices  = history.map((h) => h.price)
  const current = prices[prices.length - 1]
  const min90   = Math.min(...prices)
  const avg90   = prices.reduce((a, b) => a + b, 0) / prices.length
  const recent7 = prices.slice(-7)
  const trend   = recent7[recent7.length - 1] - recent7[0]

  const vsMin = (current - min90) / min90
  const vsAvg = (current - avg90) / avg90

  if (vsMin <= 0.03 && vsAvg <= -0.05) {
    return { action: 'buy', confidence: 0.9, reason: 'Near 90-day low and below average price' }
  }
  if (vsMin <= 0.10 && trend < 0) {
    return { action: 'buy', confidence: 0.75, reason: 'Close to 90-day low with downward trend' }
  }
  if (vsMin > 0.15 && trend > 0) {
    return { action: 'wait', confidence: 0.8, reason: 'Price is above average and trending up' }
  }

  return gptFallback(history)
}

/**
 * Cautious signal for thin history. Confidence is intentionally capped low and
 * the reason is transparent about how little data we have.
 */
function sparseVerdict(history: HistoryPoint[]): Verdict {
  const prices  = history.map((h) => h.price)
  const current = prices[prices.length - 1]
  const min     = Math.min(...prices)
  const vsMin   = min > 0 ? (current - min) / min : 0
  const days    = history.length

  if (vsMin <= 0.02) {
    return {
      action: 'buy',
      confidence: 0.4,
      reason: `Lowest in the ${days} days we've tracked, but that's a short window — treat this as a soft signal.`,
    }
  }
  return {
    action: 'wait',
    confidence: 0.3,
    reason: `Only ${days} days of price history so far — not enough to confidently say buy.`,
  }
}

async function gptFallback(history: HistoryPoint[]): Promise<Verdict> {
  // No key, or nothing to reason about: return an honest, low-confidence verdict.
  if (!process.env.OPENAI_API_KEY?.trim() || history.length === 0) {
    return {
      action: 'wait',
      confidence: 0.3,
      reason: 'No strong buy-or-wait signal from recent prices.',
    }
  }

  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = `You are a price analysis assistant for Indian e-commerce.
Given this price history (date, price in INR):
${JSON.stringify(history.slice(-30))}

Return a JSON object with exactly these fields:
{ "action": "buy" or "wait", "confidence": number 0-1, "reason": string max 80 chars }

Rules:
- "buy" if current price is at or near the historical low
- "wait" if price is elevated and likely to drop
- confidence reflects signal clarity
- reason must be concise and consumer-friendly`.trim()

    const completion = await client.chat.completions.create({
      model:           'gpt-4o-mini',
      messages:        [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens:      120,
    })

    const parsed = JSON.parse(completion.choices[0].message.content ?? '{}') as Partial<Verdict>
    if (
      (parsed.action === 'buy' || parsed.action === 'wait') &&
      typeof parsed.confidence === 'number' &&
      typeof parsed.reason === 'string'
    ) {
      // Rules already failed to find a clear signal, so cap GPT confidence.
      return {
        action: parsed.action,
        confidence: Math.max(0, Math.min(parsed.confidence, FALLBACK_CONFIDENCE_CAP)),
        reason: parsed.reason,
      }
    }
  } catch {
    // Fallthrough to default verdict below
  }

  return {
    action: 'wait',
    confidence: 0.3,
    reason: 'No strong buy-or-wait signal from recent prices.',
  }
}

export const verdictService = { computeVerdict }
