export type AnalyticsEvent =
  | 'search_submitted'
  | 'compare_viewed'
  | 'compare_refreshed'
  | 'product_tracked'
  | 'alert_created'
  | 'alert_journey_pending'
  | 'alert_journey_flushed'
  | 'alert_journey_failed'
  | 'retailer_clicked'
  | 'variant_confirmed'

type EventPayload = Record<string, string | number | boolean | null | undefined>

/** Privacy-conscious client analytics — no PII in payloads. */
export function trackEvent(event: AnalyticsEvent, payload: EventPayload = {}): void {
  if (typeof window === 'undefined') return

  const body = {
    event,
    payload,
    ts: new Date().toISOString(),
    path: window.location.pathname,
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[pricely analytics]', body)
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    // Analytics must never block user actions.
  })
}
