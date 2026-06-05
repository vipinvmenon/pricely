import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

async function searchViaApi(
  query: string,
  maxResults: number,
  credentials: { affiliateId: string; affiliateToken: string },
): Promise<ScraperResult[]> {
  const url = `https://affiliate-api.flipkart.io/affiliate/search/json?query=${encodeURIComponent(query)}&resultCount=${maxResults}&trackingId=${credentials.affiliateId}`

  const res = await fetch(url, {
    headers: {
      'Fk-Affiliate-Id':    credentials.affiliateId,
      'Fk-Affiliate-Token': credentials.affiliateToken,
    },
    signal: AbortSignal.timeout(10_000),
  })

  if (res.status === 401) throw Object.assign(new Error('Flipkart affiliate unauthorized'), { retryable: false })
  if (!res.ok) throw new Error(`Flipkart affiliate API responded ${res.status}`)

  type FkProduct = {
    productBaseInfoV1?: {
      title?: string
      flipkartSpecialPrice?: number
      mrp?: number
      productUrl?: string
      stockInfo?: { availability?: string }
    }
  }

  const json = (await res.json()) as { products?: FkProduct[] }
  const products = json.products ?? []

  return products.slice(0, maxResults).map(p => {
    const info   = p.productBaseInfoV1 ?? {}
    const avail  = info.stockInfo?.availability ?? 'Available'
    const stock  = avail === 'Available' ? ('in_stock' as const) : ('out_of_stock' as const)
    return {
      platformId: 'flipkart',
      price:      info.flipkartSpecialPrice ?? 0,
      mrp:        info.mrp,
      title:      info.title ?? query,
      url:        info.productUrl ?? `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
      stock,
      delivery:   'Free · 2–4 days',
      returns:    '10 days',
      scrapedAt:  new Date().toISOString(),
    } satisfies ScraperResult
  }).filter(r => r.price > 0)
}

async function searchViaPlaywright(query: string, maxResults: number): Promise<ScraperResult[]> {
  const browser = await chromium.launch({ headless: true })
  const page    = await browser.newPage()
  try {
    await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
      timeout:   25_000,
    })
    await page.waitForSelector('a[href*="/p/itm"]', { timeout: 15_000 })

    const items = await page.evaluate((max: number) => {
      const seen = new Set<string>()
      const results: { title: string; price: number; mrp: number | undefined; url: string }[] = []

      for (const a of Array.from(document.querySelectorAll('a[href*="/p/itm"]'))) {
        const title = (a as HTMLAnchorElement).textContent?.trim() || ''
        const href  = (a as HTMLAnchorElement).getAttribute('href') || ''
        if (!title || seen.has(href)) continue
        seen.add(href)

        // Walk up to find a container that has price text
        let card: Element | null = a.parentElement
        for (let i = 0; i < 8; i++) {
          if (!card) break
          if (card.textContent?.includes('₹')) break
          card = card.parentElement
        }
        if (!card) continue

        // Extract leaf elements starting with ₹ — first is current price, second is MRP
        const priceEls = Array.from(card.querySelectorAll('*'))
          .filter(el => el.children.length === 0 && (el.textContent?.trim() || '').startsWith('₹'))
          .map(el => parseFloat((el.textContent || '0').replace(/[^0-9.]/g, '')))
          .filter(n => n > 0)

        const price = priceEls[0] ?? 0
        const mrp   = priceEls[1] && priceEls[1] > price ? priceEls[1] : undefined

        results.push({
          title,
          price,
          mrp,
          url: href.startsWith('http') ? href : 'https://www.flipkart.com' + href,
        })

        if (results.length >= max) break
      }

      return results
    }, maxResults)

    return items
      .filter(item => item.price > 0 && item.title)
      .map(item => ({
        platformId: 'flipkart',
        price:      item.price,
        mrp:        item.mrp,
        title:      item.title,
        url:        item.url,
        stock:      'in_stock' as const,
        delivery:   'Free · 2–4 days',
        returns:    '10 days',
        scrapedAt:  new Date().toISOString(),
      }))
  } finally {
    await browser.close()
  }
}

export const flipkart: Scraper = async ({ query, maxResults }) => {
  const affiliateId    = process.env.FLIPKART_AFFILIATE_ID
  const affiliateToken = process.env.FLIPKART_AFFILIATE_TOKEN

  if (affiliateId && affiliateToken) {
    return withRetry(() => searchViaApi(query, maxResults, { affiliateId, affiliateToken }))
  }

  return withRetry(() => searchViaPlaywright(query, maxResults))
}
