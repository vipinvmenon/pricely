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
    await page.waitForSelector('[data-id]', { timeout: 15_000 })

    const items = await page.$$eval(
      '[data-id]',
      (els, max) =>
        els.slice(0, max).map(el => ({
          title: (
            el.querySelector('[class*="KzDlHZ"],[class*="IRpwTa"],[class*="s1Q9rs"],[class*="WKTcLC"],[class*="RcXBOT"]')
          )?.textContent?.trim() ?? '',
          price: parseFloat(
            (el.querySelector('[class*="Nx9bqj"],[class*="_30jeq3"],[class*="hl05eU"]')?.textContent ?? '0').replace(/[^0-9.]/g, ''),
          ),
          mrp: parseFloat(
            (el.querySelector('[class*="_3I9_wc"],[class*="yRaY8j"]')?.textContent ?? '0').replace(/[^0-9.]/g, ''),
          ) || undefined,
          url: (() => {
            const a = el.querySelector('a[href]') as HTMLAnchorElement | null
            if (!a) return ''
            const href = a.getAttribute('href') || ''
            return href.startsWith('http') ? href : 'https://www.flipkart.com' + href
          })(),
          outOfStock: !!el.querySelector('[class*="out-of-stock"]'),
        })),
      maxResults,
    )

    return items
      .filter(item => item.price > 0 && item.title)
      .map(item => ({
        platformId: 'flipkart',
        price:      item.price,
        mrp:        item.mrp,
        title:      item.title,
        url:        item.url.startsWith('http') ? item.url : `https://www.flipkart.com${item.url}`,
        stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
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
