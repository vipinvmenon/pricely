import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const reliance_digital: Scraper = async ({ query, maxResults }) =>
  withRetry(async () => {
    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()
    try {
      await page.goto(
        `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}:relevance`,
        { waitUntil: 'domcontentloaded', timeout: 12_000 },
      )
      await page.waitForSelector('.sp__name, .product-name', { timeout: 8_000 })

      const items = await page.$$eval(
        '.product-list__item, .product-item',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('.sp__name, .product-name')?.textContent?.trim() ?? '',
            price:      parseFloat(
              (el.querySelector('.final-price, .pdp-final-price')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (el.querySelector('.mrp, .strike-through-price')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:        (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
            outOfStock: !!el.querySelector('[class*="outOfStock"], .out-of-stock'),
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'reliance_digital',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.reliancedigital.in${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   '3–5 days',
          returns:    '10 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
