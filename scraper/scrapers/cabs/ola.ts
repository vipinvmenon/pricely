import { chromium } from 'playwright'
import type { CabScraper, CabScraperResult } from '../../types'
import { withRetry } from '../../lib/retry'

export const ola: CabScraper = async ({ from, to }) =>
  withRetry(async () => {
    const [fromLat, fromLng] = from.split(',').map(Number)
    const [toLat, toLng]     = to.split(',').map(Number)

    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()

    try {
      await page.goto(
        `https://book.olacabs.com/?lat=${fromLat}&lng=${fromLng}&drop_lat=${toLat}&drop_lng=${toLng}`,
        { waitUntil: 'domcontentloaded', timeout: 20_000 },
      )
      await page.waitForSelector('.ride-type, [class*="rideType"], [class*="RideType"]', {
        timeout: 12_000,
      })

      const options = await page.$$eval(
        '.ride-type, [class*="rideType"], .booking-widget-categories__item',
        els =>
          els.map(el => ({
            price: parseFloat(
              (el.querySelector('.fare, .price, [class*="price"]')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ),
            eta:           el.querySelector('.eta, .time, [class*="eta"]')
              ?.textContent?.trim() ?? '',
            surgeMultiplier: parseFloat(
              (el.querySelector('[class*="surge"]')?.textContent ?? '1').replace(/[^0-9.]/g, ''),
            ) || undefined,
          })),
      )

      const best = options.filter(o => o.price > 0).sort((a, b) => a.price - b.price)[0]

      return {
        platformId:      'ola',
        price:           best?.price ?? estimateFare(fromLat, fromLng, toLat, toLng, 11),
        eta:             best?.eta || '7 min',
        surgeMultiplier: best?.surgeMultiplier,
        bookUrl:         `https://book.olacabs.com/?lat=${fromLat}&lng=${fromLng}&drop_lat=${toLat}&drop_lng=${toLng}`,
        scrapedAt:       new Date().toISOString(),
      } satisfies CabScraperResult
    } finally {
      await browser.close()
    }
  })

function estimateFare(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  ratePerKm: number,
): number {
  const R    = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const distKm = 2 * R * Math.asin(Math.sqrt(a))
  const base   = 45
  return Math.round(base + distKm * ratePerKm)
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
