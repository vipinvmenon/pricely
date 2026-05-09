import { fetchJson } from "@/lib/utils/fetchJson";
import { normalizeQuery } from "@/lib/utils/format";
import type { PlatformCategory, PlatformId, PriceResult } from "@/types";

export type ScraperServiceCategory = Extract<PlatformCategory, "grocery" | "electronics" | "cabs">;

export type ScraperServicePriceRequest = {
  category: ScraperServiceCategory;
  platformIds?: PlatformId[];
  q?: string;
  city?: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
};

function hasScraperEnv() {
  return Boolean(process.env.SCRAPER_SERVICE_URL && process.env.SCRAPER_SERVICE_SECRET);
}

function serviceUrl(path: string): string {
  const base = (process.env.SCRAPER_SERVICE_URL ?? "").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function fetchPricesFromScraperService(req: ScraperServicePriceRequest): Promise<PriceResult[] | null> {
  if (!hasScraperEnv()) return null;

  const payload: ScraperServicePriceRequest = {
    ...req,
    q: typeof req.q === "string" ? normalizeQuery(req.q) : undefined,
  };

  // Convention: Railway service exposes POST /v1/prices returning PriceResult[].
  // If the service is not running or differs, we fall back to mock in the API route.
  return await fetchJson<PriceResult[]>(serviceUrl("/v1/prices"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-scraper-secret": process.env.SCRAPER_SERVICE_SECRET!,
    },
    body: JSON.stringify(payload),
  });
}

