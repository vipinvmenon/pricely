export function normalizeQuery(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function formatPrice(value: number): string {
  const rounded = Math.round(value);
  return `₹${rounded.toLocaleString("en-IN")}`;
}

export function formatRelativeTime(ageMs: number): string {
  const s = Math.max(0, Math.floor(ageMs / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

