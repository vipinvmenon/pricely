import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  mumbai:    { lat: 19.0760, lng: 72.8777 },
  delhi:     { lat: 28.6139, lng: 77.2090 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  pune:      { lat: 18.5204, lng: 73.8567 },
  chennai:   { lat: 13.0827, lng: 80.2707 },
  kolkata:   { lat: 22.5726, lng: 88.3639 },
}

export const blinkit: Scraper = async ({ query, city, maxResults }) =>
  withRetry(async () => {
    const coords = CITY_COORDS[city] ?? CITY_COORDS.mumbai
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page    = await context.newPage()

    try {
      await context.addCookies([
        {
          name:   'location',
          value:  JSON.stringify({ lat: coords.lat, lng: coords.lng }),
          domain: '.blinkit.com',
          path:   '/',
        },
      ])

      await page.goto(`https://blinkit.com/s/?q=${encodeURIComponent(query)}`, {
        waitUntil: 'domcontentloaded',
        timeout:   15_000,
      })
      await page.waitForSelector('.Product__Title, [data-test-id="product-name"]', {
        timeout: 10_000,
      })

      const items = await page.$$eval(
        '.product-container, [data-test-id="plp-product"]',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:      el.querySelector('.Product__Title, [data-test-id="product-name"]')
              ?.textContent?.trim() ?? '',
            price:      parseFloat(
              (
                el.querySelector('.Price-box__price, [data-test-id="product-price"]')
                  ?.textContent ?? '0'
              ).replace(/[^0-9.]/g, ''),
            ),
            mrp:        parseFloat(
              (el.querySelector('.strike-through-price')?.textContent ?? '0')
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
          platformId: 'blinkit',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://blinkit.com${item.url}`,
          stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
          delivery:   '10–20 min',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
