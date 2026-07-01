import type { Scraper, ScraperResult } from '../types'
import { withBrowserPage } from '../lib/browserContext'
import { withRetry } from '../lib/retry'

export const tata_cliq: Scraper = async ({ query, maxResults }) =>
  withRetry(async () =>
    withBrowserPage(async (page) => {
      await page.goto(
        `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(query)}`,
        { waitUntil: 'domcontentloaded', timeout: 30_000 },
      )
      await page.waitForSelector('a[href*="/p-"]', { timeout: 20_000 })

      const items = await page.evaluate((max: number) => {
        const seen = new Set<string>()
        const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

        for (const a of Array.from(document.querySelectorAll('a[href*="/p-"]'))) {
          const href  = (a as HTMLAnchorElement).getAttribute('href') || ''
          const idMatch = href.match(/\/p-([a-z0-9]+)/i)
          if (!idMatch) continue
          const id = idMatch[1]
          if (seen.has(id)) continue

          let card: Element | null = a.parentElement
          for (let i = 0; i < 8; i++) {
            if (!card) break
            if (card.textContent?.includes('₹')) break
            card = card.parentElement
          }
          if (!card) continue

          const cardText = (card.textContent || '').replace(/\s+/g, ' ').trim()
          const title = cardText
            .split('₹')[0]
            .replace(/^quick view\s*/i, '')
            .replace(/^([A-Za-z]+)\1(?=[A-Z\s])/, '$1')
            .trim()
          if (!title) continue

          const priceEls = Array.from(card.querySelectorAll('*'))
            .filter(el => el.children.length === 0 && (el.textContent?.trim() || '').startsWith('₹'))
            .map(el => parseFloat((el.textContent || '0').replace(/[^0-9.]/g, '')))
            .filter(n => n > 0)

          const price = priceEls[0] ?? 0
          const mrp   = priceEls[1] && priceEls[1] > price ? priceEls[1] : undefined

          seen.add(id)
          const path = href.split('?')[0]
          results.push({
            title,
            price,
            mrp,
            url: path.startsWith('http') ? path : 'https://www.tatacliq.com' + path,
          })

          if (results.length >= max) break
        }
        return results
      }, maxResults)

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'tata_cliq',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url,
          stock:      'in_stock' as const,
          delivery:   '3–5 days',
          returns:    '10 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    }),
  )
