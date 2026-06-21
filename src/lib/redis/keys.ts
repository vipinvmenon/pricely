import { normalizeQuery } from '@/lib/utils/format'

export const keys = {
  compare:      (productId: string, city: string) => `compare:${productId}:${city}`,
  compareQuery: (query: string, city: string)     => `compare:q:${normalizeQuery(query).toLowerCase()}:${city}`,
  trending:  (city: string)                     => `trending:${city}`,
  trips:     (from: string, to: string, city: string) => `trips:${from}:${to}:${city}`,
  watchlist: (userId: string)                   => `watchlist:${userId}`,
  search:    (query: string, city: string)       => `search:${query}:${city}`,
} as const

export const TTL = {
  compare:   300,   // 5 min
  trending:  600,   // 10 min
  trips:     120,   // 2 min
  watchlist: 60,    // 1 min
  search:    180,   // 3 min
} as const
