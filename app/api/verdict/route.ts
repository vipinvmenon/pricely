import { NextResponse } from 'next/server'
import { z } from 'zod'
import { invalidParams, resolveCity } from '@/lib/api/request'
import { priceHistoryService } from '@/services/priceHistoryService'
import { verdictService } from '@/services/verdictService'
import type { VerdictResponse } from '@/types'

const QuerySchema = z.object({
  productId: z.string().min(1),
})

export async function GET(request: Request) {
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    productId: searchParams.get('productId') ?? undefined,
  })

  if (!parsed.success) {
    return invalidParams(parsed.error.issues)
  }

  const city = resolveCity(request, searchParams.get('city'))

  // History reads require Supabase; without it we still return an honest,
  // low-confidence verdict rather than throwing.
  const historyBundle = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? await priceHistoryService.getPriceHistory(parsed.data.productId, city, 90)
    : { dailyLowest: [], byPlatform: {}, distinctDays: 0 }
  const verdict = await verdictService.computeVerdict(historyBundle.dailyLowest)

  const body: VerdictResponse = { verdict }
  const response = NextResponse.json(body)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
