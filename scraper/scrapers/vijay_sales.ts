import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const vijay_sales: Scraper = async ({ query, maxResults }) =>
  withRetry(async () => {
    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()
    try {
      await page.goto(
        `https://www.vijaysales.com/search/${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 12_000 },
      )
      await page.waitForSelector('.product-name, .product-title', { timeout: 8_000 })

      const items = await page.$$eval(
        '.product-box, .product-card',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('.product-name, .product-title')?.textContent?.trim() ?? '',
            price:      parseFloat(
              (el.querySelector('.special-price, .selling-price')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (el.querySelector('.old-price, .original-price')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:        (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
            outOfStock: !!el.querySelector('.out-of-stock, [class*="outOfStock"]'),
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'vijay_sales',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.vijaysales.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   '2–4 days',
          returns:    '7 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
