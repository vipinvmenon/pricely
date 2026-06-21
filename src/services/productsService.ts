import { createServiceClient } from '@/lib/supabase/server'

export type UpsertProductInput = {
  id: string
  title: string
  category: string
  subtitle?: string
  imageUrl?: string
  searchQuery?: string
}

export async function upsertProduct(input: UpsertProductInput): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').upsert(
    {
      id:           input.id,
      title:        input.title,
      category:     input.category,
      subtitle:     input.subtitle ?? null,
      image_url:    input.imageUrl ?? null,
      search_query: input.searchQuery ?? null,
      updated_at:   new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) throw error
}

export async function getSearchQuery(productId: string): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('search_query')
    .eq('id', productId)
    .maybeSingle()

  const searchQuery = (data as { search_query: string | null } | null)?.search_query
  return searchQuery?.trim() || null
}

export const productsService = { upsertProduct, getSearchQuery }
