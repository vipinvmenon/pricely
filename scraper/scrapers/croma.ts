import type { Scraper, ScraperResult } from '../types'
import { isAccessDenied, withBrowserPage } from '../lib/browserContext'
import { withRetry } from '../lib/retry'

const PINCODE = '400001'

async function ensurePincode(page: import('playwright').Page): Promise<void> {
  await page.goto('https://www.croma.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  })

  const title = await page.title()
  const bodyText = await page.locator('body').innerText()
  if (isAccessDenied(title, bodyText)) {
    throw new Error('Croma blocked request (Akamai Access Denied)')
  }

  const pinInput = page.locator('input[maxlength="6"]').first()
  if ((await pinInput.count()) > 0) {
    await pinInput.fill(PINCODE).catch(() => undefined)
    await page
      .getByRole('button', { name: /continue/i })
      .click({ timeout: 8_000 })
      .catch(() => undefined)
    await page.waitForTimeout(2_000)
  }
}

function searchUrl(query: string): string {
  const params = new URLSearchParams({
    q: `${query}:relevance`,
    text: query,
  })
  return `https://www.croma.com/searchB?${params.toString()}`
}

export const croma: Scraper = async ({ query, maxResults }) =>
  withRetry(async () =>
    withBrowserPage(async (page) => {
      await ensurePincode(page)

      await page.goto(searchUrl(query), {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })

      const title = await page.title()
      const bodyText = await page.locator('body').innerText()
      if (isAccessDenied(title, bodyText)) {
        throw new Error('Croma blocked request (Akamai Access Denied)')
      }

      await page
        .waitForSelector('a[href*="/p/"]', { timeout: 20_000 })
        .catch(() => undefined)

      const items = await page.evaluate((max: number) => {
        const seen = new Set<string>()
        const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

        for (const a of Array.from(document.querySelectorAll('a[href*="/p/"]'))) {
          const href = (a as HTMLAnchorElement).href.split('?')[0]
          const idMatch = href.match(/\/p\/(\d+)/)
          if (!idMatch) continue
          const id = idMatch[1]
          if (seen.has(id)) continue

          const titleRaw = (a as HTMLAnchorElement).textContent?.replace(/\s+/g, ' ').trim() ?? ''
          if (titleRaw.length < 10) continue

          let card: Element | null = a.closest('.product-wrap') ?? a.parentElement
          for (let i = 0; i < 10; i++) {
            if (!card) break
            if (card.textContent?.includes('₹')) break
            card = card.parentElement
          }

          const cardText = (card?.textContent ?? '').replace(/\s+/g, ' ').trim()
          const prices = [...cardText.matchAll(/₹\s*([\d,]+(?:\.\d+)?)/g)]
            .map((match) => parseFloat((match[1] ?? '0').replace(/,/g, '')))
            .filter((value) => value > 0)

          const price = prices[0] ?? 0
          const mrp = prices[1] && prices[1] > price ? prices[1] : undefined
          const title = titleRaw.split('₹')[0].trim()

          seen.add(id)
          results.push({ title, price, mrp, url: href })

          if (results.length >= max) break
        }

        return results
      }, maxResults)

      return items
        .filter((item) => item.price > 0 && item.title)
        .map(
          (item) =>
            ({
              platformId: 'croma',
              price: item.price,
              mrp: item.mrp,
              title: item.title,
              url: item.url,
              stock: 'in_stock' as const,
              delivery: '3–5 days',
              returns: '7 days',
              scrapedAt: new Date().toISOString(),
            }) satisfies ScraperResult,
        )
    }),
  )
