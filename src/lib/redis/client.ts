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

const memoryRateBuckets = new Map<string, { count: number; resetAt: number }>()

function memoryRateLimitConsume(
  key: string,
  limit: number,
  windowSeconds: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const bucket = memoryRateBuckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    memoryRateBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: limit - 1 }
  }

  bucket.count += 1
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
  }
}

export async function rateLimitConsume(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) {
    return memoryRateLimitConsume(key, limit, windowSeconds)
  }

  const count = await redis.incr(key).catch(() => 1)
  if (count === 1) {
    await redis.expire(key, windowSeconds).catch(() => null)
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  }
}
