type CacheValue = unknown;

type CacheGetOptions = {
  parseJson?: boolean;
};

type CacheSetOptions = {
  ttlSeconds?: number;
};

function hasRedisEnv() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function cacheKey(parts: Array<string | number | null | undefined>) {
  return parts
    .filter((p) => p !== null && p !== undefined)
    .map((p) => String(p).trim())
    .filter((p) => p.length > 0)
    .join(":");
}

async function getRedis() {
  if (!hasRedisEnv()) return null;

  try {
    const mod = (await import("@upstash/redis")) as unknown as {
      Redis: {
        fromEnv(): {
          get(key: string): Promise<CacheValue>;
          set(key: string, value: CacheValue, opts?: { ex?: number }): Promise<unknown>;
        };
      };
    };

    return mod.Redis.fromEnv();
  } catch {
    // Dependency not installed yet (Phase 2). Keep local dev unblocked.
    return null;
  }
}

export async function getCache<T = CacheValue>(key: string, opts?: CacheGetOptions): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;

  const value = await redis.get(key);
  if (value == null) return null;

  if (opts?.parseJson && typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  return value as T;
}

export async function setCache(key: string, value: CacheValue, opts?: CacheSetOptions): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  const ex = typeof opts?.ttlSeconds === "number" && opts.ttlSeconds > 0 ? opts.ttlSeconds : undefined;
  await redis.set(key, value, ex ? { ex } : undefined);
}

