import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const vijay_sales: Scraper = async ({ query, maxResults }) =>
  withRetry(async () => {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport:  { width: 1280, height: 800 },
      locale:    'en-IN',
    })
    const page = await context.newPage()
    try {
      await page.goto(
        `https://www.vijaysales.com/search?q=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 30_000 },
      )
      // Vijay Sales product URLs are /p/<numeric-id>
      await page.waitForSelector('a[href*="/p/"]', { timeout: 20_000 })

      const items = await page.evaluate((max: number) => {
        const seen = new Set<string>()
        const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

        for (const a of Array.from(document.querySelectorAll('a[href*="/p/"]'))) {
          const href = (a as HTMLAnchorElement).getAttribute('href') || ''
          const idMatch = href.match(/\/p\/(\d+)/)
          if (!idMatch) continue
          const id = idMatch[1]
          if (seen.has(id)) continue

          // The anchor text holds the product card content (title + price).
          const cardText = (a.textContent || '').replace(/\s+/g, ' ').trim()
          const title = cardText.split('₹')[0].trim()
          if (!title || title.length < 5) continue

          const priceEls = (cardText.match(/₹[\d,]+(?:\.\d+)?/g) || [])
            .map(s => parseFloat(s.replace(/[^0-9.]/g, '')))
            .filter(n => n > 0)

          const price = priceEls[0] ?? 0
          const mrp   = priceEls[1] && priceEls[1] > price ? priceEls[1] : undefined

          seen.add(id)
          results.push({
            title,
            price,
            mrp,
            url: href.startsWith('http') ? href : 'https://www.vijaysales.com' + href,
          })

          if (results.length >= max) break
        }
        return results
      }, maxResults)

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'vijay_sales',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url,
          stock:      'in_stock' as const,
          delivery:   '2–4 days',
          returns:    '7 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await context.close()
      await browser.close()
    }
  })
