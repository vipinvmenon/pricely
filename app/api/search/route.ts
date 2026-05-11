import { NextResponse } from 'next/server'
import { z } from 'zod'
import { searchService } from '@/services/searchService'
import type { PlatformCategory } from '@/types'

const QuerySchema = z.object({
  q:        z.string().min(1).max(200),
  city:     z.string().default('mumbai'),
  category: z.enum(['grocery', 'electronics']).optional(),
})

export async function GET(request: Request) {
  const start = Date.now()
  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    q:        searchParams.get('q') ?? undefined,
    city:     searchParams.get('city') ?? undefined,
    category: searchParams.get('category') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { q, city, category } = parsed.data
  const results = await searchService.search(
    q,
    city,
    category as Exclude<PlatformCategory, 'cabs'> | undefined,
  )

  const response = NextResponse.json(results)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
