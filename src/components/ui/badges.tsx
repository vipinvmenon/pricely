import React from "react";

import { cn } from "@/lib/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] border px-2 py-1 font-[var(--font-mono)] text-[11px] font-medium tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SaveBadge({ amountText, className }: { amountText: string; className?: string }) {
  return (
    <Badge
      className={cn(
        "border-[var(--color-line-subtle)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
        className,
      )}
    >
      SAVE {amountText}
    </Badge>
  );
}

export function ETABadge({ etaText, className }: { etaText: string; className?: string }) {
  return (
    <Badge
      className={cn(
        "border-[var(--color-line-subtle)] bg-[var(--glass-thin)] text-[var(--color-text-secondary)]",
        className,
      )}
    >
      ETA {etaText}
    </Badge>
  );
}

export function OfferBadge({ offerText, className }: { offerText: string; className?: string }) {
  return (
    <Badge
      className={cn(
        "border-[var(--color-line-subtle)] bg-[var(--glass-thin)] text-[var(--color-text-secondary)]",
        className,
      )}
    >
      {offerText}
    </Badge>
  );
}

