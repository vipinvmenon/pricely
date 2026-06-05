/** Map free-text or API category labels to a normalised string. */
export function normalizeProductCategory(raw: string): string {
  return raw.trim().toLowerCase() || 'electronics'
}
