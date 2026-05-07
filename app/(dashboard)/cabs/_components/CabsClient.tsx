"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import type { PriceResult } from "@/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { ResultCard } from "@/components/ui/ResultCard";
import { cn } from "@/lib/utils/cn";
import { fetchJson } from "@/lib/utils/fetchJson";

export function CabsClient() {
  const [from, setFrom] = useState("Indiranagar");
  const [to, setTo] = useState("MG Road");
  const [tier, setTier] = useState<"auto" | "mini" | "sedan">("mini");

  const key = useMemo(() => {
    const qs = new URLSearchParams({
      from_lat: "",
      from_lng: "",
      to_lat: "",
      to_lng: "",
      city: "",
    });
    return `/api/prices/cabs?${qs.toString()}`;
  }, []);

  const { data, isLoading, error } = useSWR<PriceResult[]>(key, fetchJson, {
    refreshInterval: 300_000,
  });

  const best = (data ?? [])[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <GlassCard padding="lg">
        <div className="font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.6px] text-[var(--color-text-primary)]">
          Cabs
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-[var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
              FROM
            </span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={cn(
                "h-11 rounded-[var(--radius-md)] border px-4",
                "border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
                "text-[13px] text-[var(--color-text-primary)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
              )}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-[var(--font-mono)] text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">
              TO
            </span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={cn(
                "h-11 rounded-[var(--radius-md)] border px-4",
                "border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
                "text-[13px] text-[var(--color-text-primary)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
              )}
            />
          </label>
        </div>

        <div className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
          {isLoading ? "Loading fare estimates…" : error ? "API not ready yet (Phase 6)." : null}
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <div className="font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px]">
          Route map
        </div>
        <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          Placeholder (Phase 8/9 will add maps)
        </div>
        <div className="mt-4 h-[240px] w-full rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] lg:h-[320px]" />
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        {([
          { id: "auto", label: "AUTO" },
          { id: "mini", label: "MINI" },
          { id: "sedan", label: "SEDAN" },
        ] as const).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTier(t.id)}
            className={cn(
              "h-11 rounded-[var(--radius-pill)] border px-4",
              "font-[var(--font-mono)] text-[11px] font-semibold tracking-wide",
              tier === t.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "border-[var(--color-line-subtle)] bg-[var(--glass-thin)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {(data ?? []).map((r, idx) => (
          <ResultCard key={`${r.platformId}-${idx}`} result={r} isBest={idx === 0} />
        ))}
      </div>

      {best ? (
        <div className="lg:hidden fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-40 px-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] p-4 shadow-[var(--shadow-float)] backdrop-blur-[var(--blur-strong)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-[var(--font-display)] text-[14px] font-semibold tracking-[-0.3px] text-[var(--color-text-primary)]">
                  Cheapest
                </div>
                <div className="mt-1 truncate font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                  {best.platformName} · {tier.toUpperCase()}
                </div>
              </div>
              <div className="shrink-0 font-[var(--font-mono)] text-[16px] font-semibold tabular-nums text-[var(--color-text-primary)]">
                ₹{Math.round(best.price).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

