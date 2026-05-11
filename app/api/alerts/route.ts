import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { alertsService } from '@/services/alertsService'

const PostBodySchema = z.object({
  productId:   z.string().min(1),
  city:        z.string().min(1).default('mumbai'),
  targetPrice: z.number().positive(),
  platformId:  z.string().optional(),
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

  const { productId, city, targetPrice, platformId } = parsed.data
  const result = await alertsService.createAlert(user.id, productId, city, targetPrice, platformId)

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
