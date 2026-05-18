import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const tata_cliq: Scraper = async ({ query, maxResults }) =>
  withRetry(async () => {
    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()
    try {
      await page.goto(
        `https://www.tatacliq.com/search#?searchCategory=all&text=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 15_000 },
      )
      // SPA — wait for product cards to hydrate
      await page.waitForSelector('.product-card, [class*="ProductCard"]', { timeout: 12_000 })

      const items = await page.$$eval(
        '.product-card, [class*="ProductCard"]',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('[class*="productTitle"], [class*="ProductTitle"]')
              ?.textContent?.trim() ?? '',
            price:      parseFloat(
              (
                el.querySelector('[class*="finalPrice"], [class*="sellingPrice"]')
                  ?.textContent ?? '0'
              ).replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (
                el.querySelector('[class*="mrp"], [class*="MRP"]')?.textContent ?? '0'
              ).replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:        (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
            outOfStock: !!el.querySelector('[class*="outOfStock"], [class*="OutOfStock"]'),
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'tata_cliq',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.tatacliq.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   '3–5 days',
          returns:    '10 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
