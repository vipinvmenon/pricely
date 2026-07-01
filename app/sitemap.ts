import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pricelyco.vercel.app'
  const lastModified = new Date()

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/compare`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/watchlist`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/alerts`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/methodology`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
