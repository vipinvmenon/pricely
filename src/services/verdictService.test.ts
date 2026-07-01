import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { verdictService } from './verdictService.ts'
import type { HistoryPoint } from '../types/index.ts'

function dailyHistory(prices: number[]): HistoryPoint[] {
  const start = new Date('2026-01-01T00:00:00.000Z')
  return prices.map((price, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return {
      date: day.toISOString().slice(0, 10),
      price,
    }
  })
}

describe('verdictService', () => {
  it('returns a cautious wait verdict for empty history', async () => {
    const verdict = await verdictService.computeVerdict([])
    assert.equal(verdict.action, 'wait')
    assert.ok(verdict.confidence <= 0.3)
  })

  it('keeps sparse history low-confidence even near the tracked low', async () => {
    const history = dailyHistory([30_000, 29_500, 29_200, 29_000, 28_900])
    const verdict = await verdictService.computeVerdict(history)

    assert.equal(verdict.action, 'buy')
    assert.ok(verdict.confidence <= 0.5)
    assert.match(verdict.reason, /short window/)
  })
})
