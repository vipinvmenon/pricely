import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { pickBestPerPlatform, scoreProductRelevance, computeMatchConfidence } from './productMatch.ts'
import type { ScrapeResult } from '../../types/index.ts'

function scrapeResult(
  platformId: ScrapeResult['platformId'],
  title: string,
  price: number,
): ScrapeResult {
  return {
    platformId,
    title,
    price,
    url: 'https://example.com',
    stock: 'in_stock',
    scrapedAt: new Date().toISOString(),
  }
}

describe('scoreProductRelevance', () => {
  it('scores matching product titles higher than accessories', () => {
    const phone = scoreProductRelevance('Apple iPhone 15 Pro 128GB', 'iphone 15 pro')
    const caseScore = scoreProductRelevance('iPhone 15 Pro Silicone Case Cover', 'iphone 15 pro')

    assert.ok(phone > caseScore)
  })

  it('penalizes mismatched iPhone generations', () => {
    const gen15 = scoreProductRelevance('Apple iPhone 15 Pro', 'iphone 15 pro')
    const gen17 = scoreProductRelevance('Apple iPhone 17 Pro', 'iphone 15 pro')

    assert.ok(gen15 > gen17)
  })
})

describe('pickBestPerPlatform', () => {
  it('prefers the product listing over an accessory on the same platform', () => {
    const results = [
      scrapeResult('amazon', 'Sony WH-1000XM5 Wireless Headphones', 24_000),
      scrapeResult('amazon', 'Random USB Cable Pack', 299),
      scrapeResult('flipkart', 'Sony WH-1000XM5 Noise Cancelling', 24_500),
    ]

    const picked = pickBestPerPlatform(results, 'sony wh-1000xm5')
    assert.ok(picked.length >= 1)
    assert.equal(picked[0]?.title.toLowerCase().includes('sony'), true)
    assert.equal(picked.some((row) => row.platformId === 'amazon') && picked.find((row) => row.platformId === 'amazon')?.title.includes('Cable'), false)
  })
})

describe('computeMatchConfidence', () => {
  it('returns low confidence when matched listings disagree on variant', () => {
    const results = [
      scrapeResult('amazon', 'Apple iPhone 15 Pro 128GB', 120_000),
      scrapeResult('flipkart', 'Apple iPhone 15 Pro Max 256GB', 140_000),
      scrapeResult('croma', 'iPhone 15 Pro Silicone Case', 1_999),
    ]
    const matched = pickBestPerPlatform(results, 'iphone 15 pro')
    const { confidence, alternateMatches } = computeMatchConfidence(results, 'iphone 15 pro', matched)

    assert.notEqual(confidence, 'high')
    assert.ok(alternateMatches.length >= 2)
  })
})
