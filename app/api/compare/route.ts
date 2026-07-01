import { NextResponse } from 'next/server'
import { z } from 'zod'
import { enforceCompareRateLimit } from '@/lib/api/rateLimit'
import { invalidParams, resolveCity, scraperUnavailable } from '@/lib/api/request'
import { buildCompareMockResponse } from '@/lib/mock/buildCompareMock'
import { logError, logInfo } from '@/lib/observability/logger'
import { canServeMockData, isScraperConfigured } from '@/lib/runtime/mockMode'

const QuerySchema = z.object({
  q: z.string().min(1).max(200),
  confirm: z.string().min(1).max(200).optional(),
  refresh: z.enum(['1']).optional(),
})

export async function GET(request: Request) {
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    q: searchParams.get('q') ?? undefined,
  })

  if (!parsed.success) {
    return invalidParams(parsed.error.issues)
  }

  if (!isScraperConfigured() && !canServeMockData()) {
    return scraperUnavailable()
  }

  if (!canServeMockData()) {
    const rateLimited = await enforceCompareRateLimit(request)
    if (rateLimited) return rateLimited
  }

  if (canServeMockData()) {
    const mock = buildCompareMockResponse(parsed.data.q)
    const response = NextResponse.json(mock)
    response.headers.set('X-Pricely-Data-Source', 'demo')
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  try {
    const { compareService } = await import('@/services/compareService')
    const { verdictService } = await import('@/services/verdictService')

    const city = resolveCity(request, searchParams.get('city'))
    const bypassCache = parsed.data.refresh === '1'
    const result = await compareService.compare(
      parsed.data.q,
      city,
      undefined,
      parsed.data.confirm,
      { bypassCache },
    )
    result.verdict = await verdictService.computeVerdict(result.history)

    logInfo('compare_route_success', {
      query: parsed.data.q,
      city,
      bypassCache,
      retailerCount: result.retailers.length,
      demo: false,
    })

    const response = NextResponse.json(result)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    return response
  } catch (err) {
    logError('compare_route_failed', err, { query: parsed.data.q })
    return NextResponse.json({ error: 'scraper_unavailable' }, { status: 503 })
  }
}
