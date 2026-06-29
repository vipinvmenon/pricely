import { createServiceClient } from '@/lib/supabase/server'

export type UpsertProductInput = {
  id: string
  title: string
  category?: string
  subtitle?: string
  imageUrl?: string
  searchQuery?: string
}

export type StoredProduct = {
  title: string | null
  category: string | null
  searchQuery: string | null
}

export async function upsertProduct(input: UpsertProductInput): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  // Only include columns that were actually provided so a re-scrape (which
  // knows the title + search query but not the category/subtitle) never
  // clobbers richer metadata captured when the product was first saved.
  const payload: Record<string, unknown> = {
    id:         input.id,
    title:      input.title,
    updated_at: new Date().toISOString(),
  }
  if (input.category !== undefined)    payload.category     = input.category
  if (input.subtitle !== undefined)    payload.subtitle     = input.subtitle
  if (input.imageUrl !== undefined)    payload.image_url    = input.imageUrl
  if (input.searchQuery !== undefined) payload.search_query = input.searchQuery

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' })
  if (error) throw error
}

export async function getProduct(productId: string): Promise<StoredProduct | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('title, category, search_query')
    .eq('id', productId)
    .maybeSingle()

  if (!data) return null
  const row = data as { title: string | null; category: string | null; search_query: string | null }
  return {
    title:       row.title,
    category:    row.category,
    searchQuery: row.search_query?.trim() || null,
  }
}

export const productsService = { upsertProduct, getProduct }
