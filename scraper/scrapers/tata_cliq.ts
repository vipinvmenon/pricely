import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const tata_cliq: Scraper = async ({ query, maxResults }) =>
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
        `https://www.tatacliq.com/search#?searchCategory=all&text=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 30_000 },
      )
      // Tata Cliq product URLs: /buy-product-name/p/ALPHANUM
      await page.waitForSelector('a[href*="/p/"]', { timeout: 20_000 })

      const items = await page.evaluate((max: number) => {
        const seen = new Set<string>()
        const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

        for (const a of Array.from(document.querySelectorAll('a[href*="/p/"]'))) {
          const href  = (a as HTMLAnchorElement).getAttribute('href') || ''
          if (!/\/p\/[A-Z0-9]{5,}/.test(href)) continue
          const title = (a as HTMLAnchorElement).textContent?.trim() ||
                        (a as HTMLAnchorElement).getAttribute('title') || ''
          if (!title || seen.has(href)) continue
          seen.add(href)

          let card: Element | null = a.parentElement
          for (let i = 0; i < 8; i++) {
            if (!card) break
            if (card.textContent?.includes('₹')) break
            card = card.parentElement
          }
          if (!card) continue

          const priceEls = Array.from(card.querySelectorAll('*'))
            .filter(el => el.children.length === 0 && (el.textContent?.trim() || '').startsWith('₹'))
            .map(el => parseFloat((el.textContent || '0').replace(/[^0-9.]/g, '')))
            .filter(n => n > 0)

          const price = priceEls[0] ?? 0
          const mrp   = priceEls[1] && priceEls[1] > price ? priceEls[1] : undefined

          results.push({
            title,
            price,
            mrp,
            url: href.startsWith('http') ? href : 'https://www.tatacliq.com' + href,
          })

          if (results.length >= max) break
        }
        return results
      }, maxResults)

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'tata_cliq',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url,
          stock:      'in_stock' as const,
          delivery:   '3–5 days',
          returns:    '10 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await context.close()
      await browser.close()
    }
  })
