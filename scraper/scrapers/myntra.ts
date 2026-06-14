import type { Scraper, ScraperResult } from '../types'
import { absoluteProductUrl, isAccessDenied, withBrowserPage } from '../lib/browserContext'
import { withRetry } from '../lib/retry'

const FASHION_KEYWORDS = [
  'shirt', 'dress', 'shoes', 'kurta', 'jeans', 'saree', 'jacket', 'shorts',
  'tshirt', 't-shirt', 'leggings', 'suit', 'blazer', 'sneakers', 'sandals',
  'handbag', 'bag', 'watch', 'sunglasses', 'cap', 'hat',
]

function isFashionQuery(query: string): boolean {
  const q = query.toLowerCase()
  return FASHION_KEYWORDS.some((kw) => q.includes(kw))
}

function slugFromQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, '-')
}

export const myntra: Scraper = async ({ query, maxResults }) => {
  if (!isFashionQuery(query)) return []

  return withRetry(async () =>
    withBrowserPage(async (page) => {
      const slug = slugFromQuery(query)
      await page.goto(`https://www.myntra.com/${encodeURIComponent(slug)}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })

      const title = await page.title()
      const bodyText = await page.locator('body').innerText().catch(() => '')
      if (isAccessDenied(title, bodyText)) {
        throw new Error('Myntra blocked request')
      }

      await page.waitForSelector('a[href*="/buy"], li.product-base', {
        timeout: 20_000,
      })

      const items = await page.evaluate((max: number) => {
        const seen = new Set<string>()
        const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

        for (const a of Array.from(document.querySelectorAll('a[href*="/buy"]'))) {
          const href = (a as HTMLAnchorElement).getAttribute('href') || ''
          const idMatch = href.match(/\/(\d+)\/buy/)
          if (!idMatch) continue
          const id = idMatch[1]
          if (seen.has(id)) continue

          let card: Element | null = a.closest('li.product-base') ?? a.parentElement
          for (let i = 0; i < 8; i++) {
            if (!card) break
            if (/(₹|Rs)/.test(card.textContent || '')) break
            card = card.parentElement
          }
          if (!card) continue

          const cardText = (card.textContent || '').replace(/\s+/g, ' ').trim()
          const priceMatches = [...cardText.matchAll(/(?:₹|Rs\.)\s*([\d,]+)/g)]
          const priceEls = priceMatches
            .map((match) => parseFloat((match[1] ?? '0').replace(/,/g, '')))
            .filter((value) => value > 0)
          const price = priceEls[0] ?? 0
          const mrp = priceEls[1] && priceEls[1] > price ? priceEls[1] : undefined

          const brand = card.querySelector('.product-brand')?.textContent?.trim() ?? ''
          const product = card.querySelector('.product-product')?.textContent?.trim() ?? ''
          const parsedTitle =
            [brand, product].filter(Boolean).join(' ') ||
            cardText.split(/(?:₹|Rs\.)/)[0].trim()
          if (!parsedTitle) continue

          seen.add(id)
          results.push({
            title: parsedTitle,
            price,
            mrp,
            url: href,
          })

          if (results.length >= max) break
        }

        return results
      }, maxResults)

      return items
        .filter((item) => item.price > 0 && item.title)
        .map(
          (item) =>
            ({
              platformId: 'myntra',
              price: item.price,
              mrp: item.mrp,
              title: item.title,
              url: absoluteProductUrl('https://www.myntra.com', item.url),
              stock: 'in_stock' as const,
              delivery: 'Free · 4–7 days',
              returns: '30 days',
              scrapedAt: new Date().toISOString(),
            }) satisfies ScraperResult,
        )
    }),
  )
}
