/**
 * Serviceable cities for v1.
 *
 * There is no city-selector UI yet (deferred to v1.1). City is auto-detected
 * from the Vercel edge header and coerced against this allowlist, defaulting
 * to Mumbai when the value is unknown or unsupported.
 */
export const SUPPORTED_CITIES = [
  'mumbai',
  'delhi',
  'bangalore',
  'hyderabad',
  'chennai',
  'pune',
] as const

export type City = (typeof SUPPORTED_CITIES)[number]

export const DEFAULT_CITY: City = 'mumbai'

export const DEFAULT_COMPARE_QUERY = 'sony wh-1000xm5'

/** How often active price alerts are checked in production cron. */
export const ALERT_CHECK_INTERVAL_MINUTES = 15

export const ALERT_CHECK_INTERVAL_LABEL = `every ${ALERT_CHECK_INTERVAL_MINUTES} minutes`

/** Returns true when the value is a recognised, serviceable city slug. */
export function isSupportedCity(value: string): value is City {
  return (SUPPORTED_CITIES as readonly string[]).includes(value)
}

/**
 * Normalise an arbitrary city input to a supported city slug.
 * Falls back to {@link DEFAULT_CITY} for anything unrecognised.
 */
export function coerceCity(value: string | null | undefined): City {
  if (!value) return DEFAULT_CITY
  const slug = value.trim().toLowerCase()
  return isSupportedCity(slug) ? slug : DEFAULT_CITY
}
