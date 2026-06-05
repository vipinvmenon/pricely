import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { AlertPageItem } from '@/types'

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

export async function getAlerts(userId: string): Promise<AlertPageItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('alerts')
    .select('*, products(title, subtitle)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  type Row = Alert & { products: { title: string; subtitle: string | null } | null }
  return ((data ?? []) as Row[]).map((row) => ({
    id:              row.id,
    productId:       row.product_id,
    productTitle:    row.products?.title ?? row.product_id,
    productSubtitle: row.products?.subtitle ?? null,
    targetPrice:     row.target_price,
    isActive:        row.is_active,
    createdAt:       row.created_at,
    lastTriggeredAt: row.last_triggered_at,
  }))
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
  // auth.users is not in the public schema — join via PostgREST doesn't work.
  // Use auth admin API to resolve emails after fetching alert rows.
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('alerts')
    .select('*, products(title)')
    .eq('is_active', true)

  const rows = (data ?? []) as Array<Alert & { products: { title: string } | null }>

  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const emailMap = new Map<string, string>()
  await Promise.all(
    userIds.map(async (uid) => {
      const { data: userData } = await supabase.auth.admin.getUserById(uid)
      if (userData.user?.email) emailMap.set(uid, userData.user.email)
    }),
  )

  return rows.map((row) => ({
    ...row,
    userEmail:    emailMap.get(row.user_id) ?? '',
    productTitle: row.products?.title ?? row.product_id,
  }))
}

export async function markAlertTriggered(id: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase
    .from('alerts')
    .update({ last_triggered_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
}

export const alertsService = {
  getAlerts,
  createAlert,
  deleteAlert,
  getActiveAlerts,
  markAlertTriggered,
}
