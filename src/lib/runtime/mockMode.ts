export function shouldUseMockData(): boolean {
  if (process.env.PRICELY_USE_MOCK_DATA === '1') return true
  if (process.env.PRICELY_USE_MOCK_DATA === '0') return false
  return process.env.NODE_ENV === 'development'
}
