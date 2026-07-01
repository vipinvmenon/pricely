import { NextResponse } from 'next/server'
import { unauthorized } from '@/lib/api/request'
import { logError, logInfo, logWarn } from '@/lib/observability/logger'
import { alertsService } from '@/services/alertsService'
import { compareService } from '@/services/compareService'
import { sendPriceDropEmail } from '@/lib/email/resend'
import type { CronResult } from '@/types'

type ActiveAlert = Awaited<ReturnType<typeof alertsService.getActiveAlerts>>[number]

function groupAlertsByProductCity(alerts: ActiveAlert[]): Map<string, ActiveAlert[]> {
  const grouped = new Map<string, ActiveAlert[]>()
  for (const alert of alerts) {
    const key = `${alert.product_id}:${alert.city}`
    const batch = grouped.get(key) ?? []
    batch.push(alert)
    grouped.set(key, batch)
  }
  return grouped
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return unauthorized()
  }

  const alerts = await alertsService.getActiveAlerts()
  let triggered = 0
  const grouped = groupAlertsByProductCity(alerts)

  logInfo('cron_alerts_started', {
    activeAlerts: alerts.length,
    productCityBatches: grouped.size,
    distinctUsers: new Set(alerts.map((alert) => alert.user_id)).size,
  })

  for (const [, batch] of grouped) {
    const sample = batch[0]
    if (!sample) continue

    try {
      const result = await compareService.compareByProductId(sample.product_id, sample.city)
      const lowestPrice = result.retailers.find((r) => r.available !== false && r.price > 0)
      if (!lowestPrice) continue

      for (const alert of batch) {
        if (lowestPrice.price > alert.target_price) continue
        if (!alert.userEmail) {
          await alertsService.recordDeliveryFailure(alert.id, 'User email not found')
          logWarn('cron_alert_missing_email', { alertId: alert.id, userId: alert.user_id })
          continue
        }

        const delivery = await sendPriceDropEmail({
          to:           alert.userEmail,
          productTitle: alert.productTitle,
          targetPrice:  alert.target_price,
          currentPrice: lowestPrice.price,
          retailerName: lowestPrice.name,
          buyUrl:       lowestPrice.buyUrl,
        })

        if (delivery.ok) {
          await alertsService.markAlertDelivered(alert.id, delivery.messageId)
          triggered += 1
        } else {
          await alertsService.recordDeliveryFailure(alert.id, delivery.message)
          logWarn('cron_alert_delivery_failed', {
            alertId: alert.id,
            productId: alert.product_id,
            reason: delivery.reason,
            message: delivery.message,
          })
        }
      }
    } catch (err) {
      logError('cron_alert_batch_failed', err, {
        productId: sample.product_id,
        city: sample.city,
        alertCount: batch.length,
      })
    }
  }

  const body: CronResult = { processed: alerts.length, triggered }
  logInfo('cron_alerts_completed', { processed: alerts.length, triggered })
  return NextResponse.json(body)
}
