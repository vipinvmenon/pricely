import type { PriceResult, PlatformId } from "@/types";
import { json } from "@/lib/api/http";
import { PLATFORMS } from "@/lib/utils/platforms";
import { cacheKey, getCache, setCache } from "@/lib/cache/redis";
import { normalizeQuery } from "@/lib/utils/format";
import { fetchPricesFromScraperService } from "@/lib/scraper-service/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const now = new Date().toISOString();

  const normalized = normalizeQuery(q);
  const cacheId = cacheKey(["price", "electronics", normalized]);

  const cached = await getCache<PriceResult[]>(cacheId, { parseJson: true });
  if (cached) return json(cached);

  try {
    const live = await fetchPricesFromScraperService({
      category: "electronics",
      platformIds: ["amazon", "flipkart", "croma", "reliance_digital", "vijay_sales"],
      q,
    });
    if (live) {
      await setCache(cacheId, JSON.stringify(live), { ttlSeconds: 300 });
      return json(live);
    }
  } catch {
    // Optional; fall back to mocks.
  }

  const platformIds: PlatformId[] = ["amazon", "flipkart", "croma", "reliance_digital", "vijay_sales"];
  const base = Math.max(999, 4999 + (q.length % 9) * 149);

  const results: PriceResult[] = platformIds.map((id, idx) => {
    const platform = PLATFORMS[id];
    const price = base + idx * 199;
    const mrp = price + 999;
    return {
      platformId: id,
      platformName: platform.name,
      category: "electronics",
      price,
      mrp,
      etaText: `${1 + idx} day`,
      offerText: idx === 0 ? "Best deal" : "Offer available",
      updatedAt: now,
      url: `https://example.com/${encodeURIComponent(q || "product")}`,
    };
  });

  await setCache(cacheId, JSON.stringify(results), { ttlSeconds: 300 });
  return json(results);
}

