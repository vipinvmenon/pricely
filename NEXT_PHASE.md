# Pricely — Next Phase Implementation Plan

Three phases of concrete work before real prices flow through the product.

---

## ~~Phase A — Fix the Build~~ ✓ Complete

- `tsconfig.json` excludes `scraper/**`
- `railway.toml` build/start commands corrected
- `openai` + `resend` installed
- `npx tsc --noEmit` → zero errors
- `npm run lint` → zero errors
- `npm run build` → all 16 routes compile clean

---

## Phase B — Infrastructure Setup

### B0. Apply schema migration to Supabase (do this first)

The `products.category` column was an enum containing `'grocery'` and `'cabs'`. It must be `text` before scrapers go live — otherwise inserts for electronics/fashion products will fail.

Go to **Supabase Dashboard → SQL Editor** and run the contents of:
```
supabase/migrations/001_drop_category_enum.sql
```

This alters the column type, sets a default of `'electronics'`, and drops the stale enum.

---

### B1. Supabase — enable Google OAuth

In the Supabase Dashboard:
1. **Authentication → Providers → Google** — toggle on, paste your Google OAuth Client ID and Secret
2. **Authentication → URL Configuration** — add allowed redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<your-production-domain>/auth/callback`

To get Google OAuth credentials: [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application). Set the authorised redirect URI to your Supabase project's callback URL (shown in the Supabase OAuth settings panel).

---

### B2. Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com) → Create Database → pick the closest region to your Vercel deployment
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the database details page
3. Add both to **Vercel → Project Settings → Environment Variables** (Production + Preview)

---

### B3. Connect Railway (scraper service)

1. Push this repo to GitHub if not already done
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → select this repo
3. Railway reads `railway.toml` automatically — build runs `cd scraper && npm install && npx playwright install chromium && npm run build`
4. Watch the build log — a successful deploy logs `Pricely scraper listening on port 3001`

### B4. Set Railway environment variables

In Railway → your service → Variables:

| Variable | Value |
|---|---|
| `SCRAPER_SERVICE_SECRET` | Any random 32-char string — **copy it, you need the same value in Vercel** |
| `PORT` | `3001` |
| `AMAZON_ACCESS_KEY` | From AWS — optional, enables PA API path |
| `AMAZON_SECRET_KEY` | From AWS — optional |
| `AMAZON_PARTNER_TAG` | From Amazon Associates — optional |
| `FLIPKART_AFFILIATE_ID` | From Flipkart Affiliate — optional, enables API path |
| `FLIPKART_AFFILIATE_TOKEN` | From Flipkart Affiliate — optional |

Amazon and Flipkart creds are optional — scrapers fall back to Playwright when absent. Add them later to reduce anti-bot risk.

---

### B5. Resend — set up alert emails

1. Go to [resend.com](https://resend.com) → Domains → Add Domain — verify your sending domain via DNS TXT record
2. Go to API Keys → Create API Key
3. Add `RESEND_API_KEY` to Vercel env vars

---

### B6. Set all Vercel environment variables

In **Vercel → Project Settings → Environment Variables**, add everything below. Set all for Production; add localhost values for Development too.

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `UPSTASH_REDIS_REST_URL` | Upstash database page |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash database page |
| `SCRAPER_SERVICE_URL` | Your Railway service URL |
| `SCRAPER_SERVICE_SECRET` | Same value set in Railway (B4) |
| `CRON_SECRET` | Any random 32-char string |
| `RESEND_API_KEY` | Resend API Keys page |
| `OPENAI_API_KEY` | platform.openai.com — optional, enables AI verdict fallback |

After adding all variables: **Vercel → Deployments → Redeploy** (without using cached build).

---

### B7. Smoke test the scraper directly

```bash
# Health check
curl https://<railway-url>/health
# Expected: { "status": "ok" }

