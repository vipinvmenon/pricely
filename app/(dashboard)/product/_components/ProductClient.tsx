"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import useSWR from "swr";

import type { PriceHistoryPoint, PriceResult, Verdict } from "@/types";
import { SparkChart } from "@/components/features/SparkChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { ResultCard } from "@/components/ui/ResultCard";
import { SaveBadge } from "@/components/ui/badges";
import { VerdictChip } from "@/components/ui/VerdictChip";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { fetchJson } from "@/lib/utils/fetchJson";

function mockVerdict(): Verdict {
  return { action: "wait", confidence: 58, reason: "Mock verdict (Phase 9 will implement engine)" };
}

export function ProductClient({ productId }: { productId: string }) {
  const historyKey = useMemo(
    () => `/api/history/${encodeURIComponent(productId)}?city=&days=90`,
    [productId],
  );
  const { data: history, isLoading: isHistoryLoading, error: historyError } = useSWR<PriceHistoryPoint[]>(
    historyKey,
    fetchJson,
    {
      refreshInterval: 300_000,
    },
  );

  const pricesKey = useMemo(
    () => `/api/prices/grocery?q=${encodeURIComponent(productId)}&city=`,
    [productId],
  );
  const { data: prices, isLoading: isPricesLoading, error: pricesError } = useSWR<PriceResult[]>(
    pricesKey,
    fetchJson,
    {
      refreshInterval: 300_000,
    },
  );

  const sortedPrices = useMemo(() => (prices ?? []).slice().sort((a, b) => a.price - b.price), [prices]);
  const best = sortedPrices[0] ?? null;
  const savings =
    best && typeof best.mrp === "number" && best.mrp > best.price ? best.mrp - best.price : null;

  const values = useMemo(() => (history ?? []).map((p) => p.price), [history]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] px-2 py-1 hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
          >
            Home
          </Link>
          <span className="opacity-70">/</span>
          <span className="rounded-[var(--radius-pill)] px-2 py-1 text-[var(--color-text-muted)]">
            Product
          </span>
        </div>

        <VerdictChip verdict={mockVerdict()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-4">
          <GlassCard padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)]" />
                  <div className="min-w-0">
                    <div className="truncate font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.6px] text-[var(--color-text-primary)]">
                      Product {productId}
                    </div>
                    <div className="mt-1 font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                      ID {productId}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] p-3">
                    <div className="font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-muted)]">
                      LOWEST RIGHT NOW
                    </div>
                    <div className="mt-2 font-[var(--font-mono)] text-[22px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {best ? formatPrice(best.price) : "—"}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                      {best
                        ? best.platformName
                        : isPricesLoading
                          ? "Loading platforms…"
                          : pricesError
                            ? "Unavailable"
                            : "No data"}
                    </div>
                    {savings ? (
                      <div className="mt-3">
                        <SaveBadge amountText={formatPrice(savings)} />
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] p-3">
                    <div className="font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-muted)]">
                      DELIVERY ETA
                    </div>
                    <div className="mt-2 font-[var(--font-mono)] text-[22px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {best?.etaText ?? "—"}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--color-text-secondary)]">Based on platform listing</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="lg">
            <div className="flex items-center justify-between gap-4">
              <div className="font-[var(--font-display)] text-[16px] font-semibold tracking-[-0.4px]">
                Price history
              </div>
              <div className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                {isHistoryLoading ? "loading…" : historyError ? "unavailable" : "90 DAYS"}
              </div>
            </div>
            <div className="mt-4">
              <SparkChart values={values.length > 0 ? values : [120, 128, 124, 119]} />
            </div>
            {historyError ? (
              <div className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
                History endpoint not ready yet (Phase 6).
              </div>
            ) : null}
          </GlassCard>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-[var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
                PLATFORMS
              </div>
              <div className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                {isPricesLoading ? "loading…" : pricesError ? "unavailable" : `${sortedPrices.length} results`}
              </div>
            </div>

            {pricesError ? (
              <GlassCard mode="subtle" padding="lg">
                <div className="text-[13px] text-[var(--color-text-secondary)]">Couldn’t load platform prices.</div>
              </GlassCard>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedPrices.map((r, idx) => (
                  <ResultCard key={r.platformId} result={r} isBest={idx === 0} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          <GlassCard padding="lg">
            <div className="font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px]">
              Alert me at
            </div>
            <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-4 py-3 font-[var(--font-mono)] text-[13px] text-[var(--color-text-primary)]">
              ₹ 0
            </div>
            <button
              type="button"
              className={cn(
                "mt-3 h-11 w-full rounded-[var(--radius-md)]",
                "bg-[var(--gradient-ramp-accent)] text-white shadow-[var(--shadow-accent-glow)]",
                "font-[var(--font-text)] text-[13px] font-semibold tracking-[-0.2px]",
              )}
            >
              Set alert
            </button>
            <div className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
              Alert me at ₹X — likely in ~14 days.
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

