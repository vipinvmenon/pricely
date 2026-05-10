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

export async function scrapeSwiggyInstamart(opts: { q: string; city?: string }): Promise<PriceResult | null> {
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

  // Swiggy reads multiple location hints from storage/cookies; set a minimal hint.
  await ctx.addInitScript(({ lat, lng }: { lat: number; lng: number }) => {
    try {
      localStorage.setItem("lat", String(lat));
      localStorage.setItem("lng", String(lng));
      localStorage.setItem("userLocation", JSON.stringify({ lat, lng }));
    } catch {
      // ignore
    }
  }, { lat, lng });

  const page = await ctx.newPage();

  try {
    // Instamart is embedded inside Swiggy. Start at homepage and try to search globally.
    await page.goto("https://www.swiggy.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(2_000);

    // Best-effort search input patterns.
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
    await page.waitForTimeout(1_500);

    const extracted = await page.evaluate(() => {
      const priceNode = Array.from(document.querySelectorAll("body *")).find((n) => {
        const t = (n.textContent ?? "").trim();
        return t.length > 0 && t.length < 32 && /^₹\s*[\d,]+/.test(t);
      });
      const t = (priceNode?.textContent ?? "").trim();
      const m = t.match(/₹\s*([\d,]+)/);
      const price = m ? Number(m[1]!.replace(/,/g, "")) : null;
      return { price, url: location.href };
    });

    if (typeof extracted.price !== "number" || !Number.isFinite(extracted.price)) return null;

    return {
      platformId: "swiggy_instamart",
      platformName: "Swiggy Instamart",
      category: "grocery",
      price: extracted.price,
      updatedAt: new Date().toISOString(),
      url: extracted.url,
    };
  } catch {
    return null;
  } finally {
    await ctx.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

