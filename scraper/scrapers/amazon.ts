import { createHmac, createHash } from 'crypto'
import { chromium } from 'playwright'
import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

const REGION = 'us-east-1'
const HOST   = 'webservices.amazon.in'

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function sha256Hex(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

function getSigningKey(secret: string, dateStamp: string): Buffer {
  const kDate    = hmacSha256(`AWS4${secret}`, dateStamp)
  const kRegion  = hmacSha256(kDate, REGION)
  const kService = hmacSha256(kRegion, 'ProductAdvertisingAPI')
  return hmacSha256(kService, 'aws4_request')
}

async function searchViaApi(
  query: string,
  maxResults: number,
  credentials: { accessKey: string; secretKey: string; partnerTag: string },
): Promise<ScraperResult[]> {
  const body = JSON.stringify({
    Keywords:     query,
    Resources:    [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Offers.Listings.Availability',
      'DetailPageURL',
    ],
    PartnerTag:   credentials.partnerTag,
    PartnerType:  'Associates',
    Marketplace:  'www.amazon.in',
    ItemCount:    maxResults,
  })

  const now         = new Date()
  const amzDate     = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const dateStamp   = amzDate.slice(0, 8)
  const amzTarget   = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
  const contentType = 'application/json; charset=utf-8'

  const canonicalHeaders =
    `content-type:${contentType}\nhost:${HOST}\nx-amz-date:${amzDate}\nx-amz-target:${amzTarget}\n`
  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target'
  const payloadHash   = sha256Hex(body)
  const canonicalRequest = [
    'POST', '/paapi5/searchitems', '',
    canonicalHeaders, signedHeaders, payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/${REGION}/ProductAdvertisingAPI/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, credentialScope, sha256Hex(canonicalRequest),
  ].join('\n')

  const signingKey  = getSigningKey(credentials.secretKey, dateStamp)
  const signature   = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authHeader  =
    `AWS4-HMAC-SHA256 Credential=${credentials.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(`https://${HOST}/paapi5/searchitems`, {
    method:  'POST',
    headers: {
      'Content-Type': contentType,
      'Host':         HOST,
      'X-Amz-Date':   amzDate,
      'X-Amz-Target': amzTarget,
      'Authorization': authHeader,
    },
    body,
    signal: AbortSignal.timeout(10_000),
  })

  if (res.status === 429) throw Object.assign(new Error('TooManyRequests'), { retryable: false })
  if (!res.ok) throw new Error(`PA API responded ${res.status}`)

  type PaApiItem = {
    ASIN: string
    DetailPageURL: string
    ItemInfo?: { Title?: { DisplayValue?: string } }
    Offers?: {
      Listings?: Array<{
        Price?: { Amount?: number }
        SavingBasis?: { Amount?: number }
        Availability?: { Type?: string }
      }>
    }
  }

  const json = (await res.json()) as { SearchResult?: { Items?: PaApiItem[] } }
  const items = json.SearchResult?.Items ?? []

  return items.map(item => {
    const listing  = item.Offers?.Listings?.[0]
    const price    = listing?.Price?.Amount ?? 0
    const mrp      = listing?.SavingBasis?.Amount
    const avail    = listing?.Availability?.Type ?? 'Now'
    const stock    = avail === 'Now' ? 'in_stock' : avail === 'IncludingPreorder' ? 'low_stock' : 'out_of_stock'
    return {
      platformId: 'amazon',
      price,
      mrp,
      title:      item.ItemInfo?.Title?.DisplayValue ?? query,
      url:        item.DetailPageURL ?? `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
      stock,
      delivery:   'Free · 1–2 days',
      returns:    '10 days',
      scrapedAt:  new Date().toISOString(),
    } satisfies ScraperResult
  })
}

async function searchViaPlaywright(query: string, maxResults: number): Promise<ScraperResult[]> {
  const browser = await chromium.launch({ headless: true })
  const page    = await browser.newPage()
  try {
    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
      timeout:   12_000,
    })
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 8_000 })

    const items = await page.$$eval(
      '[data-component-type="s-search-result"]',
      (els, max) =>
        els.slice(0, max).map(el => ({
          title: el.querySelector('h2 span')?.textContent?.trim() ?? '',
          price: parseFloat(
            (el.querySelector('.a-price .a-offscreen')?.textContent ?? '0').replace(/[^0-9.]/g, ''),
          ),
          mrp: parseFloat(
            (el.querySelector('.a-text-strike')?.textContent ?? '0').replace(/[^0-9.]/g, ''),
          ) || undefined,
          url: (el.querySelector('h2 a') as HTMLAnchorElement | null)?.href ?? '',
          outOfStock: !!el.querySelector('[class*="out-of-stock"]'),
        })),
      maxResults,
    )

    return items
      .filter(item => item.price > 0)
      .map(item => ({
        platformId: 'amazon',
        price:      item.price,
        mrp:        item.mrp,
        title:      item.title,
        url:        item.url,
        stock:      item.outOfStock ? ('out_of_stock' as const) : ('in_stock' as const),
        delivery:   'Free · 1–2 days',
        returns:    '10 days',
        scrapedAt:  new Date().toISOString(),
      }))
  } finally {
    await browser.close()
  }
}

export const amazon: Scraper = async ({ query, maxResults }) => {
  const accessKey  = process.env.AMAZON_ACCESS_KEY
  const secretKey  = process.env.AMAZON_SECRET_KEY
  const partnerTag = process.env.AMAZON_PARTNER_TAG

  if (accessKey && secretKey && partnerTag) {
    return withRetry(() => searchViaApi(query, maxResults, { accessKey, secretKey, partnerTag }))
  }

  return withRetry(() => searchViaPlaywright(query, maxResults))
}
