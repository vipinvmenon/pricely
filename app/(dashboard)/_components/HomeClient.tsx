"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import { SearchBar } from "@/components/ui/SearchBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { UpdatedAgo } from "@/components/features/UpdatedAgo";
import { cn } from "@/lib/utils/cn";
import { fetchJson } from "@/lib/utils/fetchJson";
import type { WatchlistItemView } from "@/types";

type TrendingItem = {
  id: string;
  query: string;
  category: "grocery" | "electronics" | "cabs";
};

export function HomeClient({ cityName }: { cityName: string }) {
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "grocery" | "electronics" | "cabs">(
    "all",
  );

  const trendingKey = `/api/search/trending?city=${encodeURIComponent(cityName)}`;
  const watchlistKey = "/api/watchlist";

  const trending = useSWR<TrendingItem[]>(trendingKey, fetchJson, { refreshInterval: 300_000 });
  const watchlist = useSWR<WatchlistItemView[]>(watchlistKey, fetchJson, {
    refreshInterval: 300_000,
  });

  const updatedAt = useMemo(() => Date.now(), []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[13px] text-[var(--color-text-secondary)]">
          Bengaluru ·{" "}
          <span className="font-[var(--font-mono)] text-[var(--color-text-muted)]">{cityName}</span>
        </div>
        <UpdatedAgo updatedAt={updatedAt} />
      </div>

      <SearchBar value={q} onChange={setQ} size="lg" onSubmit={() => {}} onFilterClick={() => {}} />

      <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {([
          { id: "all", label: "All" },
          { id: "grocery", label: "Grocery" },
          { id: "electronics", label: "Electronics" },
          { id: "cabs", label: "Cabs" },
        ] as const).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={cn(
              "shrink-0 rounded-[var(--radius-pill)] border px-[14px] py-2",
              "text-[13px] font-medium tracking-[-0.1px]",
              activeCategory === c.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "border-[var(--color-glass-border)] bg-[var(--color-glass)] text-[var(--color-text-primary)]",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="min-w-0" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div className="font-[var(--font-display)] text-[16px] font-semibold tracking-[-0.4px]">
              Trending
            </div>
            {trending.isLoading ? (
              <span className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                loading…
              </span>
            ) : null}
          </div>

          {trending.error ? (
            <div className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
              Couldn’t load trending. (Phase 6 will add mock API.)
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            {(trending.data ??
              Array.from({ length: 3 }, (_, i) => ({ id: `s${i}`, query: "—", category: "grocery" as const }))).slice(0, 3).map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "w-full rounded-[var(--radius-md)] border px-[14px] py-3 text-left",
                    "border-[var(--color-glass-border)] bg-[var(--color-glass)]",
                    "hover:bg-[var(--color-surface)]",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-[10px] border border-[var(--color-glass-border)] bg-[var(--glass-thin)]">
                      <span className="font-[var(--font-mono)] text-[10px] font-semibold text-[var(--color-text-muted)]">
                        {item.category.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold tracking-[-0.2px] text-[var(--color-text-primary)]">
                        {item.query}
                      </div>
                      <div className="mt-1 font-[var(--font-mono)] text-[10px] text-[var(--color-text-muted)]">
                        TRENDING
                      </div>
                    </div>
                  </div>
                </button>
              ),
            )}
          </div>
        </GlassCard>

        <GlassCard className="min-w-0" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div className="font-[var(--font-display)] text-[16px] font-semibold tracking-[-0.4px]">
              Watchlist
            </div>
            {watchlist.isLoading ? (
              <span className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                loading…
              </span>
            ) : null}
          </div>

          {watchlist.error ? (
            <div className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
              Couldn’t load watchlist yet.
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3">
            {(watchlist.data ?? []).length === 0 ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] p-4">
                <div className="font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px]">
                  Nothing here yet
                </div>
                <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                  Save items to watch for price drops.
                </div>
              </div>
            ) : (
              (watchlist.data ?? []).slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-glass)] px-[14px] py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                        {item.title}
                      </div>
                      <div className="mt-1 font-[var(--font-mono)] text-[10px] text-[var(--color-text-muted)]">
                        {item.category.toUpperCase()}
                        {item.subtitle ? ` · ${item.subtitle}` : ""}
                      </div>
                    </div>
                    {item.deltaText ? (
                      <span className="shrink-0 font-[var(--font-mono)] text-[11px] font-semibold text-[var(--color-text-secondary)]">
                        {item.deltaText}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

