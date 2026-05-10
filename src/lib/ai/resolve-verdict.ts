import type { VerdictInput } from "@/lib/ai/verdict";
import { computeVerdict, isAmbiguousRulesVerdict } from "@/lib/ai/verdict";
import { refineVerdictWithOpenAI } from "@/lib/ai/openai-refine-verdict";
import type { Verdict } from "@/types";

export async function resolveVerdict(input: VerdictInput): Promise<Verdict> {
  const base = computeVerdict(input);

  const key = process.env.OPENAI_API_KEY;
  if (!key || !isAmbiguousRulesVerdict(base)) {
    return base;
  }

  const refined = await refineVerdictWithOpenAI(input, base);
  return refined ?? base;
}
