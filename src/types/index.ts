export type PlatformCategory = 'grocery' | 'electronics' | 'cabs'

export type PlatformId =
  | 'blinkit'
  | 'zepto'
  | 'swiggy_instamart'
  | 'bigbasket'
  | 'dmart_ready'
  | 'amazon'
  | 'flipkart'
  | 'croma'
  | 'reliance_digital'
  | 'vijay_sales'
  | 'tata_cliq'
  | 'myntra'
  | 'blusmart'
  | 'rapido'
  | 'uber'
  | 'ola'

export type City = {
  id: string
  name: string
  countryCode: 'IN'
}

export type Verdict = {
  action: 'buy' | 'wait'
  confidence: number
  reason: string
}

export type PriceResult = {
  platformId: PlatformId
  platformName: string
  category: PlatformCategory
  price: number
  mrp?: number
  etaText?: string
  offerText?: string
  updatedAt: string
  url?: string
}

export type PriceHistoryPoint = {
  productId: string
  date: string
  price: number
  platformId: PlatformId
}

export type WatchlistItem = {
  id: string
  userId: string
  productId: string
  cityId: string
  createdAt: string
}

export type WatchlistItemView = {
  id: string
  productId: string
  title: string
  category: PlatformCategory
  subtitle?: string
  deltaText?: string
  hasAlert?: boolean
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

/* ── Trips / Cabs types ── */

export type FareResult = {
  id: string
  name: string
  isLowest?: boolean
  price: number
  eta: string
  surgeMultiplier?: number
  bookUrl: string
}

export type FareHistoryPoint = {
  label: string
  blusmart: number
  rapido: number
  uber: number
  ola: number
}

export type TripsResponse = {
  fares: FareResult[]
  fareHistory: FareHistoryPoint[]
  errors?: ScrapeError[]
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

export type CabScrapeRequest = {
  from: string
  to: string
  platforms: PlatformId[]
}

export type CabScrapeResult = {
  platformId: PlatformId
  price: number
  eta: string
  surgeMultiplier?: number
  bookUrl: string
  scrapedAt: string
}

export type CabScrapeResponse = {
  results: CabScrapeResult[]
  errors: ScrapeError[]
}

/* ── Trending search types ── */

export type TrendingItem = {
  id: string
  query: string
  category: PlatformCategory | 'electronics'
}
