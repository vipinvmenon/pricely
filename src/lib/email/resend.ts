interface PriceDropEmailParams {
  to:           string
  productTitle: string
  targetPrice:  number
  currentPrice: number
  retailerName: string
  buyUrl:       string
}

function buildEmailHtml(params: PriceDropEmailParams): string {
  const current = params.currentPrice.toLocaleString('en-IN')
  const target  = params.targetPrice.toLocaleString('en-IN')
  return `
    <h2>Your target price was hit</h2>
    <p><strong>${params.productTitle}</strong></p>
    <p>Current price on ${params.retailerName}:
       <strong>₹${current}</strong></p>
    <p>Your target was ₹${target}</p>
    <a href="${params.buyUrl}">Buy now →</a>
  `
}

export async function sendPriceDropEmail(params: PriceDropEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[email] RESEND_API_KEY not set — skipping email to', params.to)
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  await resend.emails.send({
    from:    'Pricely <onboarding@resend.dev>',
    to:      params.to,
    subject: `Price drop: ${params.productTitle} is now ₹${params.currentPrice.toLocaleString('en-IN')}`,
    html:    buildEmailHtml(params),
  })
}
