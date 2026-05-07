"use client";

import React, { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils/cn";

type SparkChartProps = {
  values: number[];
  className?: string;
};

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "").trim();
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const num = Number.parseInt(normalized, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function SparkChart({ values, className }: SparkChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const normalized = useMemo(() => {
    if (values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);
    return values.map((v, i) => ({
      x: i / (values.length - 1),
      y: (v - min) / range,
    }));
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !normalized) return;

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio ?? 1));

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const accent = readVar("--color-accent") || "#1db954";
    const textPrimary = readVar("--color-text-primary") || "#f6f6f8";

    const padX = 6;
    const padY = 8;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const toX = (t: number) => padX + t * plotW;
    const toY = (t: number) => padY + (1 - t) * plotH;

    ctx.beginPath();
    normalized.forEach((p, idx) => {
      const x = toX(p.x);
      const y = toY(p.y);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const last = normalized[normalized.length - 1];
    const lastX = toX(last.x);
    const lastY = toY(last.y);

    // Fill
    ctx.lineTo(lastX, padY + plotH);
    ctx.lineTo(toX(normalized[0].x), padY + plotH);
    ctx.closePath();

    const fill = ctx.createLinearGradient(0, padY, 0, padY + plotH);
    fill.addColorStop(0, hexToRgba(accent, 0.18));
    fill.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = fill;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    normalized.forEach((p, idx) => {
      const x = toX(p.x);
      const y = toY(p.y);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = hexToRgba(accent, 0.85);
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Endpoint dot
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(textPrimary, 0.92);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(accent, 0.95);
    ctx.fill();
  }, [normalized]);

  if (!normalized) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)] text-[var(--color-text-muted)]",
          "h-[90px] w-[240px]",
          className,
        )}
      >
        <span className="font-[var(--font-mono)] text-[11px]">No data</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "block rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[var(--glass-thin)]",
        "h-[90px] w-[240px]",
        className,
      )}
    />
  );
}

