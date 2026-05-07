import React from "react";

import type { Verdict } from "@/types";
import { cn } from "@/lib/utils/cn";

export function VerdictChip({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  const isBuy = verdict.action === "buy";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 font-[var(--font-mono)] text-[11px] font-semibold tracking-wide",
        isBuy
          ? "border-[var(--color-line-subtle)] bg-[var(--save-soft)] text-[var(--color-success)]"
          : "border-[var(--color-line-subtle)] bg-[var(--glass-thin)] text-[var(--color-warning)]",
        className,
      )}
      aria-label={`Verdict: ${verdict.action}`}
      title={verdict.reason}
    >
      <span className="uppercase">{isBuy ? "BUY" : "WAIT"}</span>
      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
        {Math.round(verdict.confidence)}%
      </span>
    </span>
  );
}
