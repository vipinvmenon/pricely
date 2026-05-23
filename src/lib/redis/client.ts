import { Redis } from '@upstash/redis'

export const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
)

const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null
  return redis.get<T>(key).catch(() => null)
}

export async function cacheSetex(key: string, ttlSeconds: number, value: unknown): Promise<void> {
  if (!redis) return
  await redis.setex(key, ttlSeconds, value).catch(() => null)
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return
  await redis.del(key).catch(() => null)
}
