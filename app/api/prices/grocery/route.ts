import type { PriceResult, PlatformId } from "@/types";
import { json } from "@/lib/api/http";
import { PLATFORMS } from "@/lib/utils/platforms";
import { fetchPricesFromScraperService } from "@/lib/scraper-service/client";
import { cacheKey, getCache, setCache } from "@/lib/cache/redis";
import { normalizeQuery } from "@/lib/utils/format";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const city = (url.searchParams.get("city") ?? "").trim();
  const now = new Date().toISOString();

  const normalized = normalizeQuery(q);
  const cacheId = cacheKey(["price", "grocery", normalized, city || "BLR"]);

  const cached = await getCache<PriceResult[]>(cacheId, { parseJson: true });
  if (cached) return json(cached);

  try {
    const live = await fetchPricesFromScraperService({
      category: "grocery",
      platformIds: ["dmart_ready", "bigbasket", "blinkit", "zepto", "swiggy_instamart"],
      q,
      city,
    });
    if (live) {
      await setCache(cacheId, JSON.stringify(live), { ttlSeconds: 300 });
      return json(live);
    }
  } catch {
    // Scraper service is optional; fall back to mocks when it errors or is offline.
  }

  const platformIds: PlatformId[] = ["blinkit", "zepto", "swiggy_instamart", "bigbasket", "dmart_ready"];
  const base = Math.max(40, 120 + (q.length % 7) * 11);

  const results: PriceResult[] = platformIds.map((id, idx) => {
    const platform = PLATFORMS[id];
    const price = base + idx * 7;
    const mrp = idx % 2 === 0 ? price + 18 : undefined;
    return {
      platformId: id,
      platformName: platform.name,
      category: "grocery",
      price,
      mrp,
      etaText: idx < 3 ? `${12 + idx * 6} min` : `${30 + idx * 5} min`,
      offerText: mrp ? "MRP drop" : undefined,
      updatedAt: now,
      url: `https://example.com/${encodeURIComponent(q || "item")}`,
    };
  });

  await setCache(cacheId, JSON.stringify(results), { ttlSeconds: 300 });
  return json(results);
}

