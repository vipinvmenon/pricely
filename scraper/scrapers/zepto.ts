import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

const CITY_PINCODE: Record<string, string> = {
  mumbai:    '400001',
  delhi:     '110001',
  bangalore: '560001',
  hyderabad: '500001',
  pune:      '411001',
  chennai:   '600001',
  kolkata:   '700001',
}

export const zepto: Scraper = async ({ query, city, maxResults }) =>
  withRetry(async () => {
    const pincode = CITY_PINCODE[city] ?? CITY_PINCODE.mumbai
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page    = await context.newPage()

    try {
      await context.addCookies([
        {
          name:   'app_pincode',
          value:  pincode,
          domain: '.zeptonow.com',
          path:   '/',
        },
      ])

      await page.goto(
        `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 15_000 },
      )
      await page.waitForSelector('[data-testid="product-card"], .product-card', {
        timeout: 10_000,
      })

      const items = await page.$$eval(
        '[data-testid="product-card"], .product-card',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('[data-testid="product-name"], .product-name')
              ?.textContent?.trim() ?? '',
            price:      parseFloat(
              (
                el.querySelector('[data-testid="product-price"], .discounted-price')
                  ?.textContent ?? '0'
              ).replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (
                el.querySelector('[data-testid="product-mrp"], .original-price')
                  ?.textContent ?? '0'
              ).replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:        (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
            outOfStock: !!el.querySelector('[data-testid="out-of-stock"]'),
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'zepto',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.zeptonow.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   '10 min',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
