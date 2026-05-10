import type { VerdictInput } from "@/lib/ai/verdict";
import type { Verdict } from "@/types";
import { z } from "zod/v3";

const gptVerdictSchema = z.object({
  action: z.enum(["buy", "wait"]),
  confidence: z.number().finite().min(0).max(100),
  reason: z.string().min(1).max(400),
});

export async function refineVerdictWithOpenAI(
  input: VerdictInput,
  rulesVerdict: Verdict,
): Promise<Verdict | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const userPayload = {
    currentPriceInr: input.currentPrice,
    historySample: (input.history ?? []).slice(-24).map((p) => ({
      date: p.date,
      price: p.price,
      platformId: p.platformId,
    })),
    peerPricesInr: input.peerPrices ?? [],
    rulesEngine: rulesVerdict,
  };

  const body = {
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" as const },
    messages: [
      {
        role: "system" as const,
        content: [
          "You refine buy/wait verdicts for Indian retail price snapshots (INR).",
          'Reply with JSON only: {"action":"buy"|"wait","confidence":0-100,"reason":"single short sentence"}',
          "Prefer wait when signals conflict; raise confidence only with clear rationale.",
          "Never mention policy, tooling, or that you are a model.",
        ].join(" "),
      },
      {
        role: "user" as const,
        content: JSON.stringify(userPayload),
      },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;

  const raw = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const text = raw.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") return null;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    return null;
  }

  const parsed = gptVerdictSchema.safeParse(parsedJson);
  if (!parsed.success) return null;
  return parsed.data;
}
