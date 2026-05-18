import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import type { Scraper, CabScraper, ScrapeError, ScraperResult, CabScraperResult } from './types'

import { amazon }          from './scrapers/amazon'
import { flipkart }        from './scrapers/flipkart'
import { croma }           from './scrapers/croma'
import { reliance_digital } from './scrapers/reliance_digital'
import { vijay_sales }     from './scrapers/vijay_sales'
import { tata_cliq }       from './scrapers/tata_cliq'
import { myntra }          from './scrapers/myntra'
import { blinkit }         from './scrapers/blinkit'
import { zepto }           from './scrapers/zepto'
import { swiggy_instamart } from './scrapers/swiggy_instamart'
import { bigbasket }       from './scrapers/bigbasket'
import { dmart_ready }     from './scrapers/dmart_ready'
import { blusmart }        from './scrapers/cabs/blusmart'
import { rapido }          from './scrapers/cabs/rapido'
import { uber }            from './scrapers/cabs/uber'
import { ola }             from './scrapers/cabs/ola'

const RETAIL_SCRAPERS: Record<string, Scraper> = {
  amazon,
  flipkart,
  croma,
  reliance_digital,
  vijay_sales,
  tata_cliq,
  myntra,
  blinkit,
  zepto,
  swiggy_instamart,
  bigbasket,
  dmart_ready,
}

const CAB_SCRAPERS: Record<string, CabScraper> = {
  blusmart,
  rapido,
  uber,
  ola,
}

const app = express()
app.use(express.json())

app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token !== process.env.SCRAPER_SERVICE_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  next()
})

app.post('/scrape', async (req: Request, res: Response) => {
  const { query, platforms, city, maxResults = 3 } = req.body as {
    query: string
    platforms: string[]
    city: string
    maxResults?: number
  }

  if (!query || !Array.isArray(platforms)) {
    res.status(400).json({ error: 'query and platforms are required' })
    return
  }

  const results: ScraperResult[] = []
  const errors: ScrapeError[] = []

  await Promise.allSettled(
    platforms.map(async (id) => {
      const scraper = RETAIL_SCRAPERS[id]
      if (!scraper) {
        errors.push({ platformId: id, message: `Unknown platform: ${id}`, retryable: false })
        return
      }
      try {
        const scraped = await scraper({ query, city, maxResults })
        results.push(...scraped)
      } catch (err) {
        errors.push({
          platformId: id,
          message: err instanceof Error ? err.message : String(err),
          retryable: true,
        })
      }
    }),
  )

  res.json({ results, errors })
})

app.post('/scrape/cabs', async (req: Request, res: Response) => {
  const { from, to, platforms } = req.body as {
    from: string
    to: string
    platforms: string[]
  }

  if (!from || !to || !Array.isArray(platforms)) {
    res.status(400).json({ error: 'from, to, and platforms are required' })
    return
  }

  const results: CabScraperResult[] = []
  const errors: ScrapeError[] = []

  await Promise.allSettled(
    platforms.map(async (id) => {
      const scraper = CAB_SCRAPERS[id]
      if (!scraper) {
        errors.push({ platformId: id, message: `Unknown platform: ${id}`, retryable: false })
        return
      }
      try {
        const result = await scraper({ from, to })
        results.push(result)
      } catch (err) {
        errors.push({
          platformId: id,
          message: err instanceof Error ? err.message : String(err),
          retryable: true,
        })
      }
    }),
  )

  res.json({ results, errors })
})

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, uptime: process.uptime() })
})

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`Scraper service listening on port ${PORT}`)
})
