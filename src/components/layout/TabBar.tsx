"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type TabItem = {
  href: string;
  label: string;
};

const TABS: TabItem[] = [
  { href: "/", label: "Home" },
  { href: "/watchlist", label: "Watch" },
  { href: "/cabs", label: "Cabs" },
  { href: "/alerts", label: "Alerts" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 p-3">
      <div className="mx-auto max-w-[440px] rounded-[var(--radius-pill)] border border-[var(--color-glass-border)] bg-[var(--color-glass-strong)] shadow-[var(--shadow-float)] backdrop-blur-[var(--blur-strong)]">
        <div className="grid grid-cols-4 gap-1 p-2 text-xs">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "grid h-11 place-items-center rounded-[var(--radius-pill)] transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                  isActive
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <span className="font-[var(--font-mono)] text-[11px] font-semibold tracking-wide">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

