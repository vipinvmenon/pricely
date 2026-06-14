import type { NextConfig } from 'next'
import path from 'path'

/** Paths the Next dev watcher should ignore (scraper runs as its own process). */
const DEV_WATCH_IGNORED = [
  path.join(process.cwd(), 'scraper'),
  /[/\\]scraper[/\\]/,
] as const

const nextConfig: NextConfig = {
  // Required when a `webpack` hook is present on Next.js 16+ (default bundler is Turbopack).
  turbopack: {},
  experimental: {
    // Cap Turbopack compiler memory (does not cap total next-server RSS).
    turbopackMemoryLimit: 1024 * 1024 * 1024,
  },
  webpack: (config, { dev }) => {
    if (!dev) return config

    const existing = config.watchOptions?.ignored
    const ignored = [
      ...(existing
        ? Array.isArray(existing)
          ? existing
          : [existing]
        : []),
      ...DEV_WATCH_IGNORED,
    ]

    config.watchOptions = {
      ...config.watchOptions,
      ignored,
    }

    return config
  },
}

export default nextConfig
