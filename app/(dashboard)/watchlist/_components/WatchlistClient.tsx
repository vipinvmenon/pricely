"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import { fetchJson } from "@/lib/utils/fetchJson";
import type { WatchlistItemView } from "@/types";

export function WatchlistClient() {
  const { data, isLoading, error, mutate } = useSWR<WatchlistItemView[]>("/api/watchlist", fetchJson, {
    refreshInterval: 300_000,
  });

  async function removeItem(item: WatchlistItemView) {
    const city = item.subtitle?.trim() ?? "";
    if (!city) return;

    const nextList = (data ?? []).filter(
      (i) => !(i.productId === item.productId && (i.subtitle ?? "").trim() === city),
    );

    try {
      await mutate(
        async () => {
          const res = await fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "remove",
              productId: item.productId,
              city,
            }),
          });
          if (!res.ok) throw new Error("Remove failed");
          return fetchJson<WatchlistItemView[]>("/api/watchlist");
        },
        {
          optimisticData: nextList,
          rollbackOnError: true,
          revalidate: false,
          throwOnError: true,
        },
      );
    } catch {
      await mutate();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <GlassCard padding="lg">
        <div className="font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.6px] text-[var(--color-text-primary)]">
          Watchlist
        </div>
        <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          {isLoading ? "Loading…" : error ? "Couldn’t load watchlist." : null}
        </div>
      </GlassCard>

      {(data ?? []).length === 0 ? (
        <GlassCard mode="subtle" padding="lg">
          <div className="flex items-start gap-4">
            <div
              aria-hidden="true"
              className={cn(
                "relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-lg)] border",
                "border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
              )}
            >
              <div className="absolute inset-0 bg-[var(--gradient-ramp-accent)] opacity-[0.18]" />
              <div className="relative grid gap-1">
                <div className="h-1.5 w-7 rounded-[999px] bg-[var(--color-text-muted)] opacity-70" />
                <div className="h-1.5 w-6 rounded-[999px] bg-[var(--color-text-muted)] opacity-55" />
                <div className="h-1.5 w-5 rounded-[999px] bg-[var(--color-text-muted)] opacity-40" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px]">
                Nothing here yet
              </div>
              <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                Search for an item and save it to track price drops.
              </div>

              <Link
                href="/"
                className={cn(
                  "mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5",
                  "bg-[var(--gradient-ramp-accent)] text-white shadow-[var(--shadow-accent-glow)]",
                  "font-[var(--font-text)] text-[13px] font-semibold tracking-[-0.2px]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                )}
              >
                Search
              </Link>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-6">
          {(["grocery", "electronics", "cabs"] as const).map((category) => {
            const items = (data ?? []).filter((i) => i.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} className="flex flex-col gap-3">
                <div className="font-[var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
                  {category.toUpperCase()}
                </div>
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-[var(--radius-lg)] border p-4",
                        "border-[var(--color-line-subtle)] bg-[var(--color-glass)] shadow-[var(--shadow-card)]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                            {item.title}
                          </div>
                          <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                            {item.subtitle ?? "India"}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          {item.deltaText ? (
                            <span className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-secondary)]">
                              {item.deltaText}
                            </span>
                          ) : null}
                          <div className="flex items-center gap-2">
                            {item.hasAlert ? (
                              <span className="rounded-[var(--radius-pill)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-2 py-1 font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-secondary)]">
                                ALERT
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                void removeItem(item);
                              }}
                              className={cn(
                                "h-9 rounded-[var(--radius-pill)] border px-3",
                                "border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
                                "font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-secondary)]",
                                "hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
                              )}
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

