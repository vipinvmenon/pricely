import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const croma: Scraper = async ({ query, maxResults }) =>
  withRetry(async () => {
    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()
    try {
      await page.goto(`https://www.croma.com/search?q=${encodeURIComponent(query)}`, {
        waitUntil: 'domcontentloaded',
        timeout:   20_000,
      })
      await page.waitForSelector('.cp-product,.product-item,.plp-product-wrapper', { timeout: 12_000 })

      const items = await page.$$eval(
        '.cp-product,.product-item,.plp-product-wrapper',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      (
              el.querySelector('h3.product-title,h3[class*="title"],a[class*="title"],[class*="product-title"]')
            )?.textContent?.trim() ?? '',
            price:      parseFloat(
              (el.querySelector('[class*="pdp-price"] strong,[class*="new-price"],[class*="selling-price"],[class*="offer-price"]')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (el.querySelector('[class*="line-through"],[class*="mrp"],[class*="old-price"]')?.textContent ?? '0').replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:        (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
            outOfStock: !!el.querySelector('[class*="out-of-stock"],[class*="outOfStock"]'),
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'croma',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http') ? item.url : `https://www.croma.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   '3–5 days',
          returns:    '7 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
