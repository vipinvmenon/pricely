'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { normalizeQuery } from '@/lib/utils/format'

const LS_KEY = 'pricely_recent_searches'
const MAX = 6

/** Stable empty snapshot for SSR and empty localStorage (required by useSyncExternalStore). */
const EMPTY_RECENT: string[] = []

let cachedSnapshot: string[] = EMPTY_RECENT
let cachedRaw: string | null = null

function readRecent(): string[] {
  if (typeof window === 'undefined') return EMPTY_RECENT
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw === cachedRaw) return cachedSnapshot
    cachedRaw = raw
    if (!raw) {
      cachedSnapshot = EMPTY_RECENT
      return cachedSnapshot
    }
    const parsed = JSON.parse(raw) as string[]
    const next = Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string')
      : EMPTY_RECENT
    cachedSnapshot = next.length > 0 ? next : EMPTY_RECENT
    return cachedSnapshot
  } catch {
    cachedRaw = null
    cachedSnapshot = EMPTY_RECENT
    return cachedSnapshot
  }
}

function writeRecent(items: string[]): void {
  if (typeof window === 'undefined') return
  const next = items.slice(0, MAX)
  const serialized = JSON.stringify(next)
  localStorage.setItem(LS_KEY, serialized)
  cachedRaw = serialized
  cachedSnapshot = next.length > 0 ? next : EMPTY_RECENT
}

function getServerSnapshot(): string[] {
  return EMPTY_RECENT
}

let listeners: Array<() => void> = []

function subscribe(listener: () => void): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((item) => item !== listener)
  }
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function useRecentSearches(): {
  recent: string[]
  addRecent: (query: string) => void
  filterRecent: (query: string) => string[]
} {
  const recent = useSyncExternalStore(subscribe, readRecent, getServerSnapshot)

  const addRecent = useCallback((query: string) => {
    const normalized = normalizeQuery(query)
    if (!normalized) return
    const next = [normalized, ...readRecent().filter((item) => item !== normalized)].slice(0, MAX)
    writeRecent(next)
    emit()
  }, [])

  const filterRecent = useCallback((query: string) => {
    const needle = query.trim().toLowerCase()
    if (!needle) return recent
    return recent.filter((item) => item.toLowerCase().includes(needle))
  }, [recent])

  return { recent, addRecent, filterRecent }
}
