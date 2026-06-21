import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Cap Turbopack memory when using default `next dev` (Turbopack).
    turbopackMemoryLimit: 512 * 1024 * 1024,
  },
}

export default nextConfig
