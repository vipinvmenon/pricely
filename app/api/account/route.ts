import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { unauthorized } from '@/lib/api/request'
import { logError } from '@/lib/observability/logger'

export async function DELETE() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return unauthorized()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      { error: 'service_role_not_configured' },
      { status: 503 },
    )
  }

  try {
    const service = createServiceClient()
    await service.from('alerts').delete().eq('user_id', user.id)
    await service.from('watchlist').delete().eq('user_id', user.id)
    await service.from('user_profiles').delete().eq('user_id', user.id)

    const { error } = await service.auth.admin.deleteUser(user.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    logError('account_delete_failed', err, { userId: user.id })
    return NextResponse.json({ error: 'account_delete_failed' }, { status: 500 })
  }
}
