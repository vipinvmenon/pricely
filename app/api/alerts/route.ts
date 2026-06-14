import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { alertsService } from '@/services/alertsService'

const PostBodySchema = z.object({
  productId:   z.string().min(1),
  city:        z.string().min(1).default('mumbai'),
  targetPrice: z.number().positive(),
  platformId:  z.string().optional(),
  title:       z.string().min(1).optional(),
  category:    z.string().optional(),
  subtitle:    z.string().optional(),
  imageUrl:    z.string().optional(),
})

const DeleteQuerySchema = z.object({
  id: z.string().uuid(),
})

export async function GET() {
  const start = Date.now()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const alerts = await alertsService.getAlerts(user.id)
  const response = NextResponse.json(alerts)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}

export async function POST(request: Request) {
  const start = Date.now()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = PostBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      { error: 'service_role_not_configured', message: 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local' },
      { status: 503 },
    )
  }

  const { productsService } = await import('@/services/productsService')
  const { normalizeProductCategory } = await import('@/lib/utils/productCategory')

  const { productId, city, targetPrice, platformId, title, category, subtitle, imageUrl } =
    parsed.data

  await productsService.upsertProduct({
    id:       productId,
    title:    title ?? productId,
    category: category ?? normalizeProductCategory('electronics'),
    subtitle,
    imageUrl,
  })

  const result = await alertsService.createAlert(
    user.id,
    productId,
    city,
    targetPrice,
    platformId,
  )

  const response = NextResponse.json(result, { status: 201 })
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}

export async function DELETE(request: Request) {
  const start = Date.now()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = DeleteQuerySchema.safeParse({ id: searchParams.get('id') })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_params', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  await alertsService.deleteAlert(parsed.data.id, user.id)
  const response = NextResponse.json({ success: true })
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
