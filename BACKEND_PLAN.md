# Pricely — Backend Architecture Plan

**Status:** Draft · Pending approval  
**Depends on:** `REBUILD_PLAN.md` (UI layer)  
**Core problem:** The entire product is currently mocked. No real prices, no real catalog, no real ingestion.

---

## Current State (Honest Assessment)

| Layer | Current | Problem |
|-------|---------|---------|
| Product catalog | `mock-products.ts` — 20 static entries | Not real, not scalable |
| Prices | `mock-prices.ts` — hardcoded offers | Stale by design |
| Price history | `mock-history.ts` — generated fake series | Not real trend data |
| Search | `search-service.ts` — in-memory filter | No ranking, no relevance |
| Alerts | `alert-service.ts` — localStorage only | Never triggers, no persistence |
| API routes | Exist in `app/api/` but UI never calls them | Dead code |
| Auth | None | No user identity |

---

## The Core Hard Problem

Pricely's value is **real-time price comparison across platforms that have no public APIs.**

Blinkit, Zepto, Swiggy Instamart, BigBasket — none have public price APIs.  
Amazon and Flipkart have affiliate APIs but with constraints.  
Ola and Uber have no public fare estimation APIs.

**This means data ingestion is the hardest engineering problem in this product.**  
Everything else (search, compare, alerts) is straightforward once you have clean, fresh data.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                    Clients (Next.js)                │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────┐
│               API Layer (Next.js app/api)            │
│   /api/search   /api/prices   /api/alerts           │
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌────▼────────┐
│  Search Index │ │  Price DB   │ │  User DB    │
│ (Meilisearch) │ │(TimescaleDB)│ │(PostgreSQL) │
└───────────────┘ └──────┬──────┘ └─────────────┘
                         │ writes
               ┌─────────▼──────────┐
               │   Ingestion Layer  │
               │  (Crawler Engine)  │
               └─────────┬──────────┘
                         │ fetches
        ┌────────────────┼────────────────┐
        │                │                │
 ┌──────▼──────┐  ┌──────▼──────┐ ┌──────▼──────┐
 │  Grocery    │  │  Ecommerce  │ │    Cabs     │
 │  Scrapers   │  │  APIs/Scrapers│ │  Scrapers  │
 │  (Blinkit,  │  │  (Amazon PA, │ │  (Ola,     │
 │  Zepto, BB) │  │  Flipkart)  │ │  Uber)      │
 └─────────────┘  └─────────────┘ └─────────────┘
```

---

## Layer 1: Data Ingestion

### 1a. Grocery Platforms (Blinkit, Zepto, Swiggy Instamart, BigBasket)

**No public APIs exist. Options ranked:**

| Option | Feasibility | Risk | Cost |
|--------|------------|------|------|
| HTTP scraping (parse product JSON from app responses) | High | Medium (ToS) | Low |
| Headless browser (Playwright) | Medium | High (detection) | High (infra) |
| Unofficial reverse-engineered APIs | Low | High (breaks often) | Low |
| Data vendor / broker | High | Low | High ($) |

**Recommended approach:** HTTP scraping of network responses.

Modern grocery apps (Blinkit, Zepto) load product data via internal JSON APIs when you open the app. By capturing and replaying these requests (with appropriate headers/session tokens), prices can be fetched without full browser rendering.

This is fragile but is the standard approach used by price comparison products in India (e.g., JioShopper, GrocerApp).

**Scraper architecture per platform:**
```
PlatformScraper {
  search(query: string, pincode: string): Promise<RawProduct[]>
  getProduct(platformProductId: string): Promise<RawProductDetail>
  getPrice(platformProductId: string): Promise<RawPrice>
}
```

Each scraper normalizes to a common `RawProduct` schema before writing to the ingestion queue.

### 1b. Ecommerce Platforms (Amazon, Flipkart)

**Amazon:** Product Advertising API (PA-API) — official, rate-limited, requires affiliate account. Returns price, availability, ASIN. Best option for electronics/fashion.

**Flipkart:** Flipkart Affiliate API — similar to Amazon PA-API. Covers most of ecommerce catalog.

**Meesho, Myntra, Nykaa:** HTTP scraping (same pattern as grocery).

### 1c. Cabs (Ola, Uber, Rapido)

No official fare estimation APIs. Approaches:

1. **Uber Price Estimation API** — Uber does have an official API, but access requires app approval for each market.
2. **Ola:** No public API. Scraping the Ola web app or using unofficial endpoints.
3. **Rapido:** No public API.

**Near-term fallback:** Use fare calculation formulas (base fare + per-km + per-min + surge) based on publicly known tariff structures. Display "estimated" with appropriate disclaimer.

**This is acceptable for v1** — cab fares are formula-based and platforms publish tariff cards.

---

## Layer 2: Product Catalog + Matching

The hardest normalization problem: the same product appears differently across platforms.

```
Blinkit:   "Amul Toned Milk 1L"
Zepto:     "Amul Toned Milk (1 Litre)"
BigBasket: "Amul Toned Milk, 1 liter"
```

These must resolve to a single canonical product ID for comparison to work.

### Matching strategy (in priority order):

1. **Barcode/EAN** — Most reliable. Grocery products have EAN barcodes. Scrapers should extract these where available. Match on EAN → same product.

2. **Brand + normalized name + quantity** — Parse brand, product name, unit, and quantity. Normalize units (1L = 1000ml). Fuzzy match on normalized form.

3. **OpenFoodFacts / Open Product Data** — Open database of grocery products indexed by barcode. Can use as a canonical catalog source for grocery.

4. **Manual curation** — For high-traffic products (top 1000 SKUs), curate manually. Accept imperfect matching for the long tail.

### Product catalog schema:

```sql
products (
  id          UUID PRIMARY KEY,
  name        TEXT NOT NULL,         -- canonical name
  brand       TEXT,
  category    TEXT,
  subcategory TEXT,
  barcode     TEXT,                   -- EAN/UPC if known
  unit        TEXT,                   -- "1L", "500g", "1 pair"
  image_url   TEXT,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ
)

