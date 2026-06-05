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
}


/* ── Compare API types ── */

export type RetailerRow = {
  rank: number
  name: string
  isLowest?: boolean
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

export type CompareResponse = {
  product: CompareProduct
  retailers: RetailerRow[]
  history: HistoryPoint[]
  verdict?: Verdict
  errors?: ScrapeError[]
}

export type HistoryPoint = {
  date: string
  price: number
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
}

/* ── Trending search types ── */

export type TrendingItem = {
  id: string
  query: string
  category: string
}
