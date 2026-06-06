import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const reliance_digital: Scraper = async ({ query, maxResults }) =>
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
        `https://www.reliancedigital.in/products?q=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 30_000 },
      )
      await page.waitForSelector('a[href*="/product/"]', { timeout: 20_000 })

      const items = await page.evaluate((max: number) => {
        const seen = new Set<string>()
        const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

        for (const a of Array.from(document.querySelectorAll('a[href*="/product/"]'))) {
          const rawHref = (a as HTMLAnchorElement).getAttribute('href') || ''
          // Reliance Digital product URLs are /product/<slug>-<numeric-id>[?query]
          const idMatch = rawHref.match(/\/product\/.+-(\d+)(?:[/?]|$)/)
          if (!idMatch) continue
          const id = idMatch[1]
          if (seen.has(id)) continue

          let card: Element | null = a.parentElement
          for (let i = 0; i < 8; i++) {
            if (!card) break
            if (card.textContent?.includes('₹')) break
            card = card.parentElement
          }
          if (!card) continue

          // Title is the card text up to the first price; strip promo prefixes.
          const cardText = (card.textContent || '').replace(/\s+/g, ' ').trim()
          const title = cardText
            .split('₹')[0]
            .replace(/^(LIMITED_TIME_OFFER|NEWLY_LAUNCHED)\s*/i, '')
            .trim()
          if (!title) continue

          const priceEls = Array.from(card.querySelectorAll('*'))
            .filter(el => el.children.length === 0 && (el.textContent?.trim() || '').startsWith('₹'))
            .map(el => parseFloat((el.textContent || '0').replace(/[^0-9.]/g, '')))
            .filter(n => n > 0)

          const price = priceEls[0] ?? 0
          const mrp   = priceEls[1] && priceEls[1] > price ? priceEls[1] : undefined

          seen.add(id)
          const path = rawHref.split('?')[0]
          results.push({
            title,
            price,
            mrp,
            url: path.startsWith('http') ? path : 'https://www.reliancedigital.in' + path,
          })

          if (results.length >= max) break
        }
        return results
      }, maxResults)

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'reliance_digital',
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
