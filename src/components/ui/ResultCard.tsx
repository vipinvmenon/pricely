import React from "react";

import type { PriceResult } from "@/types";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { PlatformLogo } from "@/components/features/PlatformLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { ETABadge, OfferBadge, SaveBadge } from "@/components/ui/badges";

export function ResultCard({
  result,
  isBest = false,
  className,
}: {
  result: PriceResult;
  isBest?: boolean;
  className?: string;
}) {
  const savings =
    typeof result.mrp === "number" && result.mrp > result.price
      ? result.mrp - result.price
      : null;

  return (
    <GlassCard
      mode={isBest ? "strong" : "default"}
      padding="none"
      className={cn(
        "w-full",
        isBest ? "border-[var(--color-accent)] shadow-[var(--shadow-glow)]" : undefined,
        className,
      )}
    >
      {isBest ? (
        <span className="absolute right-3 top-3 z-10 rounded-[var(--radius-pill)] bg-[var(--gradient-ramp-accent)] px-2 py-1 font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-white">
          BEST
        </span>
      ) : null}

      <div className="flex items-center gap-3 px-[14px] py-3">
        <PlatformLogo platformId={result.platformId} size="md" className="shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-semibold tracking-[-0.2px] text-[var(--color-text-primary)]">
                {result.platformName}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {result.etaText ? <ETABadge etaText={result.etaText} /> : null}
                {result.offerText ? <OfferBadge offerText={result.offerText} /> : null}
                {savings ? <SaveBadge amountText={formatPrice(savings)} /> : null}
              </div>
            </div>

            <div className="text-right">
              <div className="font-[var(--font-mono)] text-[20px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                {formatPrice(result.price)}
              </div>
              {typeof result.mrp === "number" && result.mrp > result.price ? (
                <div className="mt-1 font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-muted)] line-through">
                  {formatPrice(result.mrp)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
