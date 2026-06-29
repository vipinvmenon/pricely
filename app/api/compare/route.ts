import { NextResponse } from 'next/server'
import { z } from 'zod'
import { invalidParams, resolveCity } from '@/lib/api/request'
import { shouldUseMockData } from '@/lib/runtime/mockMode'
import type { CompareResponse } from '@/types'

const QuerySchema = z.object({
  q: z.string().min(1).max(200),
})

function generateHistory() {
  const history = []
  const base = 27000
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const noise = (Math.random() - 0.5) * 6000
    history.push({ date: d.toISOString().slice(0, 10), price: Math.round(base + noise) })
  }
  history[history.length - 1].price = 23450
  return history
}

const MOCK_COMPARE_RESPONSE: CompareResponse = {
  product: {
    id:       'sony-wh-1000xm5',
    name:     'WH-1000XM5 Wireless Noise Cancelling',
    brand:    'Sony',
    category: 'Headphones',
  },
  retailers: [
    { rank: 1, name: 'Amazon',           isLowest: true, price: 23450, mrp: 29990, delivery: 'Free · 1 day',  returns: '7 days',  stock: 'In stock',  buyUrl: '#' },
    { rank: 2, name: 'Flipkart',                         price: 24499, mrp: 29990, delivery: 'Free · 2 days', returns: '7 days',  stock: 'In stock',  buyUrl: '#' },
    { rank: 3, name: 'Croma',                            price: 25990, mrp: 29990, delivery: '₹99 · 3 days',  returns: '10 days', stock: 'Low stock', buyUrl: '#' },
    { rank: 4, name: 'Reliance Digital',                 price: 26490, mrp: 29990, delivery: 'Free · 2 days', returns: '7 days',  stock: 'In stock',  buyUrl: '#' },
    { rank: 5, name: 'Vijay Sales',                      price: 27200, mrp: 29990, delivery: '₹149 · 4 days', returns: '7 days',  stock: 'In stock',  buyUrl: '#' },
    { rank: 6, name: 'Tata Cliq',                        price: 28000, mrp: 29990, delivery: 'Free · 3 days', returns: '15 days', stock: 'In stock',  buyUrl: '#' },
  ],
  history:  generateHistory(),
  verdict:  { action: 'buy', confidence: 0.9, reason: 'Near 90-day low and below average price' },
}

export async function GET(request: Request) {
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    q: searchParams.get('q') ?? undefined,
  })

  if (!parsed.success) {
    return invalidParams(parsed.error.issues)
  }

  if (shouldUseMockData() || !process.env.SCRAPER_SERVICE_URL) {
    const response = NextResponse.json(MOCK_COMPARE_RESPONSE)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  try {
    const { compareService } = await import('@/services/compareService')
    const { verdictService } = await import('@/services/verdictService')

    const city = resolveCity(request, searchParams.get('city'))
    const result = await compareService.compare(parsed.data.q, city)
    result.verdict = await verdictService.computeVerdict(result.history)

    const response = NextResponse.json(result)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    return response
  } catch {
    return NextResponse.json({ error: 'scraper_unavailable' }, { status: 503 })
  }
}
