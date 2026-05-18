import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

const SUPPORTED_CITIES = new Set(['mumbai', 'pune', 'bangalore', 'hyderabad'])

export const dmart_ready: Scraper = async ({ query, city, maxResults }) => {
  if (!SUPPORTED_CITIES.has(city)) return []

  return withRetry(async () => {
    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()

    try {
      await page.goto(
        `https://www.dmartready.com/search/${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 15_000 },
      )
      await page.waitForSelector('.product-item, .item-card', { timeout: 10_000 })

      const items = await page.$$eval(
        '.product-item, .item-card',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('.product-name, .item-name, h2, h3')
              ?.textContent?.trim() ?? '',
            price:      parseFloat(
              (
                el.querySelector('.product-price, .selling-price, .price')?.textContent ?? '0'
              ).replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (el.querySelector('.mrp, .crossed-price')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:        (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
            outOfStock: !!el.querySelector('[class*="out-of-stock"], .unavailable'),
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'dmart_ready',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.dmartready.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   'Slot delivery',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
}
