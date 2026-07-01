function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export type EmailDeliveryResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: 'missing_api_key' | 'invalid_url' | 'provider_error'; message: string }

interface PriceDropEmailParams {
  to:           string
  productTitle: string
  targetPrice:  number
  currentPrice: number
  retailerName: string
  buyUrl:       string
}

function buildEmailHtml(params: PriceDropEmailParams): string {
  const title = escapeHtml(params.productTitle)
  const retailer = escapeHtml(params.retailerName)
  const current = escapeHtml(params.currentPrice.toLocaleString('en-IN'))
  const target = escapeHtml(params.targetPrice.toLocaleString('en-IN'))
  const buyUrl = isSafeHttpUrl(params.buyUrl) ? escapeHtml(params.buyUrl) : '#'

  return `
    <h2>Your target price was hit</h2>
    <p><strong>${title}</strong></p>
    <p>Current price on ${retailer}:
       <strong>₹${current}</strong></p>
    <p>Your target was ₹${target}</p>
    <a href="${buyUrl}">Buy now →</a>
  `
}

export function resolveResendFromAddress(): {
  from: string
  usingSandboxDefault: boolean
} {
  const configured = process.env.RESEND_FROM_EMAIL?.trim()
  if (configured) {
    return { from: configured, usingSandboxDefault: false }
  }
  return {
    from: 'Pricely <onboarding@resend.dev>',
    usingSandboxDefault: true,
  }
}

export async function sendPriceDropEmail(params: PriceDropEmailParams): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      reason: 'missing_api_key',
      message: 'RESEND_API_KEY is not configured',
    }
  }

  if (!isSafeHttpUrl(params.buyUrl)) {
    return {
      ok: false,
      reason: 'invalid_url',
      message: 'Retailer buy URL is missing or invalid',
    }
  }

  const { from, usingSandboxDefault } = resolveResendFromAddress()
  if (usingSandboxDefault && process.env.NODE_ENV === 'production') {
    const { logWarn } = await import('@/lib/observability/logger')
    logWarn('resend_sandbox_from_in_production', {
      hint: 'Set RESEND_FROM_EMAIL to a verified Pricely domain before launch.',
    })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const subjectTitle = params.productTitle.replace(/[\r\n<>]/g, ' ').slice(0, 120)
    const response = await resend.emails.send({
      from,
      to:      params.to,
      subject: `Price drop: ${subjectTitle} is now ₹${params.currentPrice.toLocaleString('en-IN')}`,
      html:    buildEmailHtml(params),
    })

    const messageId = response.data?.id
    if (!messageId) {
      return {
        ok: false,
        reason: 'provider_error',
        message: response.error?.message ?? 'Resend did not return a message id',
      }
    }

    return { ok: true, messageId }
  } catch (err) {
    return {
      ok: false,
      reason: 'provider_error',
      message: err instanceof Error ? err.message : 'Email provider error',
    }
  }
}

export const emailTestUtils = { escapeHtml, isSafeHttpUrl, resolveResendFromAddress }
