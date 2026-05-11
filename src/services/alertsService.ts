import { createClient } from '@/lib/supabase/server'

interface Alert {
  id:                string
  user_id:           string
  product_id:        string
  city:              string
  platform_id:       string | null
  target_price:      number
  is_active:         boolean
  created_at:        string
  last_triggered_at: string | null
}

interface AlertWithUser extends Alert {
  userEmail: string
  productTitle: string
}

export async function getAlerts(userId: string): Promise<Alert[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Alert[]
}

export async function createAlert(
  userId: string,
  productId: string,
  city: string,
  targetPrice: number,
  platformId?: string,
): Promise<{ id: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id:      userId,
      product_id:   productId,
      city,
      target_price: targetPrice,
      platform_id:  platformId ?? null,
    })
    .select('id')
    .single()
  if (error) throw error
  return { id: (data as { id: string }).id }
}

export async function deleteAlert(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('alerts').delete().eq('id', id).eq('user_id', userId)
}

export async function getActiveAlerts(): Promise<AlertWithUser[]> {
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data } = await supabase
    .from('alerts')
    .select(`
      *,
      products ( title ),
      auth_users:user_id ( email )
    `)
    .eq('is_active', true)

  return ((data ?? []) as Array<Alert & {
    products: { title: string } | null
    auth_users: { email: string } | null
  }>).map((row) => ({
    ...row,
    userEmail:    row.auth_users?.email ?? '',
    productTitle: row.products?.title ?? row.product_id,
  }))
}

export async function markAlertTriggered(id: string): Promise<void> {
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  await supabase
    .from('alerts')
    .update({ last_triggered_at: new Date().toISOString() })
    .eq('id', id)
}

export const alertsService = {
  getAlerts,
  createAlert,
  deleteAlert,
  getActiveAlerts,
  markAlertTriggered,
}
