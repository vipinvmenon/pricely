import { NextResponse } from 'next/server'
import { z } from 'zod'
import { citySchema, invalidParams, serviceRoleMissing, unauthorized } from '@/lib/api/request'
import { createClient } from '@/lib/supabase/server'
import { alertsService } from '@/services/alertsService'
import type { AlertPageItem } from '@/types'

// Local-dev fallback so the Alerts page has a coherent (non-error) state when
// Supabase is not configured — mirrors the watchlist route's mock behaviour.
const MOCK_ALERTS: AlertPageItem[] = [
  {
    id: 'mock-1', productId: 'sony-wh-1000xm5', productTitle: 'Sony WH-1000XM5',
    productSubtitle: 'Amazon · Headphones', targetPrice: 22000, isActive: true,
    createdAt: new Date().toISOString(), lastTriggeredAt: null,
  },
  {
    id: 'mock-2', productId: 'dyson-v12-detect-slim', productTitle: 'Dyson V12 Detect Slim',
    productSubtitle: 'Amazon · Vacuum', targetPrice: 42000, isActive: true,
    createdAt: new Date().toISOString(), lastTriggeredAt: null,
  },
]

const PostBodySchema = z.object({
  productId:   z.string().min(1),
  city:        citySchema,
  targetPrice: z.number().positive(),
  platformId:  z.string().optional(),
  title:       z.string().min(1).optional(),
  category:    z.string().optional(),
  subtitle:    z.string().optional(),
  imageUrl:    z.string().optional(),
  searchQuery: z.string().min(1).optional(),
})

const DeleteQuerySchema = z.object({
  id: z.string().uuid(),
})

const PatchBodySchema = z.object({
  id: z.string().uuid(),
  targetPrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
}).refine((value) => value.targetPrice !== undefined || value.isActive !== undefined, {
  message: 'Provide targetPrice or isActive',
})

export async function GET() {
  const start = Date.now()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const response = NextResponse.json(MOCK_ALERTS)
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    return response
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  const alerts = await alertsService.getAlerts(user.id)
  const response = NextResponse.json(alerts)
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}

export async function POST(request: Request) {
  const start = Date.now()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return unauthorized()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  const body = await request.json().catch(() => ({}))
  const parsed = PostBodySchema.safeParse(body)
  if (!parsed.success) {
    return invalidParams(parsed.error.issues)
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return serviceRoleMissing()
  }

  const { productsService } = await import('@/services/productsService')
  const { normalizeProductCategory } = await import('@/lib/utils/productCategory')

  const { productId, city, targetPrice, platformId, title, category, subtitle, imageUrl, searchQuery } =
    parsed.data

  await productsService.upsertProduct({
    id:          productId,
    title:       title ?? productId,
    category:    category ?? normalizeProductCategory('electronics'),
    subtitle,
    imageUrl,
    searchQuery,
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

export async function PATCH(request: Request) {
  const start = Date.now()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return unauthorized()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  const body = await request.json().catch(() => ({}))
  const parsed = PatchBodySchema.safeParse(body)
  if (!parsed.success) {
    return invalidParams(parsed.error.issues)
  }

  await alertsService.updateAlert(parsed.data.id, user.id, {
    targetPrice: parsed.data.targetPrice,
    isActive: parsed.data.isActive,
  })

  const response = NextResponse.json({ success: true })
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}

export async function DELETE(request: Request) {
  const start = Date.now()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return unauthorized()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  const { searchParams } = new URL(request.url)
  const parsed = DeleteQuerySchema.safeParse({ id: searchParams.get('id') })
  if (!parsed.success) {
    return invalidParams(parsed.error.issues)
  }

  await alertsService.deleteAlert(parsed.data.id, user.id)
  const response = NextResponse.json({ success: true })
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  return response
}
