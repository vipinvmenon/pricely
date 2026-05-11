import { NextResponse } from 'next/server'
import { z } from 'zod'
import { priceHistoryService } from '@/services/priceHistoryService'
import { verdictService } from '@/services/verdictService'

const QuerySchema = z.object({
  productId: z.string().min(1),
  city:      z.string().default('mumbai'),
})

export async function GET(request: Request) {
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    productId: searchParams.get('productId') ?? undefined,
    city:      searchParams.get('city') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { productId, city } = parsed.data
  const history = await priceHistoryService.getPriceHistory(productId, city, 90)
  const verdict = verdictService.computeVerdict(history)

  const response = NextResponse.json({ verdict })
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
