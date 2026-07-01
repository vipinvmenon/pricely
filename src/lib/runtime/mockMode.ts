export function shouldUseMockData(): boolean {
  if (process.env.PRICELY_USE_MOCK_DATA === '1') return true
  if (process.env.PRICELY_USE_MOCK_DATA === '0') return false
  return process.env.NODE_ENV === 'development'
}

export function isScraperConfigured(): boolean {
  return Boolean(process.env.SCRAPER_SERVICE_URL?.trim())
}

/** Demo/mock responses are only allowed when mock mode is explicitly enabled. */
export function canServeMockData(): boolean {
  return shouldUseMockData()
}

export class ScraperNotConfiguredError extends Error {
  constructor() {
    super('SCRAPER_SERVICE_URL is not configured')
    this.name = 'ScraperNotConfiguredError'
  }
}

export function assertScraperAvailable(): void {
  if (canServeMockData()) return
  if (!isScraperConfigured()) {
    throw new ScraperNotConfiguredError()
  }
}
