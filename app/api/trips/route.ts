import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { TripsResponse } from '@/types'

const QuerySchema = z.object({
  from: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'Must be lat,lng format'),
  to:   z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'Must be lat,lng format'),
  city: z.string().default('mumbai'),
})

function fareHistory() {
  const labels = ['-5h', '-4h', '-3h', '-2h', '-1h', 'Now']
  return labels.map((label, i) => ({
    label,
    blusmart: 480 + Math.round((Math.random() - 0.5) * 60) + i * 5,
    rapido:   560 + Math.round((Math.random() - 0.5) * 80) + i * 8,
    uber:     680 + Math.round((Math.random() - 0.5) * 100) + i * 12,
    ola:      720 + Math.round((Math.random() - 0.5) * 100) + i * 10,
  }))
}

const MOCK_TRIPS_RESPONSE: TripsResponse = {
  fares: [
    { id: 'blusmart', name: 'BluSmart', isLowest: true, price: 498, eta: '4 min away', bookUrl: '#' },
    { id: 'rapido',   name: 'Rapido',                  price: 572, eta: '3 min away', bookUrl: '#' },
    { id: 'uber',     name: 'Uber',                    price: 698, eta: '6 min away', surgeMultiplier: 1.4, bookUrl: '#' },
    { id: 'ola',      name: 'Ola',                     price: 742, eta: '8 min away', surgeMultiplier: 1.4, bookUrl: '#' },
  ],
  fareHistory: fareHistory(),
}

export async function GET(request: Request) {
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    from: searchParams.get('from') ?? undefined,
    to:   searchParams.get('to') ?? undefined,
    city: searchParams.get('city') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  if (!process.env.SCRAPER_SERVICE_URL) {
    const response = NextResponse.json(MOCK_TRIPS_RESPONSE)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  try {
    const { tripsService } = await import('@/services/tripsService')
    const { from, to, city } = parsed.data
    const result = await tripsService.getFares(from, to, city)

    const response = NextResponse.json(result)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  } catch {
    return NextResponse.json({ error: 'scraper_unavailable' }, { status: 503 })
  }
}