# Real search
curl -X POST https://<railway-url>/scrape \
  -H "Content-Type: application/json" \
  -H "X-Scraper-Secret: <your-secret>" \
  -d '{
    "query": "Sony WH-1000XM5",
    "platforms": ["amazon", "flipkart"],
    "city": "mumbai",
    "maxResults": 3
  }'
```

Expected response shape:
```json
{
  "results": [
    {
      "platformId": "amazon",
      "price": 24990,
      "mrp": 34990,
      "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
      "url": "https://www.amazon.in/...",
      "stock": "in_stock",
      "scrapedAt": "2026-06-05T..."
    }
  ],
  "errors": []
}
```

If `results` is empty or `errors` has entries, go to Phase C for that platform.

---

## Phase C — Validate and Fix Each Scraper

All 7 scrapers were written with guessed CSS selectors. Expect at least 2–3 to need fixes. Work through them in order of priority.

**Workflow for each:**
1. Fire a test search via `curl` (see B4)
2. If result is empty: open the site in Chrome, run the same search, open DevTools → Elements, find the actual selectors
3. Update the selector in `scraper/scrapers/<platform>.ts`
4. Re-deploy Railway (`git push` triggers auto-deploy) and re-test
5. Mark done when results come back with non-zero prices and real titles

---

### amazon.ts

**URL:** `https://www.amazon.in/s?k=<query>`  
**Primary path:** PA API v5 (when `AMAZON_ACCESS_KEY` is set) — reliable, no scraping needed  
**Playwright fallback:** Scrapes the search results page  

**Current Playwright selectors:**
| What | Selector |
|---|---|
| Container | `[data-component-type="s-search-result"]` |
| Title | `h2 a span` |
| Price | `.a-price-whole` |
| MRP | `.a-price.a-text-price span.a-offscreen` |
| URL | `h2 a[href]` |

**Risk:** Amazon actively blocks headless browsers — expect CAPTCHA on the Playwright path. The PA API is the only reliable route. Prioritise getting the Amazon affiliate API keys set up before testing this scraper.

**Test query:** `"Sony WH-1000XM5"`

---

### flipkart.ts

**URL:** `https://www.flipkart.com/search?q=<query>`  
**Primary path:** Affiliate API (when `FLIPKART_AFFILIATE_ID` is set)  
**Playwright fallback:** Scrapes the search results page  

**Current Playwright selectors:**
| What | Selector |
|---|---|
| Container | `._1AtVbE` |
| Title | `.KzDlHZ` or `._4rR01T` |
| Price | `._30jeq3` |
| MRP | `._3I9_wc` |
| URL | `a._1fQZEK` |

**Risk:** Flipkart uses obfuscated class names that change with each frontend deploy. These selectors are likely already stale. If the Playwright path returns empty, inspect the current DOM and find the actual classes for price and title.

**Test query:** `"iPhone 16"`

---

### myntra.ts

**URL:** `https://www.myntra.com/<query-slug>`  
**Path:** Playwright only (no API)  

**Current selectors:**
| What | Selector |
|---|---|
| Container | `.product-base` |
| Title | `.product-brand` + ` ` + `.product-product` |
| Price | `.product-discountedPrice` |
| MRP | `.product-strike` |
| URL | `a.product-base` |

**Risk:** Myntra is a React SPA. The `waitForSelector` timeout (10s) may not be enough on Railway. If you get timeouts, increase to 15–20s.  
Note: `myntra.ts` already checks `isFashionQuery()` and returns `[]` for non-fashion searches — this is intentional.

**Test queries:** `"Nike sneakers"`, `"formal shirts"`

---

### croma.ts

**URL:** `https://www.croma.com/search?q=<query>`  
**Path:** Playwright only  

**Current selectors:**
| What | Selector |
|---|---|
| Container | `.product-item` |
| Title | `h3.product-title` |
| Price | `.pdp-price strong` or `.new-price` |
| MRP | `.line-through` |
| URL | `a[href]` |

**Risk:** Moderate. Croma has a relatively stable DOM but uses a mix of class names and sometimes renders prices in nested spans.

