import type { VerdictInput } from "@/lib/ai/verdict";
import { resolveVerdict } from "@/lib/ai/resolve-verdict";
import { badRequest, json } from "@/lib/api/http";
import { toPriceHistoryPoints, verdictPostBodySchema } from "@/lib/api/schemas/verdictPost";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = verdictPostBodySchema.safeParse(raw);
  if (!parsed.success) return badRequest("Invalid request body");

  const history = toPriceHistoryPoints(parsed.data);
  const input: VerdictInput = {
    currentPrice: parsed.data.currentPrice,
    history: history.length > 0 ? history : undefined,
    peerPrices: parsed.data.peerPrices,
  };

  const verdict = await resolveVerdict(input);
  return json(verdict);
}
