import type { PriceResult, PlatformId } from "@/types";
import { json } from "@/lib/api/http";
import { PLATFORMS } from "@/lib/utils/platforms";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const now = new Date().toISOString();

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

  return json(results);
}

