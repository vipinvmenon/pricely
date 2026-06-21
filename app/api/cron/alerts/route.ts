import { NextResponse } from 'next/server'
import { alertsService } from '@/services/alertsService'
import { compareService } from '@/services/compareService'
import { sendPriceDropEmail } from '@/lib/email/resend'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const alerts = await alertsService.getActiveAlerts()

  for (const alert of alerts) {
    try {
      const result = await compareService.compareByProductId(alert.product_id, alert.city)
      const lowestPrice = result.retailers[0]?.price
      if (!lowestPrice) continue

      if (lowestPrice <= alert.target_price) {
        await sendPriceDropEmail({
          to:           alert.userEmail,
          productTitle: alert.productTitle,
          targetPrice:  alert.target_price,
          currentPrice: lowestPrice,
          retailerName: result.retailers[0].name,
          buyUrl:       result.retailers[0].buyUrl,
        })
        await alertsService.markAlertTriggered(alert.id)
      }
    } catch {
      // Individual alert failures must not abort the batch
    }
  }

  return NextResponse.json({ processed: alerts.length })
}
