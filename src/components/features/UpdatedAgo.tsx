"use client";

import React, { useEffect, useMemo, useState } from "react";

import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function UpdatedAgo({
  updatedAt,
  className,
}: {
  updatedAt: number;
  className?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const text = useMemo(() => formatRelativeTime(now - updatedAt), [now, updatedAt]);

  return (
    <span className={cn("font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]", className)}>
      updated {text}
    </span>
  );
}