platform_products (
  id                  UUID PRIMARY KEY,
  product_id          UUID REFERENCES products(id),
  platform_id         TEXT,           -- "blinkit", "zepto", etc.
  platform_product_id TEXT,           -- platform's own ID/slug
  platform_name       TEXT,           -- name as shown on platform
  platform_url        TEXT,
  is_available        BOOLEAN,
  last_scraped_at     TIMESTAMPTZ
)
```

---

## Layer 3: Price Storage

Prices change frequently (grocery prices update 2-4x/day; ecommerce prices change hourly).

### Schema:

```sql
prices (
  id                  UUID PRIMARY KEY,
  platform_product_id UUID REFERENCES platform_products(id),
  price               NUMERIC(10,2),
  mrp                 NUMERIC(10,2),
  discount_pct        NUMERIC(5,2),
  offer_text          TEXT,           -- "Use FIRST10 for 10% off"
  eta_minutes         INTEGER,        -- delivery estimate
  in_stock            BOOLEAN,
  scraped_at          TIMESTAMPTZ,    -- when this price was captured
  pincode             TEXT            -- prices vary by location
)
```

Price records are **append-only**. Current price = most recent record per `platform_product_id`.  
History = all records over time (indexed by `scraped_at`).

Use **TimescaleDB** (PostgreSQL extension) for efficient time-series queries on the prices table.

### Freshness targets:

| Platform type | Scrape frequency | Price volatility |
|--------------|-----------------|-----------------|
| Quick commerce (Blinkit, Zepto) | Every 30 min | High (promo pricing) |
| Online grocery (BigBasket, JioMart) | Every 2 hours | Medium |
| Ecommerce (Amazon, Flipkart) | Every 1 hour | High (dynamic pricing) |
| Cabs | On-demand (formula) | Real-time surge |

---

## Layer 4: Search

Current `search-service.ts` does in-memory string matching on 20 products. This needs to become a real search engine.

**Options:**

| Option | Good for | Complexity |
|--------|----------|------------|
| PostgreSQL full-text search | Simple queries, <100k products | Low |
| Meilisearch | Fast typo-tolerant search, easy self-host | Medium |
| Elasticsearch / OpenSearch | High scale, complex ranking | High |
| Algolia | Managed, fast, expensive at scale | Low ops |

**Recommended: Meilisearch** (self-hosted, fast, great DX, typo-tolerant, supports ranking rules).

**Search ranking factors (in order):**
1. Text relevance (name, brand, category match)
2. Availability (in-stock products ranked higher)
3. Price confidence (products with fresh prices ranked higher)
4. Popularity (search frequency as signal)

**Search response shape (replacing current `SearchResult`):**

```typescript
type SearchResult = {
  product: Product;           // canonical product
  platforms: PlatformOffer[]; // sorted cheapest first
  topPrice: number;           // cheapest available price
  freshnessMs: number;        // age of newest price data
  matchScore: number;         // search relevance score
}

