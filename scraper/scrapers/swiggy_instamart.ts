import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

const CITY_ID: Record<string, string> = {
  mumbai:    'Mumbai',
  delhi:     'Delhi',
  bangalore: 'Bangalore',
  hyderabad: 'Hyderabad',
  pune:      'Pune',
  chennai:   'Chennai',
  kolkata:   'Kolkata',
}

export const swiggy_instamart: Scraper = async ({ query, city, maxResults }) =>
  withRetry(async () => {
    const cityName = CITY_ID[city] ?? 'Mumbai'
    const browser  = await chromium.launch({ headless: true })
    const context  = await browser.newContext()
    const page     = await context.newPage()

    try {
      await context.addCookies([
        {
          name:   'userLocation',
          value:  JSON.stringify({ city: cityName }),
          domain: '.swiggy.com',
          path:   '/',
        },
      ])

      await page.goto(
        `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 15_000 },
      )
      await page.waitForSelector('[data-testid="product-card"], .sc-product-card', {
        timeout: 10_000,
      })

      const items = await page.$$eval(
        '[data-testid="product-card"], .sc-product-card',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('[data-testid="product-name"], .product-name, h3')
              ?.textContent?.trim() ?? '',
            price:      parseFloat(
              (el.querySelector('[data-testid="discounted-price"], .price')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (el.querySelector('[data-testid="original-price"], .mrp')?.textContent ?? '0')
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
          platformId: 'swiggy_instamart',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.swiggy.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   '15–20 min',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
