import { chromium } from "playwright";

import type { PriceResult } from "../../types";

export async function scrapeBigBasket(opts: { q: string; city?: string }): Promise<PriceResult | null> {
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
    await page.goto("https://www.bigbasket.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });

    // Best-effort search: BigBasket often uses dynamic selectors; keep this resilient.
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

      const priceNode = Array.from(document.querySelectorAll("body *")).find((n) => {
        const t = (n.textContent ?? "").trim();
        return /^₹\s*[\d,]+/.test(t);
      });

      const t = (priceNode?.textContent ?? "").trim();
      const m = t.match(/₹\s*([\d,]+)/);
      const price = m ? Number(m[1]!.replace(/,/g, "")) : null;

      const titleEl = document.querySelector("h1") ?? document.querySelector("h2") ?? document.querySelector("h3");
      const title = text(titleEl);

      return { price, title, url: location.href };
    });

    if (typeof extracted.price !== "number" || !Number.isFinite(extracted.price)) return null;

    return {
      platformId: "bigbasket",
      platformName: "BigBasket",
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

