import type { MatchConfidence, PlatformId, ProductMatchCandidate, ScrapeResult } from '@/types'

const ACCESSORY_TERMS = [
  'protector', 'case', 'cover', 'adapter', 'charger', 'cable', 'strap',
  'screen guard', 'tempered glass', 'bumper', 'holder', 'mount', 'skin',
  'lens', 'earbuds', 'earphones', 'headphones', 'band', 'folie', 'pouch',
]

function tokenMatches(titleNorm: string, token: string): boolean {
  if (/^\d+$/.test(token)) {
    // Require a model-number context; reject "15" inside "15.93 cm" screen sizes.
    return new RegExp(`(?:^|\\s|iphone\\s)${token}(?!\\.\\d)(?:\\s|$|[^0-9])`).test(titleNorm)
  }
  return titleNorm.includes(token)
}

function iphoneGenerationNumber(titleNorm: string): string | null {
  const match = titleNorm.match(/iphone\s*(\d+)/i)
  return match?.[1] ?? null
}

/** Higher = better match to the search query; accessories and missing tokens score down. */
export function scoreProductRelevance(title: string, query: string): number {
  const titleNorm = title.toLowerCase()
  const queryNorm = query.toLowerCase()
  const queryTokens = queryNorm.split(/\s+/).filter(t => t.length > 1)

  let score = 0
  for (const token of queryTokens) {
    if (tokenMatches(titleNorm, token)) score += 3
    else score -= 4
  }

  for (const term of ACCESSORY_TERMS) {
    if (titleNorm.includes(term)) score -= 12
  }

  // Avoid "Reno15Pro" matching "iphone 15 pro" via shared digit tokens.
  if (queryNorm.includes('iphone') && !titleNorm.includes('iphone')) score -= 20

  // Penalize wrong iPhone generation (e.g. query "15 pro" vs title "17 Pro").
  const queryGen = iphoneGenerationNumber(queryNorm)
  const titleGen = iphoneGenerationNumber(titleNorm)
  if (queryGen && titleGen && queryGen !== titleGen) score -= 25

  return score
}

/**
 * Pick the best-matching listing per retailer from scrape candidates.
 *
 * `minScore` defaults to 3 (≈ one fully-matched query token) so weak/accessory
 * matches don't get written into price history as if they were the product.
 */
export function pickBestPerPlatform(
  results: ScrapeResult[],
  query: string,
  minScore = 3,
): ScrapeResult[] {
  const byPlatform = new Map<PlatformId, ScrapeResult[]>()

  for (const r of results) {
    const list = byPlatform.get(r.platformId) ?? []
    list.push(r)
    byPlatform.set(r.platformId, list)
  }

  const picked: ScrapeResult[] = []

  for (const candidates of byPlatform.values()) {
    const ranked = candidates
      .map(r => ({ r, score: scoreProductRelevance(r.title, query) }))
      .sort((a, b) => b.score - a.score)

    const best = ranked[0]
    if (best && best.score >= minScore) picked.push(best.r)
  }

  return picked
}

export function bestProductTitle(results: ScrapeResult[], query: string): string {
  if (results.length === 0) return query

  return results
    .map(r => ({ title: r.title, score: scoreProductRelevance(r.title, query) }))
    .sort((a, b) => b.score - a.score)[0]?.title ?? query
}

function titleFingerprint(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 6)
    .join(' ')
}

/** Cluster scrape candidates into distinct product titles for disambiguation. */
export function collectAlternateMatches(
  results: ScrapeResult[],
  query: string,
  limit = 4,
): ProductMatchCandidate[] {
  const clusters = new Map<string, { title: string; score: number; platforms: Set<PlatformId> }>()

  for (const result of results) {
    const score = scoreProductRelevance(result.title, query)
    if (score < 1) continue

    const key = titleFingerprint(result.title)
    if (!key) continue

    const existing = clusters.get(key)
    if (!existing || score > existing.score) {
      clusters.set(key, {
        title: result.title,
        score,
        platforms: new Set([result.platformId, ...(existing?.platforms ?? [])]),
      })
      continue
    }

    existing.platforms.add(result.platformId)
  }

  return [...clusters.values()]
    .map((cluster) => ({
      title: cluster.title,
      score: cluster.score,
      platformCount: cluster.platforms.size,
    }))
    .sort((a, b) => b.score - a.score || b.platformCount - a.platformCount)
    .slice(0, limit)
}

/**
 * Estimate how confidently scraped listings refer to one product variant.
 * Low confidence surfaces alternate titles so the user can confirm before comparing.
 */
export function computeMatchConfidence(
  results: ScrapeResult[],
  query: string,
  matched: ScrapeResult[],
): { confidence: MatchConfidence; alternateMatches: ProductMatchCandidate[] } {
  const alternateMatches = collectAlternateMatches(results, query)

  if (matched.length === 0) {
    return { confidence: 'low', alternateMatches }
  }

  const scores = matched.map((r) => scoreProductRelevance(r.title, query))
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const fingerprints = new Set(matched.map((r) => titleFingerprint(r.title)))
  const titleSpread = fingerprints.size

  let confidence: MatchConfidence = 'low'
  if (avgScore >= 8 && matched.length >= 3 && titleSpread <= 2) {
    confidence = 'high'
  } else if (avgScore >= 5 && matched.length >= 2 && titleSpread <= 3) {
    confidence = 'medium'
  }

  if (titleSpread >= 4) confidence = 'low'

  return {
    confidence,
    alternateMatches: confidence === 'high' ? [] : alternateMatches,
  }
}
