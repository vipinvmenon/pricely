'use client'

import { SWRConfig } from 'swr'
import { SWR_CONFIG } from '@/lib/swr/config'
import type { ReactNode } from 'react'

export function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={SWR_CONFIG}>{children}</SWRConfig>
}
