import React from "react";

import type { PlatformId } from "@/types";
import { cn } from "@/lib/utils/cn";
import { PLATFORMS } from "@/lib/utils/platforms";

function abbreviate(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function PlatformLogo({
  platformId,
  size = "md",
  className,
}: {
  platformId: PlatformId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const platform = PLATFORMS[platformId];

  const box =
    size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-12 w-12 text-[14px]" : "h-10 w-10 text-[12px]";

  const swatchClass: Record<PlatformId, string> = {
    blinkit: "bg-[var(--platform-blinkit)]",
    zepto: "bg-[var(--platform-zepto)]",
    swiggy_instamart: "bg-[var(--platform-swiggy_instamart)]",
    bigbasket: "bg-[var(--platform-bigbasket)]",
    dmart_ready: "bg-[var(--platform-dmart_ready)]",
    amazon: "bg-[var(--platform-amazon)]",
    flipkart: "bg-[var(--platform-flipkart)]",
    croma: "bg-[var(--platform-croma)]",
    reliance_digital: "bg-[var(--platform-reliance_digital)]",
    vijay_sales: "bg-[var(--platform-vijay_sales)]",
    ola: "bg-[var(--platform-ola)]",
    uber: "bg-[var(--platform-uber)]",
    rapido: "bg-[var(--platform-rapido)]",
    namma_yatri: "bg-[var(--platform-namma_yatri)]",
    indrive: "bg-[var(--platform-indrive)]",
  };

  return (
    <div
      className={cn(
        "grid place-items-center rounded-[var(--radius-sm)] border border-[var(--color-line-subtle)] shadow-[var(--shadow-card)]",
        swatchClass[platformId],
        box,
        className,
      )}
      aria-label={platform.name}
      title={platform.name}
    >
      <span className="font-[var(--font-mono)] font-semibold tracking-wide text-[var(--color-text-primary)]">
        {abbreviate(platform.name)}
      </span>
    </div>
  );
}

