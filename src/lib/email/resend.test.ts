import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { emailTestUtils } from './resend.ts'

describe('email safety helpers', () => {
  it('escapes HTML in interpolated email fields', () => {
    const escaped = emailTestUtils.escapeHtml('<script>alert("x")</script>')
    assert.equal(escaped.includes('<script>'), false)
    assert.equal(escaped.includes('&lt;script&gt;'), true)
  })

  it('accepts safe http(s) retailer URLs only', () => {
    assert.equal(emailTestUtils.isSafeHttpUrl('https://amazon.in/product'), true)
    assert.equal(emailTestUtils.isSafeHttpUrl('javascript:alert(1)'), false)
    assert.equal(emailTestUtils.isSafeHttpUrl('#demo-price'), false)
  })

  it('prefers RESEND_FROM_EMAIL when configured', () => {
    const previous = process.env.RESEND_FROM_EMAIL
    process.env.RESEND_FROM_EMAIL = 'Pricely <alerts@pricely.in>'
    const resolved = emailTestUtils.resolveResendFromAddress()
    assert.equal(resolved.from, 'Pricely <alerts@pricely.in>')
    assert.equal(resolved.usingSandboxDefault, false)
    if (previous === undefined) delete process.env.RESEND_FROM_EMAIL
    else process.env.RESEND_FROM_EMAIL = previous
  })
})
