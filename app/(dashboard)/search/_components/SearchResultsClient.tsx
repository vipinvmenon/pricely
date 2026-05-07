"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import type { PriceResult, Verdict } from "@/types";
import { SearchBar } from "@/components/ui/SearchBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { ResultCard } from "@/components/ui/ResultCard";
import { VerdictChip } from "@/components/ui/VerdictChip";
import { SparkChart } from "@/components/features/SparkChart";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { fetchJson } from "@/lib/utils/fetchJson";

function mockVerdict(): Verdict {
  return { action: "wait", confidence: 62, reason: "Mock verdict (Phase 9 will implement engine)" };
}

function etaMinutesFromText(etaText?: string) {
  if (!etaText) return Number.POSITIVE_INFINITY;
  const m = etaText.match(/\d+/);
  if (!m) return Number.POSITIVE_INFINITY;
  const minutes = Number(m[0]);
  return Number.isFinite(minutes) ? minutes : Number.POSITIVE_INFINITY;
}

export function SearchResultsClient({ query }: { query: string }) {
  const [value, setValue] = useState(query);
  const [sort, setSort] = useState<"best" | "price" | "eta">("best");
  const [category, setCategory] = useState<"all" | "grocery" | "electronics">("all");

  const key = useMemo(
    () => {
      const kind = category === "electronics" ? "electronics" : "grocery";
      return `/api/prices/${kind}?q=${encodeURIComponent(query)}&city=`;
    },
    [category, query],
  );
  const { data, isLoading, error } = useSWR<PriceResult[]>(key, fetchJson, {
    refreshInterval: 300_000,
  });

  const sorted = useMemo(() => {
    const list = (data ?? []).slice();
    if (sort === "price") {
      list.sort((a, b) => a.price - b.price);
      return list;
    }

    if (sort === "eta") {
      list.sort((a, b) => etaMinutesFromText(a.etaText) - etaMinutesFromText(b.etaText));
      return list;
    }

    list.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      return etaMinutesFromText(a.etaText) - etaMinutesFromText(b.etaText);
    });
    return list;
  }, [data, sort]);

  const best = sorted[0] ?? null;
  const chartValues = useMemo(() => sorted.map((r) => r.price), [sorted]);

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-40 -mx-4 border-b border-[var(--color-line-subtle)] bg-[color-mix(in_oklab,var(--color-bg-canvas),transparent_35%)] px-4 py-4 backdrop-blur-[var(--blur-glass)] lg:-mx-6 lg:px-6">
        <SearchBar value={value} onChange={setValue} size="md" onSubmit={() => {}} onFilterClick={() => {}} />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {([
              { id: "all", label: "All" },
              { id: "grocery", label: "Grocery" },
              { id: "electronics", label: "Electronics" },
            ] as const).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id as typeof category)}
                className={cn(
                  "h-10 rounded-[var(--radius-pill)] border px-4",
                  "font-[var(--font-mono)] text-[11px] font-semibold tracking-wide",
                  category === c.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "border-[var(--color-glass-border)] bg-[var(--color-glass)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setSort((prev) => {
                if (prev === "best") return "price";
                if (prev === "price") return "eta";
                return "best";
              });
            }}
            className={cn(
              "h-10 rounded-[var(--radius-pill)] border px-4",
              "border-[var(--color-glass-border)] bg-[var(--color-glass)]",
              "font-[var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--color-text-secondary)]",
            )}
          >
            Sort: {sort.toUpperCase()}
          </button>
        </div>

        <div className="mt-3 hidden flex-wrap gap-2 lg:flex">
          {(["best", "price", "eta"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSort(k)}
              className={cn(
                "h-10 rounded-[var(--radius-pill)] border px-4",
                "font-[var(--font-mono)] text-[11px] font-semibold tracking-wide",
                sort === k
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-line-subtle)] bg-[var(--glass-thin)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr_320px] lg:items-start">
        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          <GlassCard padding="lg">
            <div className="font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px]">
              Filters
            </div>
            <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">Coming soon</div>
          </GlassCard>
        </div>

        <div className="flex flex-col gap-3">
          <GlassCard padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)]" />
                  <div className="min-w-0">
                    <div className="truncate font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.6px] text-[var(--color-text-primary)]">
                      {query}
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                      {isLoading ? "Loading results…" : `${sorted.length} platforms`}
                    </div>
                  </div>
                </div>
              </div>
              <VerdictChip verdict={mockVerdict()} />
            </div>
          </GlassCard>

          {error ? (
            <GlassCard mode="subtle" padding="lg">
              <div className="text-[13px] text-[var(--color-text-secondary)]">
                Couldn’t load results.
              </div>
            </GlassCard>
          ) : null}

          <div className="flex flex-col gap-3">
            {sorted.map((r, idx) => (
              <ResultCard key={r.platformId} result={r} isBest={idx === 0} />
            ))}

            {isLoading && sorted.length === 0 ? (
              <div className="grid gap-3">
                <GlassCard mode="subtle" padding="lg">
                  <div className="h-12 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--glass-thin)]" />
                </GlassCard>
                <GlassCard mode="subtle" padding="lg">
                  <div className="h-12 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--glass-thin)]" />
                </GlassCard>
              </div>
            ) : null}
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          <GlassCard padding="lg">
            <div className="flex items-center justify-between gap-3">
              <div className="font-[var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
                PRICE HISTORY
              </div>
              <div className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                90 DAYS
              </div>
            </div>
            <div className="mt-3">
              <SparkChart values={chartValues.length > 1 ? chartValues : [120, 128, 124, 119]} />
            </div>
          </GlassCard>

          <GlassCard padding="lg">
            <div className="font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px]">
              Set price alert
            </div>
            <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-4 py-3 font-[var(--font-mono)] text-[13px] text-[var(--color-text-primary)]">
              ₹ 82
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
          </GlassCard>

          <GlassCard padding="lg">
            <div className="font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px]">
              Quick compare
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {(sorted.slice(0, 4) ?? []).map((r, idx) => (
                <div
                  key={`${r.platformId}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-3 py-2"
                >
                  <div className="min-w-0 truncate text-[13px] text-[var(--color-text-secondary)]">
                    {r.platformName}
                  </div>
                  <div className="shrink-0 font-[var(--font-mono)] text-[13px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                    {formatPrice(r.price)}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {best ? (
        <div className="lg:hidden fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-40 px-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] p-4 shadow-[var(--shadow-float)] backdrop-blur-[var(--blur-strong)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px] text-[var(--color-text-primary)]">
                  Best right now
                </div>
                <div className="mt-1 truncate font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                  {best.platformName}
                </div>
              </div>
              <div className="shrink-0 font-[var(--font-mono)] text-[16px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                {formatPrice(best.price)}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

