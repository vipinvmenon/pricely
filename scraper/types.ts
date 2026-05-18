export interface ScraperContext {
  query: string
  city: string
  maxResults: number
}

export interface ScraperResult {
  platformId: string
  price: number
  mrp?: number
  title: string
  url: string
  stock: 'in_stock' | 'low_stock' | 'out_of_stock'
  delivery?: string
  returns?: string
  scrapedAt: string
}

export type Scraper = (ctx: ScraperContext) => Promise<ScraperResult[]>

export interface CabScraperContext {
  from: string
  to: string
}

export interface CabScraperResult {
  platformId: string
  price: number
  eta: string
  surgeMultiplier?: number
  bookUrl: string
  scrapedAt: string
}

export type CabScraper = (ctx: CabScraperContext) => Promise<CabScraperResult>

export interface ScrapeError {
  platformId: string
  message: string
  retryable: boolean
}
