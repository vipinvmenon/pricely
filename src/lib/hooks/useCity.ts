'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  coerceCity,
  DEFAULT_CITY,
  SUPPORTED_CITIES,
  type City,
} from '@/lib/constants'

const STORAGE_KEY = 'pricely:city'
const CITY_CHANGE_EVENT = 'pricely:city-change'

function readStoredCity(): City {
  if (typeof window === 'undefined') return DEFAULT_CITY
  return coerceCity(localStorage.getItem(STORAGE_KEY))
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => onStoreChange()
  window.addEventListener(CITY_CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CITY_CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function useCity() {
  const city = useSyncExternalStore(subscribe, readStoredCity, () => DEFAULT_CITY)

  const setCity = useCallback((next: City) => {
    localStorage.setItem(STORAGE_KEY, next)
    window.dispatchEvent(new Event(CITY_CHANGE_EVENT))
  }, [])

  return { city, setCity, ready: true, cities: SUPPORTED_CITIES }
}
