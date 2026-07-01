import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

const LS_KEY = 'pricely_pending_alert'

type PendingAlertItem = {
  productId: string
  city: string
  targetPrice: number
}

function addPendingAlert(item: PendingAlertItem): void {
  localStorage.setItem(LS_KEY, JSON.stringify(item))
}

function getPendingAlert(): PendingAlertItem | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as PendingAlertItem) : null
  } catch {
    return null
  }
}

function clearPendingAlert(): void {
  localStorage.removeItem(LS_KEY)
}

describe('pending alert journey buffer', () => {
  it('stores and clears a pending alert in localStorage', () => {
    const storage = new Map<string, string>()
    const globalScope = globalThis as typeof globalThis & {
      localStorage?: Storage
    }

    globalScope.localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
      clear: () => storage.clear(),
      key: () => null,
      length: 0,
    }

    const item = {
      productId: 'sony-wh-1000xm5',
      city: 'mumbai',
      targetPrice: 22000,
    }

    addPendingAlert(item)
    assert.deepEqual(getPendingAlert(), item)

    clearPendingAlert()
    assert.equal(getPendingAlert(), null)
  })
})
