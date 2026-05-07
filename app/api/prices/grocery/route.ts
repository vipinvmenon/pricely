import type { PriceResult, PlatformId } from "@/types";
import { json } from "@/lib/api/http";
import { PLATFORMS } from "@/lib/utils/platforms";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const now = new Date().toISOString();

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

  return json(results);
}

