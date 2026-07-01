import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCompareMockResponse } from './buildCompareMock.ts'

describe('buildCompareMockResponse', () => {
  it('returns the same payload for the same query', () => {
    const first = buildCompareMockResponse('iphone 15 128gb')
    const second = buildCompareMockResponse('iphone 15 128gb')

    assert.equal(first.product.id, second.product.id)
    assert.deepEqual(first.retailers, second.retailers)
    assert.deepEqual(first.history, second.history)
    assert.deepEqual(first.verdict, second.verdict)
    assert.equal(first.isDemoData, true)
  })

  it('varies product identity and prices by query', () => {
    const iphone = buildCompareMockResponse('iphone 15 128gb')
    const sony = buildCompareMockResponse('sony wh-1000xm5')

    assert.notEqual(iphone.product.id, sony.product.id)
    assert.notEqual(iphone.product.name, sony.product.name)
    assert.notEqual(iphone.retailers[0]?.price, sony.retailers[0]?.price)
  })

  it('uses a cautious demo verdict', () => {
    const response = buildCompareMockResponse('dyson v12')
    assert.equal(response.verdict?.action, 'wait')
    assert.ok((response.verdict?.confidence ?? 1) <= 0.5)
  })
})
