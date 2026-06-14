import type { Scraper, ScraperResult } from '../types'
import { withRetry } from '../lib/retry'

interface GraphQlProduct {
  sku: string
  name: string
  url_key: string
  price_range: {
    minimum_price: {
      final_price: { value: number }
      regular_price: { value: number }
    }
  }
}

interface GraphQlResponse {
  data?: {
    products?: {
      items?: GraphQlProduct[]
    }
  }
  errors?: { message: string }[]
}

async function searchViaGraphQl(
  query: string,
  maxResults: number,
): Promise<ScraperResult[]> {
  const gql = `
    query ($search: String!, $pageSize: Int!) {
      products(search: $search, pageSize: $pageSize) {
        items {
          sku
          name
          url_key
          price_range {
            minimum_price {
              final_price { value }
              regular_price { value }
            }
          }
        }
      }
    }
  `

  const variables = { search: query, pageSize: maxResults }
  const url = new URL('https://www.vijaysales.com/api/graphql')
  url.searchParams.set('query', gql)
  url.searchParams.set('variables', JSON.stringify(variables))

  const res = await fetch(url, {
    headers: {
      Store: 'vijay_sales',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    throw new Error(`Vijay Sales GraphQL responded ${res.status}`)
  }

  const payload = (await res.json()) as GraphQlResponse
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? 'Vijay Sales GraphQL error')
  }

  const items = payload.data?.products?.items ?? []

  return items
    .map((item) => {
      const price = item.price_range.minimum_price.final_price.value
      const regular = item.price_range.minimum_price.regular_price.value
      const mrp = regular > price ? regular : undefined

      return {
        platformId: 'vijay_sales',
        price,
        mrp,
        title: item.name,
        url: `https://www.vijaysales.com/${item.url_key}`,
        stock: 'in_stock' as const,
        delivery: '2–4 days',
        returns: '7 days',
        scrapedAt: new Date().toISOString(),
      } satisfies ScraperResult
    })
    .filter((item) => item.price > 0 && item.title)
}

export const vijay_sales: Scraper = async ({ query, maxResults }) =>
  withRetry(() => searchViaGraphQl(query, maxResults))
