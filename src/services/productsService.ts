import { createServiceClient } from '@/lib/supabase/server'
import type { PlatformCategory } from '@/types'

export type UpsertProductInput = {
  id: string
  title: string
  category: PlatformCategory
  subtitle?: string
  imageUrl?: string
}

export async function upsertProduct(input: UpsertProductInput): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').upsert(
    {
      id:         input.id,
      title:      input.title,
      category:   input.category,
      subtitle:   input.subtitle ?? null,
      image_url:  input.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) throw error
}

export const productsService = { upsertProduct }
