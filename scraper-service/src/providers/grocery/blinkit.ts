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

export async function scrapeBlinkit(opts: { q: string; city?: string }): Promise<PriceResult | null> {
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

  // Blinkit frequently reads location from localStorage; set several common keys defensively.
  await ctx.addInitScript(({ lat, lng }: { lat: number; lng: number }) => {
    const set = (k: string, v: unknown) => {
      try {
        localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
      } catch {
        // ignore
      }
    };

    set("lat", String(lat));
    set("lng", String(lng));
    set("latitude", String(lat));
    set("longitude", String(lng));
    set("user_lat", String(lat));
    set("user_lng", String(lng));
    set("location", { lat, lng });
  }, { lat, lng });

  const page = await ctx.newPage();

  try {
    await page.goto("https://blinkit.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(1_500);

    // Best-effort search: try common input patterns.
    const candidates = [
      "input[type='search']",
      "input[placeholder*='Search' i]",
      "input[aria-label*='Search' i]",
      "input[name*='search' i]",
    ];

    let filled = false;
    for (const sel of candidates) {
      const el = await page.$(sel);
      if (!el) continue;
      await el.fill(q);
      await el.press("Enter");
      filled = true;
      break;
    }

    if (!filled) return null;

    await page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
    await page.waitForTimeout(1_000);

    const extracted = await page.evaluate(() => {
      const text = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();

      // Look for a rupee price; prefer shorter nodes to avoid matching huge container text.
      const nodes = Array.from(document.querySelectorAll("body *")).filter((n) => {
        const t = (n.textContent ?? "").trim();
        return t.length > 0 && t.length < 32 && /^₹\s*[\d,]+/.test(t);
      });
      const t = (nodes[0]?.textContent ?? "").trim();
      const m = t.match(/₹\s*([\d,]+)/);
      const price = m ? Number(m[1]!.replace(/,/g, "")) : null;

      const titleEl =
        document.querySelector("h1") ??
        document.querySelector("h2") ??
        document.querySelector("[data-testid*='title' i]") ??
        document.querySelector("h3");
      const title = text(titleEl);

      return { price, title, url: location.href };
    });

    if (typeof extracted.price !== "number" || !Number.isFinite(extracted.price)) return null;

    return {
      platformId: "blinkit",
      platformName: "Blinkit",
      category: "grocery",
      price: extracted.price,
      updatedAt: new Date().toISOString(),
      url: extracted.url,
      offerText: extracted.title ? extracted.title : undefined,
    };
  } catch {
    return null;
  } finally {
    await ctx.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

