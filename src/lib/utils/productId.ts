import { createHash } from 'crypto'

const MAX_SLUG_LENGTH = 80

/** Stable URL-safe id from a canonical product title (not the user's search query). */
export function deriveProductId(canonicalTitle: string): string {
  const slug = canonicalTitle
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)

  if (slug.length >= 8) return slug

  return createHash('sha256').update(canonicalTitle.toLowerCase()).digest('hex').slice(0, 16)
}
