import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import type { Scraper, ScrapeError, ScraperResult } from './types'

import { amazon }           from './scrapers/amazon'
import { flipkart }         from './scrapers/flipkart'
import { croma }            from './scrapers/croma'
import { reliance_digital } from './scrapers/reliance_digital'
import { vijay_sales }      from './scrapers/vijay_sales'
import { tata_cliq }        from './scrapers/tata_cliq'
import { myntra }           from './scrapers/myntra'

const RETAIL_SCRAPERS: Record<string, Scraper> = {
  amazon,
  flipkart,
  croma,
  reliance_digital,
  vijay_sales,
  tata_cliq,
  myntra,
}

const VALID_PLATFORMS = new Set(Object.keys(RETAIL_SCRAPERS))
const SCRAPER_SECRET = process.env.SCRAPER_SERVICE_SECRET
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const MAX_QUERY_LENGTH = 200
const MAX_RESULTS_CAP = 10

if (!SCRAPER_SECRET) {
  if (IS_PRODUCTION) {
    console.error('FATAL: SCRAPER_SERVICE_SECRET is not set — /scrape will refuse requests in production.')
  } else {
    console.warn('WARNING: SCRAPER_SERVICE_SECRET is not set — auth is bypassed in non-production only.')
  }
}

const app = express()
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, uptime: process.uptime() })
})

app.use((req: Request, res: Response, next: NextFunction) => {
  // Fail closed: never allow unauthenticated access in production when the
  // secret is missing. Only non-production may run without a secret.
  if (!SCRAPER_SECRET) {
    if (IS_PRODUCTION) {
      res.status(503).json({ error: 'scraper_misconfigured' })
      return
    }
    next()
    return
  }
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token !== SCRAPER_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  next()
})

app.post('/scrape', async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as Record<string, unknown>

  const query = typeof body.query === 'string' ? body.query.trim() : ''
  if (!query || query.length > MAX_QUERY_LENGTH) {
    res.status(400).json({ error: 'invalid_query' })
    return
  }

  if (!Array.isArray(body.platforms) || body.platforms.length === 0 ||
      !body.platforms.every((p): p is string => typeof p === 'string')) {
    res.status(400).json({ error: 'invalid_platforms' })
    return
  }
  const platforms = body.platforms as string[]

  const city = typeof body.city === 'string' ? body.city : ''

  const maxResults =
    typeof body.maxResults === 'number' && Number.isFinite(body.maxResults)
      ? Math.min(Math.max(Math.trunc(body.maxResults), 1), MAX_RESULTS_CAP)
      : 3

  const results: ScraperResult[] = []
  const errors: ScrapeError[] = []

  await Promise.allSettled(
    platforms.map(async (id) => {
      const scraper = RETAIL_SCRAPERS[id]
      if (!VALID_PLATFORMS.has(id) || !scraper) {
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

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`Scraper service listening on port ${PORT}`)
})
