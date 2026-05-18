import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

export const bigbasket: Scraper = async ({ query, maxResults }) =>
  withRetry(async () => {
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()

    try {
      await page.goto(
        `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}&nc=as`,
        { waitUntil: 'domcontentloaded', timeout: 15_000 },
      )
      await page.waitForSelector('[qa="product-card"], .product-info', { timeout: 10_000 })

      const items = await page.$$eval(
        '[qa="product-card"], .prod-info',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('[qa="product-name"], .prod-name')
              ?.textContent?.trim() ?? '',
            price:      parseFloat(
              (
                el.querySelector('[qa="discounted-price"], .discnt-price, .sp')?.textContent ?? '0'
              ).replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (el.querySelector('[qa="mrp"], .mrp, .cp')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:        (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
            outOfStock: !!el.querySelector('[class*="out-of-stock"]'),
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'bigbasket',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.bigbasket.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   'Slot delivery',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
