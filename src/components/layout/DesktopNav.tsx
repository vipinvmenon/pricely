"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUserCard } from "@/components/layout/NavUserCard";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: <SearchIcon /> },
  { href: "/watchlist", label: "Watchlist", icon: <BookmarkIcon /> },
  { href: "/cabs", label: "Trips", icon: <RouteIcon /> },
  { href: "/alerts", label: "Alerts", icon: <BellIcon /> },
  { href: "/settings", label: "Settings", icon: <GearIcon /> },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:w-[220px] lg:flex-col lg:gap-3 lg:border-r lg:border-[var(--color-line-subtle)] lg:bg-[color-mix(in_oklab,var(--color-bg-canvas),transparent_35%)] lg:p-4">
      <div className="flex items-center justify-between gap-3 px-2 py-1">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[10px] bg-[var(--gradient-ramp-accent)] shadow-[var(--shadow-accent-glow)]" />
          <div className="font-[var(--font-display)] text-[15px] font-semibold tracking-[-0.4px]">
            pricely
          </div>
        </div>
        <Link
          href="/login"
          className={cn(
            "grid h-9 place-items-center rounded-[var(--radius-md)] border px-2",
            "border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
            "font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-muted)]",
            "hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
          )}
        >
          IN
        </Link>
      </div>

      <div
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-2",
          "border-[var(--color-glass-border)] bg-[var(--color-glass)]",
        )}
      >
        <span className="text-[var(--color-text-muted)]">
          <SearchIcon />
        </span>
        <div className="min-w-0 flex-1 truncate text-[13px] text-[var(--color-text-muted)]">
          Quick search
        </div>
        <span className="rounded-[var(--radius-pill)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] px-2 py-1 font-[var(--font-mono)] text-[10px] font-semibold text-[var(--color-text-muted)]">
          ⌘K
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-1 text-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                isActive
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
              )}
            >
              <span className={cn("text-[var(--color-text-muted)]", isActive ? "text-[var(--color-accent)]" : undefined)}>
                {item.icon}
              </span>
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <NavUserCard />
      </div>
    </aside>
  );
}

function baseIconProps() {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    className: "h-4 w-4",
  } as const;
}

function SearchIcon() {
  const p = baseIconProps();
  return (
    <svg {...p}>
      <path
        d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  const p = baseIconProps();
  return (
    <svg {...p}>
      <path
        d="M7 4h10a1 1 0 0 1 1 1v16l-6-3-6 3V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RouteIcon() {
  const p = baseIconProps();
  return (
    <svg {...p}>
      <path
        d="M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 8h6a4 4 0 0 1 4 4v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  const p = baseIconProps();
  return (
    <svg {...p}>
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-2 7-2 7h16s-2 0-2-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GearIcon() {
  const p = baseIconProps();
  return (
    <svg {...p}>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.2-2-3.4-2.3.8a8 8 0 0 0-1.7-1L15.3 4h-3.9l-.2 2.2a8 8 0 0 0-1.7 1l-2.3-.8-2 3.4 2 1.2a7.9 7.9 0 0 0 0 2l-2 1.2 2 3.4 2.3-.8a8 8 0 0 0 1.7 1l.2 2.2h3.9l.2-2.2a8 8 0 0 0 1.7-1l2.3.8 2-3.4-2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
