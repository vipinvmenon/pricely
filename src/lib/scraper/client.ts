import type { ScrapeRequest, ScrapeResponse, CabScrapeRequest, CabScrapeResponse } from '@/types'

const BASE   = process.env.SCRAPER_SERVICE_URL
const SECRET = process.env.SCRAPER_SERVICE_SECRET

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!BASE) throw new Error('SCRAPER_SERVICE_URL not configured')
  const res = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SECRET}`,
    },
    body:   JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Scraper responded ${res.status}`)
  return res.json() as Promise<T>
}

export const scraperClient = {
  scrape:     (req: ScrapeRequest)    => post<ScrapeResponse>('/scrape', req),
  scrapeCabs: (req: CabScrapeRequest) => post<CabScrapeResponse>('/scrape/cabs', req),
}
