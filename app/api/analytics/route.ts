import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logWarn } from '@/lib/observability/logger'

const BodySchema = z.object({
  event: z.string().min(1).max(64),
  payload: z.record(z.string(), z.unknown()).optional(),
  ts: z.string().optional(),
  path: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  logWarn('analytics_event', {
    event: parsed.data.event,
    path: parsed.data.path,
    ts: parsed.data.ts,
    payload: parsed.data.payload,
  })

  return NextResponse.json({ ok: true })
}
