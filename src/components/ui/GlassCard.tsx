import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type GlassMode = "default" | "subtle" | "strong";
type GlassRadius = "xs" | "sm" | "md" | "lg" | "xl" | "pill";
type GlassPadding = "none" | "sm" | "md" | "lg";

type GlassCardProps = {
  children: ReactNode;
  mode?: GlassMode;
  radius?: GlassRadius;
  floating?: boolean;
  padding?: GlassPadding;
  className?: string;
};

const modeClass: Record<GlassMode, string> = {
  subtle: "bg-[var(--glass-thin)] border-[var(--color-line-subtle)]",
  default: "bg-[var(--color-glass)] border-[var(--color-glass-border)]",
  strong: "bg-[var(--color-glass-strong)] border-[var(--color-glass-border)]",
};

const radiusClass: Record<GlassRadius, string> = {
  xs: "rounded-[var(--radius-xs)]",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  xl: "rounded-[var(--radius-xl)]",
  pill: "rounded-[var(--radius-pill)]",
};

const paddingClass: Record<GlassPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function GlassCard({
  children,
  mode = "default",
  radius = "lg",
  floating = false,
  padding = "md",
  className,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden border",
        floating ? "shadow-[var(--shadow-float)]" : "shadow-[var(--shadow-card)]",
        modeClass[mode],
        radiusClass[radius],
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-[var(--glass-thin)]" />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[1]",
          mode === "strong"
            ? "[backdrop-filter:blur(var(--blur-strong))_saturate(180%)_brightness(1.06)]"
            : "[backdrop-filter:blur(var(--blur-glass))_saturate(170%)]",
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[var(--fx-glass-highlight)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-[var(--specular-rim)] opacity-70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] rounded-[inherit] border border-[var(--color-glass-border)]"
      />
      <div className={cn("relative z-[5]", paddingClass[padding])}>{children}</div>
    </div>
  );
}

