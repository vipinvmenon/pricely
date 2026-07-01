import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pricelyco.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Pricely — Never overpay again',
    template: '%s · Pricely',
  },
  description:
    'Compare listed prices across supported Indian electronics and fashion retailers, with price history and buy-or-wait verdicts.',
  openGraph: {
    title: 'Pricely — Never overpay again',
    description:
      'Compare prices across Amazon, Flipkart, Croma, and more — with history and a clear buy or wait call.',
    url: appUrl,
    siteName: 'Pricely',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricely — Never overpay again',
    description: 'Price intelligence for electronics and fashion in India.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <SWRProvider>
          <ToastProvider>{children}</ToastProvider>
        </SWRProvider>
      </body>
    </html>
  )
}
