import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import {
  canServeMockData,
  isScraperConfigured,
  ScraperNotConfiguredError,
  shouldUseMockData,
} from './mockMode.ts'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('mockMode', () => {
  it('enables mock data in development by default', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.PRICELY_USE_MOCK_DATA
    assert.equal(shouldUseMockData(), true)
    assert.equal(canServeMockData(), true)
  })

  it('forces mock data when PRICELY_USE_MOCK_DATA=1', () => {
    process.env.NODE_ENV = 'production'
    process.env.PRICELY_USE_MOCK_DATA = '1'
    assert.equal(shouldUseMockData(), true)
    assert.equal(canServeMockData(), true)
  })

  it('disables mock data in production unless explicitly enabled', () => {
    process.env.NODE_ENV = 'production'
    process.env.PRICELY_USE_MOCK_DATA = '0'
    assert.equal(shouldUseMockData(), false)
    assert.equal(canServeMockData(), false)
  })

  it('detects scraper configuration from SCRAPER_SERVICE_URL', () => {
    delete process.env.SCRAPER_SERVICE_URL
    assert.equal(isScraperConfigured(), false)

    process.env.SCRAPER_SERVICE_URL = 'http://localhost:3001'
    assert.equal(isScraperConfigured(), true)
  })

  it('throws ScraperNotConfiguredError with a stable name', () => {
    const err = new ScraperNotConfiguredError()
    assert.equal(err.name, 'ScraperNotConfiguredError')
  })
})
