export type PlatformId =
  | 'amazon'
  | 'flipkart'
  | 'croma'
  | 'reliance_digital'
  | 'vijay_sales'
  | 'tata_cliq'
  | 'myntra'

export type Verdict = {
  action: 'buy' | 'wait'
  confidence: number
  reason: string
}

/* ── API response wrappers ── */

export type VerdictResponse = {
  verdict: Verdict
}

export type CronResult = {
  processed: number
  triggered: number
}

export type PriceResult = {
  platformId: PlatformId
  platformName: string
  category: string
  price: number
  mrp?: number
  etaText?: string
  offerText?: string
  updatedAt: string
  url?: string
  /** Product listing title when returned from search scrape. */
  title?: string
}


/* ── Compare API types ── */

export type RetailerRow = {
  rank: number
  name: string
  isLowest?: boolean
  available?: boolean
  price: number
  mrp?: number
  delivery: string
  returns: string
  stock: string
  buyUrl: string
}

export type CompareProduct = {
  id: string
  name: string
  brand: string
  category: string
  image?: string
}

export type MatchConfidence = 'high' | 'medium' | 'low'

export type ProductMatchCandidate = {
  title: string
  score: number
  platformCount: number
}

export type CompareResponse = {
  product: CompareProduct
  retailers: RetailerRow[]
  history: HistoryPoint[]
  historyByPlatform?: Partial<Record<PlatformId, HistoryPoint[]>>
  verdict?: Verdict
  errors?: ScrapeError[]
  /** ISO timestamp for when live retailer prices were last fetched. */
  fetchedAt?: string
  /** True when the response is illustrative demo data, not live retailer prices. */
  isDemoData?: boolean
  /** How confidently listings match the search query. */
  matchConfidence?: MatchConfidence
  /** Distinct product titles when confidence is not high — user should confirm variant. */
  alternateMatches?: ProductMatchCandidate[]
  /** User-confirmed canonical title for this comparison. */
  confirmedTitle?: string
}

export type HistoryPoint = {
  date: string
  price: number
  platformId?: PlatformId
}

/* ── Watchlist page types ── */

export type WatchlistPageItem = {
  id: string
  initials: string
  name: string
  subtitle: string
  target: number
  now: number
  mrp?: number
  vsTarget: number
  trend: number[]
  status: 'Just dropped' | 'Watching' | 'Holding' | 'Target hit'
}

/* ── Scraper service types ── */

export type ScrapeError = {
  platformId: PlatformId
  message: string
  retryable: boolean
}

export type ScrapeRequest = {
  query: string
  platforms: PlatformId[]
  city: string
  maxResults?: number
}

export type ScrapeResult = {
  platformId: PlatformId
  price: number
  mrp?: number
  title: string
  url: string
  stock: 'in_stock' | 'low_stock' | 'out_of_stock'
  delivery?: string
  returns?: string
  scrapedAt: string
}

export type ScrapeResponse = {
  results: ScrapeResult[]
  errors: ScrapeError[]
}

/* ── Alerts page types ── */

export type AlertPageItem = {
  id: string
  productId: string
  productTitle: string
  productSubtitle: string | null
  targetPrice: number
  isActive: boolean
  createdAt: string
  lastTriggeredAt: string | null
  lastDeliveryStatus?: string | null
  lastDeliveryError?: string | null
}

/* ── Trending search types ── */

export type TrendingItem = {
  id: string
  query: string
  category: string
}
