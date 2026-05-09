import type { PriceResult, PlatformId } from "@/types";
import { json } from "@/lib/api/http";
import { PLATFORMS } from "@/lib/utils/platforms";
import { cacheKey, getCache, setCache } from "@/lib/cache/redis";
import { fetchPricesFromScraperService } from "@/lib/scraper-service/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const now = new Date().toISOString();
  const city = (url.searchParams.get("city") ?? "").trim();

  const cacheId = cacheKey(["price", "cabs", city || "BLR", url.search]);
  const cached = await getCache<PriceResult[]>(cacheId, { parseJson: true });
  if (cached) return json(cached);

  try {
    const live = await fetchPricesFromScraperService({
      category: "cabs",
      platformIds: ["uber", "ola", "rapido", "namma_yatri", "indrive"],
      city,
    });
    if (live) {
      await setCache(cacheId, JSON.stringify(live), { ttlSeconds: 300 });
      return json(live);
    }
  } catch {
    // Optional; fall back to mocks.
  }

  const platformIds: PlatformId[] = ["uber", "ola", "rapido", "namma_yatri", "indrive"];
  const base = 120 + (url.search.length % 13) * 9;

  const results: PriceResult[] = platformIds.map((id, idx) => {
    const platform = PLATFORMS[id];
    const price = base + idx * 14;
    return {
      platformId: id,
      platformName: platform.name,
      category: "cabs",
      price,
      etaText: `${3 + idx} min`,
      updatedAt: now,
      url: "https://example.com/cabs",
    };
  });

  await setCache(cacheId, JSON.stringify(results), { ttlSeconds: 300 });
  return json(results);
}

