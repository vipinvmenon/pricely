import type { PlatformCategory } from '@/types'

/** Map free-text or API category labels to DB enum `product_category`. */
export function normalizeProductCategory(raw: string): PlatformCategory {
  const value = raw.trim().toLowerCase()
  if (value === 'grocery') return 'grocery'
  if (value === 'cabs') return 'cabs'
  return 'electronics'
}