**Test queries:** `"Dyson V12"`, `"Samsung 65 inch TV"`

---

### reliance_digital.ts

**URL:** `https://www.reliancedigital.in/search?q=<query>:relevance`  
**Path:** Playwright only  

**Current selectors:**
| What | Selector |
|---|---|
| Container | `.product-list__item` or `.product-item` |
| Title | `.sp__name` or `.product-name` |
| Price | `.final-price` or `.pdp-final-price` |
| MRP | `.mrp` or `.strike-through-price` |
| URL | `a[href]` |

**Risk:** Medium. Reliance Digital loads prices via XHR after initial HTML — the `waitForSelector` on `.sp__name` may succeed before prices are injected. If prices come back as 0, try `waitUntil: 'networkidle'` instead of `'domcontentloaded'`.

**Test query:** `"MacBook Air M3"`

---

### vijay_sales.ts

**URL:** `https://www.vijaysales.com/search/<query>`  
**Path:** Playwright only  

**Current selectors:**
| What | Selector |
|---|---|
| Container | `.product-box` or `.product-card` |
| Title | `.product-name` or `.product-title` |
| Price | `.special-price` or `.selling-price` |
| MRP | `.old-price` or `.original-price` |
| URL | `a[href]` |

**Risk:** Lower traffic site, less anti-bot investment. Likely to be easier to scrape. Vijay Sales is primarily Mumbai/Pune focused — good for the default city.

**Test query:** `"LG refrigerator"`

---

### tata_cliq.ts

**URL:** `https://www.tatacliq.com/search#?searchCategory=all&text=<query>`  
**Path:** Playwright only  

**Current selectors:**
| What | Selector |
|---|---|
| Container | `.product-card` or `[class*="ProductCard"]` |
| Title | `[class*="productTitle"]` or `[class*="ProductTitle"]` |
| Price | `[class*="finalPrice"]` or `[class*="sellingPrice"]` |
| MRP | `[class*="mrp"]` or `[class*="MRP"]` |
| URL | `a[href]` |

**Risk:** TataCliq is a React SPA with a longer hydration time. The timeout is already set to 15s for `waitForSelector`. The hash-based URL (`#?searchCategory=...`) may cause issues — test if Playwright correctly waits for the SPA to render after navigation.

**Test query:** `"Apple Watch Series 10"`

---

## Phase D — Smoke Tests

Once all scrapers pass, verify the full product works end-to-end.

### D1. Compare page shows real prices
1. Open `/compare?q=Sony+WH-1000XM5`
2. Confirm retailer rows show real prices (not `₹24,990` from mock)
3. Confirm the VerdictHero shows a real buy/wait verdict
4. Confirm the price history chart begins populating (may take a few searches to accumulate data)

### D2. Watchlist and Alerts
1. Sign in with a real account
2. Track a product — confirm it appears in `/watchlist`
3. Set a target price alert — confirm it appears in `/alerts`
4. Trigger the cron manually:
   ```bash
   curl https://<domain>/api/cron/alerts \
     -H "Authorization: Bearer <CRON_SECRET>"
   # Expected: { "processed": N }
   ```
5. If a product's current price is below the target, an email should arrive via Resend

### D3. Verify the cron is unauthorized without a secret
```bash
curl https://<domain>/api/cron/alerts
# Expected: 401 Unauthorized
```

---

## Environment Variables — Complete Reference

All values must be set in Vercel (for the Next.js app) unless noted.

```bash
# Supabase — already set
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis — set after Phase B
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Railway scraper — set after Phase B
SCRAPER_SERVICE_URL=
SCRAPER_SERVICE_SECRET=

# Alert cron
CRON_SECRET=

# Resend email
RESEND_API_KEY=

# Optional — enables API paths instead of Playwright for Amazon/Flipkart
OPENAI_API_KEY=
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=
FLIPKART_AFFILIATE_ID=
FLIPKART_AFFILIATE_TOKEN=
```
