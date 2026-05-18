import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

const FASHION_KEYWORDS = [
  'shirt', 'dress', 'shoes', 'kurta', 'jeans', 'saree', 'jacket', 'shorts',
  'tshirt', 't-shirt', 'leggings', 'suit', 'blazer', 'sneakers', 'sandals',
  'handbag', 'bag', 'watch', 'sunglasses', 'cap', 'hat',
]

function isFashionQuery(query: string): boolean {
  const q = query.toLowerCase()
  return FASHION_KEYWORDS.some(kw => q.includes(kw))
}

export const myntra: Scraper = async ({ query, maxResults }) => {
  if (!isFashionQuery(query)) return []

  return withRetry(async () => {
    const browser = await chromium.launch({ headless: true })
    const page    = await browser.newPage()
    try {
      const slug = query.toLowerCase().replace(/\s+/g, '-')
      await page.goto(
        `https://www.myntra.com/${encodeURIComponent(slug)}`,
        { waitUntil: 'domcontentloaded', timeout: 15_000 },
      )
      await page.waitForSelector('.product-base, [class*="product-productMetaInfo"]', {
        timeout: 10_000,
      })

      const items = await page.$$eval(
        '.product-base',
        (els, max) =>
          els.slice(0, max).map(el => ({
            title:   el.querySelector('.product-product, h4.product-product')?.textContent?.trim()
              ?? el.querySelector('[class*="productMetaInfo-brand"]')?.textContent?.trim()
              ?? '',
            price:   parseFloat(
              (el.querySelector('.product-discountedPrice, strong.product-discountedPrice')
                ?.textContent ?? '0').replace(/[^0-9.]/g, ''),
            ),
            mrp:     parseFloat(
              (el.querySelector('.product-strike')?.textContent ?? '0').replace(/[^0-9.]/g, ''),
            ) || undefined,
            url:     (el.querySelector('a') as HTMLAnchorElement | null)?.href ?? '',
          })),
        maxResults,
      )

      return items
        .filter(item => item.price > 0 && item.title)
        .map(item => ({
          platformId: 'myntra',
          price:      item.price,
          mrp:        item.mrp,
          title:      item.title,
          url:        item.url.startsWith('http')
            ? item.url
            : `https://www.myntra.com${item.url}`,
          stock:      'in_stock' as const,
          delivery:   'Free · 4–7 days',
          returns:    '30 days',
          scrapedAt:  new Date().toISOString(),
        } satisfies ScraperResult))
    } finally {
      await browser.close()
    }
  })
}
