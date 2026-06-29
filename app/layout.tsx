import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SWRProvider } from '@/components/providers/SWRProvider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Pricely — Never overpay again',
  description:
    'Compare live prices across Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, Tata Cliq and Myntra — and get a clear buy or wait verdict.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  )
}
