import type { PlatformId, PriceHistoryPoint } from "@/types";
import { badRequest, json, parseNumber } from "@/lib/api/http";

export async function GET(req: Request, context: { params: Promise<{ productId: string }> }) {
  const { productId } = await context.params;
  const url = new URL(req.url);
  const days = parseNumber(url.searchParams.get("days")) ?? 90;
  if (days <= 0 || days > 365) return badRequest("days must be between 1 and 365");

  const platformIds: PlatformId[] = ["blinkit", "zepto", "bigbasket"];
  const base = 120 + (productId.length % 9) * 7;

  const points: PriceHistoryPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const platformId = platformIds[i % platformIds.length];
    const wobble = Math.round(Math.sin(i / 6) * 8);
    points.push({
      productId,
      date,
      platformId,
      price: Math.max(20, base + wobble),
    });
  }

  return json(points);
}

