import { NextResponse } from 'next/server'
import { unauthorized } from '@/lib/api/request'
import { alertsService } from '@/services/alertsService'
import { compareService } from '@/services/compareService'
import { sendPriceDropEmail } from '@/lib/email/resend'
import type { CronResult } from '@/types'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return unauthorized()
  }

  const alerts = await alertsService.getActiveAlerts()
  let triggered = 0

  for (const alert of alerts) {
    try {
      const result = await compareService.compareByProductId(alert.product_id, alert.city)
      // Lowest available priced retailer (skip "not listed" placeholders).
      const lowestPrice = result.retailers.find((r) => r.available !== false && r.price > 0)
      if (!lowestPrice) continue

      if (lowestPrice.price <= alert.target_price) {
        await sendPriceDropEmail({
          to:           alert.userEmail,
          productTitle: alert.productTitle,
          targetPrice:  alert.target_price,
          currentPrice: lowestPrice.price,
          retailerName: lowestPrice.name,
          buyUrl:       lowestPrice.buyUrl,
        })
        await alertsService.markAlertTriggered(alert.id)
        triggered += 1
      }
    } catch {
      // Individual alert failures must not abort the batch
    }
  }

  const body: CronResult = { processed: alerts.length, triggered }
  return NextResponse.json(body)
}
