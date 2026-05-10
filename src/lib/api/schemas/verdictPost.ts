import { z } from "zod/v3";

import type { PriceHistoryPoint } from "@/types";

const priceHistoryPointSchema = z.object({
  productId: z.string().min(1),
  date: z.string().min(10),
  price: z.number().finite().positive(),
  platformId: z.string().min(1),
});

export const verdictPostBodySchema = z
  .object({
    currentPrice: z.number().finite().positive(),
    history: z.array(priceHistoryPointSchema).optional(),
    peerPrices: z.array(z.number().finite().positive()).optional(),
  })
  .strict();

export type VerdictPostBody = z.infer<typeof verdictPostBodySchema>;

export function toPriceHistoryPoints(parsed: VerdictPostBody): PriceHistoryPoint[] {
  const hist = parsed.history ?? [];
  return hist.map((p) => ({
    productId: p.productId,
    date: p.date,
    price: p.price,
    platformId: p.platformId as PriceHistoryPoint["platformId"],
  }));
}
