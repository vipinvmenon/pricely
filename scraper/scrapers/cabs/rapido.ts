import { chromium } from 'playwright'
import type { CabScraper, CabScraperResult } from '../../types'
import { withRetry } from '../../lib/retry'

export const rapido: CabScraper = async ({ from, to }) =>
  withRetry(async () => {
    const [fromLat, fromLng] = from.split(',').map(Number)
    const [toLat, toLng]     = to.split(',').map(Number)

    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()

    try {
      await page.goto(
        `https://rapido.bike/booking?slat=${fromLat}&slng=${fromLng}&dlat=${toLat}&dlng=${toLng}`,
        { waitUntil: 'domcontentloaded', timeout: 15_000 },
      )
      await page.waitForSelector('[class*="price"], .fare-amount, .ride-price', {
        timeout: 10_000,
      })

      const data = await page.$$eval(
        '[class*="rideCard"], [class*="RideCard"], .ride-option',
        els =>
          els.map(el => ({
            price:           parseFloat(
              (el.querySelector('[class*="price"], .fare')?.textContent ?? '0')
                .replace(/[^0-9.]/g, ''),
            ),
            eta:             el.querySelector('[class*="eta"], .time')?.textContent?.trim() ?? '',
            surgeMultiplier: parseFloat(
              (el.querySelector('[class*="surge"], .surge')?.textContent ?? '1')
                .replace(/[^0-9.]/g, ''),
            ) || undefined,
          })),
      )

      const best = data.filter(d => d.price > 0).sort((a, b) => a.price - b.price)[0]

      return {
        platformId:      'rapido',
        price:           best?.price ?? estimateFare(fromLat, fromLng, toLat, toLng, 7),
        eta:             best?.eta || '5 min',
        surgeMultiplier: best?.surgeMultiplier,
        bookUrl:         `https://rapido.bike`,
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
  const base   = 35
  return Math.round(base + distKm * ratePerKm)
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
