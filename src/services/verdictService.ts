import type { HistoryPoint, Verdict } from '@/types'

export async function computeVerdict(history: HistoryPoint[]): Promise<Verdict> {
  if (history.length < 7) {
    return gptFallback(history)
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

async function gptFallback(history: HistoryPoint[]): Promise<Verdict> {
  if (!process.env.OPENAI_API_KEY || history.length === 0) {
    return { action: 'buy', confidence: 0.5, reason: 'Insufficient history — check manually' }
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
      return parsed as Verdict
    }
  } catch {
    // Fallthrough to default verdict below
  }

  return { action: 'buy', confidence: 0.5, reason: 'Insufficient price history' }
}

export const verdictService = { computeVerdict }
