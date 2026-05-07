"use client";

import React, { useCallback } from "react";

import { cn } from "@/lib/utils/cn";

type SearchBarSize = "sm" | "md" | "lg";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onFilterClick,
  placeholder = "Search for milk, iPhone, or a cab…",
  size = "md",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onFilterClick?: () => void;
  placeholder?: string;
  size?: SearchBarSize;
  className?: string;
}) {
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.();
    },
    [onSubmit],
  );

  // Match design reference heights: 44 / 54 / 64
  const height = size === "sm" ? "h-11" : size === "lg" ? "h-16" : "h-[54px]";
  const pad = "pl-5 pr-3";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative isolate w-full overflow-hidden rounded-[var(--radius-pill)]",
        className,
      )}
    >
      {/* Layer: frosted glass */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "bg-[var(--color-glass-strong)]",
          "[backdrop-filter:blur(32px)_saturate(190%)_brightness(1.06)]",
          "shadow-[var(--fx-search-shadow)]",
        )}
      />
      {/* Layer: border */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] border border-[var(--color-glass-border)]"
      />

      <div className={cn("relative z-[2] flex items-center gap-3", height, pad)}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none",
            "font-[var(--font-text)] text-[15px] font-normal tracking-[-0.2px]",
            value.length > 0 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]",
            "placeholder:text-[var(--color-text-muted)]",
          )}
          aria-label="Search"
        />

        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Filters"
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
            "border-[var(--color-accent)] bg-[var(--color-accent-soft)]",
            "text-[var(--color-accent)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
          )}
        >
          <span className="font-[var(--font-mono)] text-[11px] font-semibold">≡</span>
        </button>
      </div>
    </form>
  );
}
