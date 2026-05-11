export const SWR_CONFIG = {
  refreshInterval:       300_000,  // 5 min polling
  revalidateOnFocus:     false,    // avoid noisy re-fetches on tab switch
  revalidateOnReconnect: true,
  dedupingInterval:      10_000,
  shouldRetryOnError:    false,
} as const
