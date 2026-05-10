"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from "@/lib/db/supabase-browser";
import { cn } from "@/lib/utils/cn";

function displayLabel(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name = typeof meta?.full_name === "string" ? meta.full_name : undefined;
  if (name && name.trim().length > 0) return name.trim();
  if (user.email) return user.email.split("@")[0] ?? "Account";
  if (user.phone) return user.phone;
  return "Account";
}

function initials(label: string): string {
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
  }
  return label.slice(0, 2).toUpperCase();
}

export function NavUserCard() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setReady(true);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUser(data.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    setReady(true);
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass)] p-3">
        <div className="h-9 animate-pulse rounded-[var(--radius-md)] bg-[var(--glass-thin)]" />
      </div>
    );
  }

  if (!isSupabaseBrowserConfigured()) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass)] p-3">
        <div className="text-[12px] text-[var(--color-text-secondary)]">Local mode · no Supabase session</div>
        <Link
          href="/login"
          className={cn(
            "mt-2 flex h-9 w-full items-center justify-center rounded-[var(--radius-md)]",
            "border border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
            "font-[var(--font-text)] text-[12px] font-semibold text-[var(--color-text-primary)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
          )}
        >
          Sign in (needs env)
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass)] p-3">
        <Link
          href="/login"
          className={cn(
            "flex h-10 w-full items-center justify-center rounded-[var(--radius-md)]",
            "bg-[var(--gradient-ramp-accent)] text-white shadow-[var(--shadow-accent-glow)]",
            "font-[var(--font-text)] text-[13px] font-semibold tracking-[-0.2px]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
          )}
        >
          Sign in
        </Link>
      </div>
    );
  }

  const label = displayLabel(user);
  const ini = initials(label);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass)] p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--glass-thin)] text-[var(--color-accent)]">
          <span className="font-[var(--font-mono)] text-[11px] font-semibold">{ini}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{label}</div>
          <div className="mt-0.5 truncate font-[var(--font-mono)] text-[10px] text-[var(--color-text-muted)]">
            {user.email ?? user.phone ?? "Signed in"}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          void getSupabaseBrowserClient()?.auth.signOut().then(() => {
            window.location.reload();
          });
        }}
        className={cn(
          "mt-3 h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
          "font-[var(--font-mono)] text-[10px] font-semibold tracking-wide text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
        )}
      >
        Sign out
      </button>
    </div>
  );
}
