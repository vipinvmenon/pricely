import type { PriceHistoryPoint, Verdict } from "@/types";

export type VerdictInput = {
  currentPrice: number;
  history?: readonly PriceHistoryPoint[];
  peerPrices?: readonly number[];
};

function meanLastNDaysCalendar(points: readonly PriceHistoryPoint[], days: number): number | null {
  if (points.length === 0) return null;
  const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1]!.date;
  const cutoff = addDaysIsoDate(last, -days);
  const windowPoints = sorted.filter((p) => p.date >= cutoff);
  const vals = (windowPoints.length > 0 ? windowPoints : sorted)
    .map((p) => p.price)
    .filter((n) => Number.isFinite(n) && n > 0);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function addDaysIsoDate(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

function verdictFromLowAndAverage(current: number, low: number, avg: number): Verdict {
  const nearAtl = current <= low * 1.03;
  const aboveAvg = current > avg * 1.05;

  if (nearAtl) {
    return {
      action: "buy",
      confidence: aboveAvg ? 65 : 82,
      reason: aboveAvg
        ? "At the recent range low, but still above the rolling average."
        : "Near the recent low for this item.",
    };
  }
  if (aboveAvg) {
    return {
      action: "wait",
      confidence: 74,
      reason: "Above recent average. A dip may be likely.",
    };
  }
  return {
    action: "wait",
    confidence: 56,
    reason: "Between recent low and average. No strong urgency.",
  };
}

/**
 * Rule-based verdict: near recent low in history favors buy; materially above ~30d average favors wait.
 * Without enough history, compares the current price to peer/platform snapshots when provided.
 */
export function computeVerdict(input: VerdictInput): Verdict {
  const { currentPrice, history = [], peerPrices } = input;

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return { action: "wait", confidence: 40, reason: "No reliable price to judge yet." };
  }

  const histPrices = history
    .map((p) => p.price)
    .filter((n) => Number.isFinite(n) && n > 0);

  if (histPrices.length >= 5) {
    const low = Math.min(...histPrices);
    const avg30 = meanLastNDaysCalendar(history, 30);
    const avg = avg30 ?? histPrices.reduce((a, b) => a + b, 0) / histPrices.length;
    return verdictFromLowAndAverage(currentPrice, low, avg);
  }

  const peers = (peerPrices ?? []).filter((n) => Number.isFinite(n) && n > 0);
  if (peers.length >= 2) {
    const sorted = peers.slice().sort((a, b) => a - b);
    const minP = sorted[0]!;
    const median = sorted[Math.floor(sorted.length / 2)]!;

    if (currentPrice <= minP && minP < median * 0.98) {
      return {
        action: "buy",
        confidence: 68,
        reason: "Best offer among compared platforms in this snapshot.",
      };
    }

    const spread = median > 0 ? (median - minP) / median : 0;
    if (spread < 0.03) {
      return {
        action: "wait",
        confidence: 55,
        reason: "Prices are tight across platforms.",
      };
    }

    if (currentPrice <= minP * 1.02) {
      return {
        action: "buy",
        confidence: 62,
        reason: "Strong versus the rest of the snapshot.",
      };
    }
  }

  return {
    action: "wait",
    confidence: 48,
    reason: "Need more history or more platform prices to decide.",
  };
}

/** Gray-zone rules output: optional GPT refinement when OPENAI_API_KEY is set. */
export function isAmbiguousRulesVerdict(v: Verdict): boolean {
  if (!Number.isFinite(v.confidence)) return false;
  return v.confidence >= 48 && v.confidence <= 62;
}
