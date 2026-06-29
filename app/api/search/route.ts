import { NextResponse } from 'next/server'
import { z } from 'zod'
import { invalidParams, resolveCity } from '@/lib/api/request'
import { searchService } from '@/services/searchService'

const QuerySchema = z.object({
  q: z.string().min(1).max(200),
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

  const city = resolveCity(request, searchParams.get('city'))
  const results = await searchService.search(parsed.data.q, city)

  const response = NextResponse.json(results)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
