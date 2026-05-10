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
  | 'ola'
  | 'uber'
  | 'rapido'
  | 'namma_yatri'
  | 'indrive'

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
}

/* ── Trending search types ── */

export type TrendingItem = {
  id: string
  query: string
  category: PlatformCategory | 'electronics'
}
