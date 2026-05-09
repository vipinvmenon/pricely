import { chromium } from "playwright";

import type { PriceResult } from "../../types";

type LatLng = { lat: number; lng: number };

const CITY_TO_LATLNG: Record<string, LatLng> = {
  BLR: { lat: 12.9716, lng: 77.5946 },
  DEL: { lat: 28.6139, lng: 77.209 },
  MUM: { lat: 19.076, lng: 72.8777 },
  HYD: { lat: 17.385, lng: 78.4867 },
  CHE: { lat: 13.0827, lng: 80.2707 },
  PUN: { lat: 18.5204, lng: 73.8567 },
};

function resolveCityLatLng(city?: string): LatLng {
  const key = (city ?? "").trim().toUpperCase();
  return CITY_TO_LATLNG[key] ?? CITY_TO_LATLNG.BLR!;
}

function extractFirstPrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const m = value.match(/₹?\s*([\d,]+(?:\.\d+)?)/);
    if (m) {
      const n = Number(m[1]!.replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    }
  }
  return null;
}

function walkForPrice(obj: unknown): number | null {
  if (!obj || typeof obj !== "object") return null;
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const n = walkForPrice(v);
      if (n != null) return n;
    }
    return null;
  }

  const rec = obj as Record<string, unknown>;
  const directKeys = ["selling_price", "sale_price", "price", "mrp", "discounted_price", "final_price"];
  for (const k of directKeys) {
    if (k in rec) {
      const n = extractFirstPrice(rec[k]);
      if (n != null) return n;
    }
  }

  for (const v of Object.values(rec)) {
    const n = walkForPrice(v);
    if (n != null) return n;
  }
  return null;
}

export async function scrapeZepto(opts: { q: string; city?: string }): Promise<PriceResult | null> {
  const q = opts.q.trim();
  if (!q) return null;

  const { lat, lng } = resolveCityLatLng(opts.city);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    geolocation: { latitude: lat, longitude: lng },
    permissions: ["geolocation"],
  });

  const page = await ctx.newPage();

  // Zepto is highly dynamic. We'll attempt:
  // - load site
  // - run a best-effort search input interaction
  // - sniff JSON XHR responses for a product list that contains a price
  let foundPrice: number | null = null;
  let foundUrl: string | null = null;

  page.on("response", async (res) => {
    if (foundPrice != null) return;
    const ct = res.headers()["content-type"] ?? "";
    if (!ct.includes("application/json")) return;
    const url = res.url();
    // Keep this broad but avoid huge, irrelevant payloads.
    if (!/search|product|items|catalog|listing/i.test(url)) return;
    try {
      const data = (await res.json()) as unknown;
      const price = walkForPrice(data);
      if (price != null) {
        foundPrice = price;
        foundUrl = url;
      }
    } catch {
      // ignore parse failures
    }
  });

  try {
    await page.goto("https://www.zeptonow.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(2_000);

    const candidates = [
      "input[type='search']",
      "input[placeholder*='Search' i]",
      "input[aria-label*='Search' i]",
      "input[name*='search' i]",
    ];

    for (const sel of candidates) {
      const el = await page.$(sel);
      if (!el) continue;
      await el.fill(q);
      await el.press("Enter");
      break;
    }

    // Give network a moment to fire search/catalog XHRs.
    for (let i = 0; i < 6; i++) {
      if (foundPrice != null) break;
      await page.waitForTimeout(1_000);
    }

    if (foundPrice == null) return null;

    return {
      platformId: "zepto",
      platformName: "Zepto",
      category: "grocery",
      price: foundPrice,
      updatedAt: new Date().toISOString(),
      url: page.url(),
      offerText: foundUrl ? "Live price (XHR)" : undefined,
    };
  } catch {
    return null;
  } finally {
    await ctx.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

