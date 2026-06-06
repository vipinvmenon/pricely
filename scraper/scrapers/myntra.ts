import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

const FASHION_KEYWORDS = [
  'shirt', 'dress', 'shoes', 'kurta', 'jeans', 'saree', 'jacket', 'shorts',
  'tshirt', 't-shirt', 'leggings', 'suit', 'blazer', 'sneakers', 'sandals',
  'handbag', 'bag', 'watch', 'sunglasses', 'cap', 'hat',
]

function isFashionQuery(query: string): boolean {
  const q = query.toLowerCase()
  return FASHION_KEYWORDS.some(kw => q.includes(kw))
}

export const myntra: Scraper = async ({ query, maxResults }) => {
  if (!isFashionQuery(query)) return []

  return withRetry(async () => {
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
      const slug = query.toLowerCase().replace(/\s+/g, '-')
      await page.goto(
        `https://www.myntra.com/${encodeURIComponent(slug)}`,
        { waitUntil: 'domcontentloaded', timeout: 30_000 },
      )
      await page.waitForSelector('a[href*="/buy"], a[href*="/p/"], li.product-base', {
        timeout: 20_000,
      })

      const items = await page.evaluate((max: number) => {
        const seen = new Set<string>()
        const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

        // Myntra product links look like /<brand>/<name>/<id>/buy
        for (const a of Array.from(document.querySelectorAll('a[href*="/buy"]'))) {
          const href = (a as HTMLAnchorElement).getAttribute('href') || ''
          const idMatch = href.match(/\/(\d+)\/buy/)
          if (!idMatch) continue
          const id = idMatch[1]
          if (seen.has(id)) continue

          let card: Element | null = a.parentElement
          for (let i = 0; i < 8; i++) {
            if (!card) break
            if (/(₹|Rs)/.test(card.textContent || '')) break
            card = card.parentElement
          }
          if (!card) continue

          const cardText = (card.textContent || '').replace(/\s+/g, ' ').trim()
          const priceEls = (cardText.match(/(?:₹|Rs\.?\s?)[\d,]+/g) || [])
            .map(s => parseFloat(s.replace(/[^0-9.]/g, '')))
            .filter(n => n > 0)
          const price = priceEls[0] ?? 0
          const mrp   = priceEls[1] && priceEls[1] > price ? priceEls[1] : undefined

          const title = cardText.split(/(?:₹|Rs\.?)/)[0].trim()
          if (!title) continue

          seen.add(id)
          results.push({
            title,
            price,
            mrp,
            url: href.startsWith('http') ? href : 'https://www.myntra.com' + href,
          })

          if (results.length >= max) break
        }
        return results
      }, maxResults)

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'myntra',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url,
          stock:      'in_stock' as const,
          delivery:   'Free · 4–7 days',
          returns:    '30 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await context.close()
      await browser.close()
    }
  })
}