type PlatformOffer = {
  platformId: string;
  platformName: string;
  price: number;
  mrp: number;
  etaMinutes: number;
  inStock: boolean;
  offers: string[];
  scrapedAt: Date;
}
```

---

## Layer 5: API Layer

The `app/api/` routes exist but are currently wired to mock services. Each route needs to call real services.

### `/api/search?q={query}&pincode={pincode}`

1. Query Meilisearch for matching `product_id` list
2. For each product, fetch latest prices per platform from TimescaleDB
3. Filter out stale data (> 2 hours old for grocery, > 4 hours for ecommerce)
4. Sort by cheapest available
5. Return `SearchResult[]`

**Cache:** Redis with 5-minute TTL per `(query, pincode)` pair.

### `/api/prices/[id]?pincode={pincode}`

1. Fetch all `platform_products` for product `id`
2. Fetch latest price record per platform
3. Fetch 30-day price history (sampled, not every record)
4. Return offers + history

**Cache:** Redis with 2-minute TTL.

### `/api/alerts` (GET / POST / DELETE)

- GET: Return user's alerts (requires auth)
- POST: Create alert with target price + product + platform preference
- DELETE: Remove alert

Alerts stored in PostgreSQL `alerts` table. No localStorage.

---

## Layer 6: Price Alert Engine

**Currently:** localStorage only, never triggers.  
**Target:** Server-side background job that checks prices and notifies users.

### Alert schema:

```sql
alerts (
  id              UUID PRIMARY KEY,
  user_id         UUID,
  product_id      UUID REFERENCES products(id),
  platform_id     TEXT,           -- NULL = any platform
  target_price    NUMERIC(10,2),
  notification_type TEXT[],       -- ["email", "push"]
  triggered_at    TIMESTAMPTZ,    -- NULL if not yet triggered
  created_at      TIMESTAMPTZ
)
```

### Alert worker:

- Runs every 15 minutes
- Queries: "which products have a new price below any active alert's target?"
- For each match: send notification + mark `triggered_at`
- Built with BullMQ (Redis-backed job queue) + Resend (email)

---

## Layer 7: User Identity

**Currently:** No auth. Watchlist and alerts are per-browser localStorage.  
**Target:** Lightweight auth so alerts/watchlist persist across devices.

**Recommended:** Clerk or Auth.js (NextAuth)  
- Magic link / OTP login (no password friction)
- Free tier covers early-stage usage
- Session tied to user ID — alerts, watchlist, history all server-side

**Scope:** Auth is a prerequisite for server-side alerts. Not needed for search/compare core flow (those are anonymous).

---

## Layer 8: Infrastructure

### Development (now):
- Next.js on localhost
- Mock data files
- No external services

### Staging (Phase 1 target):
- Next.js on Vercel
- PostgreSQL + TimescaleDB on Railway or Supabase
- Meilisearch on Railway or Meilisearch Cloud
- Redis on Upstash
- Crawler on a single VPS (DigitalOcean / Hetzner)
- Cron jobs for scheduled scraping

### Production (Phase 2+):
- Crawler fleet (multiple scrapers, per-platform workers)
- CDN caching for search responses
- Rate limiting on API
- Monitoring (Sentry, Datadog)

---

## Phase Roadmap

### Phase 0 — Foundation (Current)
- [x] Mock product catalog (20 products)
- [x] Mock prices
- [x] API routes (not wired)
- [ ] UI rebuild (per `REBUILD_PLAN.md`)

### Phase 1 — Real Data (First milestone)
**Goal:** Real prices for 50 curated products across 3 grocery platforms (Blinkit, Zepto, BigBasket)

- [ ] Set up PostgreSQL schema (products, platform_products, prices)
- [ ] Build Blinkit scraper (HTTP, not headless)
- [ ] Build Zepto scraper
- [ ] Build BigBasket scraper
- [ ] Product matching for top 50 grocery SKUs (manual curation)
- [ ] Wire `/api/search` to real DB (remove mock)
- [ ] Wire `/api/prices/[id]` to real DB
- [ ] Set up Redis cache
- [ ] Deploy crawler as cron job (30-min interval)
- [ ] Display freshness timestamp in UI ("Prices as of 12 min ago")

**Deliverable:** Real price comparison for milk, bread, eggs, Maggi, Amul products.

### Phase 2 — Ecommerce + Scale
- [ ] Amazon PA-API integration
- [ ] Flipkart Affiliate API integration  
- [ ] Meilisearch for product search (replace PostgreSQL FTS)
- [ ] Expand to 500 products
- [ ] Price history charts backed by real data

### Phase 3 — Users + Alerts
- [ ] Auth (Clerk magic link)
- [ ] Server-side watchlist
- [ ] Server-side alerts
- [ ] Alert worker + email notifications (Resend)
- [ ] Push notifications (web push)

### Phase 4 — Cabs + Fashion
- [ ] Cab fare estimation (formula-based + Uber API)
- [ ] Fashion platforms (Myntra, Nykaa, Ajio)
- [ ] Expand to 5000+ products

---

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Scrapers break when platforms change their UI/API | High | Alerting on scraper failures; manual fallback to cached data |
| Anti-bot detection blocks scrapers | High | Rotating proxies, rate limiting, headless browser fallback |
| Price matching errors (wrong product compared) | High | Conservative matching; require barcode match for certainty |
| Legal risk from scraping | Medium | ToS review; affiliate APIs where available; focus on public data |
| Stale prices mislead users | Medium | Always show `scraped_at` timestamp; warn if data is old |
| Amazon PA-API rate limits | Low | Cache aggressively; queue requests |

---

## What Needs a Decision Before Phase 1

1. **Pincode/location handling** — Grocery prices vary by city/area. Do we ask for pincode upfront or default to a major city (Mumbai/Delhi)?

2. **Scraping legal stance** — Are we comfortable scraping grocery platforms? (Most price comparison products in India do this.)

3. **Infrastructure budget** — Phase 1 can run on ~$30-50/month (VPS + DB + Redis). Acceptable?

4. **Product catalog source** — Manual curation of top 50 SKUs, or integrate OpenFoodFacts for the grocery catalog?

5. **Auth timing** — Build auth before alerts (blocks alerts), or ship anonymous compare first and add auth later?
