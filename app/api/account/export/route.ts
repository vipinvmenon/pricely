import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized } from '@/lib/api/request'
import { alertsService } from '@/services/alertsService'

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return unauthorized()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  const { data: watchlist } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)

  const alerts = await alertsService.getAlerts(user.id)

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    userId: user.id,
    email: user.email,
    profile: profile ?? null,
    watchlist: watchlist ?? [],
    alerts,
  })
}
