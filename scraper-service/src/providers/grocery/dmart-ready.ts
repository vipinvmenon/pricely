import { chromium } from "playwright";

import type { PriceResult } from "../../types";

export async function scrapeDmartReady(opts: { q: string; city?: string }): Promise<PriceResult | null> {
  const q = opts.q.trim();
  if (!q) return null;

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
  });
  const page = await ctx.newPage();

  try {
    // DMart Ready pages and selectors can change; keep this best-effort and fail-safe.
    // If scraping fails, the Next.js API route will fall back to mocks.
    await page.goto("https://www.dmart.in/", { waitUntil: "domcontentloaded", timeout: 45_000 });

    // Try common search input patterns. (No hard dependency on a specific selector.)
    const candidates = [
      "input[type='search']",
      "input[placeholder*='Search' i]",
      "input[name*='search' i]",
      "input[id*='search' i]",
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

      // Find the first card-ish element with a rupee price.
      const priceNodes = Array.from(document.querySelectorAll("body *")).filter((n) =>
        /₹\s*\d/.test((n.textContent ?? "").slice(0, 64))
      );
      const priceText = priceNodes.map((n) => (n.textContent ?? "")).find((t) => /₹\s*\d/.test(t)) ?? "";
      const m = priceText.match(/₹\s*([\d,]+)/);
      const price = m ? Number(m[1]!.replace(/,/g, "")) : null;

      const titleEl =
        document.querySelector("h1") ??
        document.querySelector("[data-testid*='title' i]") ??
        document.querySelector("h2");
      const title = text(titleEl);

      return { price, title, url: location.href };
    });

    if (typeof extracted.price !== "number" || !Number.isFinite(extracted.price)) return null;

    return {
      platformId: "dmart_ready",
      platformName: "DMart Ready",
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

