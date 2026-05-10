# Pricely — Product Plan

> Last updated: May 2026. UI rebuild complete. This document covers the confirmed
> tech stack, current architecture, and every remaining backend phase.

---

## Product Overview

Pricely is a real-time price comparison platform built for Indian consumers who
want to stop overpaying across a fragmented retail market. It aggregates live
prices from 12 retailers spanning grocery (Blinkit, Zepto, Swiggy Instamart,
BigBasket, DMart Ready) and electronics (Amazon, Flipkart, Croma, Reliance
Digital, Vijay Sales, Tata Cliq, Myntra), as well as real-time cab fares from
BluSmart, Rapido, Uber, and Ola. Every price result is ranked cheapest-first
with a savings amount and a 90-day buy/wait verdict. Users can set target-price
alerts and track items in a watchlist. Pricely is not a coupon site or a deals
marketplace — it is a premium, data-driven decision engine that gives Indian
shoppers clarity on whether to buy now or wait.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict, no `any`, no `@ts-ignore`) |
| Package manager | pnpm |
| Styling | CSS custom properties (design tokens) + Tailwind v4 utilities |
| Animation | Framer Motion |
| Global state | Zustand (theme, city, auth session only) |
| Client data fetching | SWR with `refreshInterval: 300_000` |
| Input validation | Zod on every API route |
| Auth + Database | Supabase (PostgreSQL + Auth + Row Level Security) |
| Cache | Upstash Redis |
| Email | Resend |
| Price data | Playwright scrapers on Railway (separate persistent Node process) |
| Frontend hosting | Vercel |
| Scraper hosting | Railway |
| Cron | Vercel cron (alert checks every 5 min) |
| AI verdict fallback | GPT-4o-mini via OpenAI API |
| Charts | SVG/Canvas (SparkLine, PriceChart components) |
| Icons | Lucide React |
| Fonts | Geist + Geist Mono (next/font/google) |

---

## Route Architecture

```
app/
  layout.tsx                        Root layout: Geist font, globals import
  globals.css                       Tailwind import + token vars
  page.tsx                          Home — search hero, trending, feature cards

  compare/
    page.tsx                        Product compare — retailer grid, price history chart

  cabs/
    page.tsx                        Cab fare compare — FareCard list, fare history chart

  watchlist/
    page.tsx                        Watchlist — WatchlistRow list, auth-gated

  signin/
    page.tsx                        Sign in — email/password + Google OAuth

  signup/
    page.tsx                        Sign up — email/password registration

  api/
    trending/
      route.ts                      GET /api/trending
    compare/
      route.ts                      GET /api/compare?q=&city=
    watchlist/
      route.ts                      GET /api/watchlist (auth)
                                    POST /api/watchlist (auth)
                                    DELETE /api/watchlist?id= (auth)
    trips/
      route.ts                      GET /api/trips?from=&to=&city=
    alerts/
      route.ts                      GET /api/alerts (auth)
                                    POST /api/alerts (auth)
                                    DELETE /api/alerts?id= (auth)
    verdict/
      route.ts                      GET /api/verdict?productId=&city=
    search/
      route.ts                      GET /api/search?q=&city=&category=
    cron/
      alerts/
        route.ts                    GET /api/cron/alerts (CRON_SECRET required)

  middleware.ts                     Supabase session refresh on every request
```

---

## Source Architecture

```
src/
  components/
    ui/
      Button.tsx                    Primary/secondary/ghost variants
      Chip.tsx                      Filter pill chip
      FareCard.tsx                  Single cab fare result card
      Glass.tsx                     Glass surface primitive (thin/default/strong)
      Nav.tsx                       Top navigation bar
      PriceBadge.tsx                Save / MRP badge
      PriceChart.tsx                90-day price history chart (SVG)
      RetailerRow.tsx               Single retailer comparison row
      SparkLine.tsx                 Mini trend sparkline (Canvas)
      StatCard.tsx                  Stat summary card
      WatchlistRow.tsx              Single watchlist item row

  lib/
    supabase/
      client.ts                     Browser Supabase client (createBrowserClient)
      server.ts                     Server Supabase client (createServerClient)
    redis/
      client.ts                     Upstash Redis client singleton
      keys.ts                       Cache key factory functions
    scraper/
      client.ts                     HTTP client that calls Railway scraper service
    utils/
      cn.ts                         clsx + tailwind-merge helper
      fetchJson.ts                  Typed fetch wrapper
      format.ts                     formatINR, formatRelativeTime, normalizeQuery
      phone.ts                      Phone number utilities
      platforms.ts                  PLATFORMS registry (16 platforms)

  services/
    compareService.ts               Orchestrates scraper call + Redis cache + DB write
    tripsService.ts                 Orchestrates cab fare scraper + Redis cache
    watchlistService.ts             Supabase CRUD for watchlist table
    alertsService.ts                Supabase CRUD for alerts table
    priceHistoryService.ts          Write + query price_history table
    verdictService.ts               Rule-based verdict + GPT-4o-mini fallback
    searchService.ts                Query fan-out to retailer scrapers + normalise

  types/
    index.ts                        All shared TypeScript types

  styles/
    tokens.css                      All CSS custom properties (design tokens)
```

---

## Backend Phases

All UI work is complete. Every phase below is backend-only.

---

### Phase 1 — Database + Auth

**Objective:** Apply Supabase schema, configure auth providers, wire session
middleware, update platform registry to match target platform set.

**Deliverables:**
- `supabase/schema.sql` applied to Supabase project
- Google OAuth provider enabled in Supabase Dashboard
- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — server client (RSC + route handlers)
- `middleware.ts` — session refresh on every request, cookie handling
- `src/types/index.ts` — `PlatformId` updated to include `tata_cliq`, `myntra`, `blusmart`; remove `namma_yatri`, `indrive`
- `src/lib/utils/platforms.ts` — PLATFORMS registry updated to 16 entries

---

### Phase 2 — Real API Routes

**Objective:** Replace all four mock route handlers with live implementations
backed by Supabase and Redis. Mock fallbacks remain active when env vars absent.

**Deliverables:**
- `app/api/trending/route.ts` — Supabase query + Redis cache
- `app/api/compare/route.ts` — scraper call via service + Redis cache
- `app/api/watchlist/route.ts` — Supabase CRUD, auth-gated
- `app/api/trips/route.ts` — cab scraper via service + Redis cache
- `src/lib/redis/client.ts`
- `src/lib/redis/keys.ts`
- `src/services/compareService.ts` (stub — returns mock until Phase 3)
- `src/services/tripsService.ts` (stub — returns mock until Phase 5)

---

### Phase 3 — Price Data Infrastructure

**Objective:** Build the scraper service client and Redis cache layer that all
compare and search routes depend on.

**Deliverables:**
- `src/lib/scraper/client.ts` — HTTP client for Railway scraper service
- `src/services/compareService.ts` — full implementation with cache + fallback
- `src/services/priceHistoryService.ts` — write new price points to DB
- Redis key schema documented and implemented in `src/lib/redis/keys.ts`
- Mock fallback paths gated behind `process.env.SCRAPER_SERVICE_URL`

---

### Phase 4 — Scrapers: Retailers

**Objective:** Build one scraper module per retail platform, deployed as a
Railway microservice. Each scraper extracts price, MRP, stock status, delivery
estimate, and product URL.

**Deliverables (Railway service — `scraper/` directory):**
- `scraper/scrapers/amazon.ts`
- `scraper/scrapers/flipkart.ts`
- `scraper/scrapers/croma.ts`
- `scraper/scrapers/reliance_digital.ts`
- `scraper/scrapers/vijay_sales.ts`
- `scraper/scrapers/tata_cliq.ts`
- `scraper/scrapers/myntra.ts`
- `scraper/scrapers/blinkit.ts`
- `scraper/scrapers/zepto.ts`
- `scraper/scrapers/swiggy_instamart.ts`
- `scraper/scrapers/bigbasket.ts`
- `scraper/scrapers/dmart_ready.ts`
- `scraper/index.ts` — Express HTTP server, `/scrape` endpoint
- `scraper/types.ts` — shared scraper types

---

### Phase 5 — Scrapers: Cabs

**Objective:** Build one scraper per cab platform. Cab scrapers take `from` and
`to` coordinates and return price + ETA.

**Deliverables:**
- `scraper/scrapers/cabs/blusmart.ts`
- `scraper/scrapers/cabs/rapido.ts`
- `scraper/scrapers/cabs/uber.ts`
- `scraper/scrapers/cabs/ola.ts`
- `src/services/tripsService.ts` — full implementation with cache

---

### Phase 6 — Price History

**Objective:** Every compare API call writes new price points to `price_history`.
The chart query returns the last 90 days for a product+platform combination.

**Deliverables:**
- `src/services/priceHistoryService.ts` — `writePricePoints`, `getPriceHistory`
- `supabase/schema.sql` — `price_history` table (already drafted)
- Deduplication: skip write if price unchanged within last 1 hour for same
  `(product_id, platform_id, city)`

---

### Phase 7 — Watchlist

**Objective:** Authenticated users can add/remove items from their watchlist.
Logged-out users see a localStorage preview that prompts sign-in on persist.

**Deliverables:**
- `app/api/watchlist/route.ts` — GET / POST / DELETE with Zod + auth guard
- `src/services/watchlistService.ts` — Supabase CRUD
- Optimistic UI mutation via SWR `mutate`
- localStorage fallback for unauthenticated state

---

### Phase 8 — Alerts + Cron + Email

**Objective:** Users set a target price for a watchlisted item. A Vercel cron
job runs every 5 minutes, compares current prices to targets, and fires a
Resend email when the target is met.

**Deliverables:**
- `app/api/alerts/route.ts` — GET / POST / DELETE with Zod + auth guard
- `src/services/alertsService.ts` — Supabase CRUD
- `app/api/cron/alerts/route.ts` — cron handler (`CRON_SECRET` verified)
- `src/lib/email/resend.ts` — Resend client + alert email template
- `vercel.json` — cron schedule entry

---

### Phase 9 — Verdict Engine

**Objective:** Every product compare response includes a buy/wait verdict
computed from 90-day price history. Rule-based logic runs first; GPT-4o-mini
fires as fallback when data is sparse or confidence is low.

**Deliverables:**
- `src/services/verdictService.ts` — `computeVerdict(history): Verdict`
- `app/api/verdict/route.ts` — GET endpoint
- GPT-4o-mini prompt template embedded in `verdictService.ts`

---

### Phase 10 — Search

**Objective:** A text query fans out to all relevant platform scrapers, collects
results, normalises them to a common schema, and returns them ranked by price.
No centralised product catalogue — results come entirely from live scraper
responses.

**Deliverables:**
- `app/api/search/route.ts` — GET with Zod, `q`, `city`, `category` params
- `src/services/searchService.ts` — fan-out, normalise, rank
- Result deduplication by normalised product title + brand

---

### Phase 11 — Performance + Observability

**Objective:** Lock in cache TTLs, SWR stale-while-revalidate config, and basic
request logging. Ensure no page requires a live scraper call to render.

**Deliverables:**
- Redis TTL table documented and enforced in `src/lib/redis/keys.ts`
- SWR config in `src/lib/swr/config.ts`
- Request timing logged in all API route handlers
- `app/api/compare/route.ts` — ensure stale cache is returned while fresh data
  is fetched in background

---

### Phase 12 — Launch Readiness

**Objective:** All environment variables documented and set in Vercel and
Railway. Deploy checklist completed. Smoke tests pass.

**Deliverables:**
- `LAUNCH_CHECKLIST.md` — env vars, Vercel config, Railway config, smoke tests
- `vercel.json` — cron + headers config finalised
- `railway.toml` — scraper service config
- `README.md` updated with local dev setup instructions

---

## Design Token Quick Reference

All values from `src/styles/tokens.css` — the single source of truth.

### Backgrounds

| Token | Value |
|---|---|
| `--bg0` | `#0A0A0B` |
| `--bg1` | `#111214` |
| `--bg2` | `#1A1C1F` |
| `--bg3` | `#222528` |

### Accent

| Token | Value |
|---|---|
| `--accent` | `#1ED760` |
| `--accent-dim` | `rgba(30, 215, 96, 0.15)` |
| `--accent-border` | `rgba(30, 215, 96, 0.35)` |

### Text

| Token | Value |
|---|---|
| `--text` | `#F4F4F6` |
| `--text-dim` | `#8A8F98` |
| `--text-faint` | `#4A4F58` |

### Semantic

| Token | Value |
|---|---|
| `--save` | `#1ED760` |
| `--warn` | `#F5A623` |
| `--danger` | `#F05252` |
| `--low-stock` | `#F5A623` |

### Glass Surfaces

| Token | Value |
|---|---|
| `--glass-plate-bg` | `rgba(255,255,255,0.04)` |
| `--glass-plate-border` | `rgba(255,255,255,0.08)` |
| `--glass-plate-highlight` | `rgba(255,255,255,0.06)` |
| `--glass-strong-bg` | `rgba(255,255,255,0.08)` |
| `--glass-strong-border` | `rgba(255,255,255,0.12)` |
| `--glass-solid-bg` | `rgba(20,22,26,0.85)` |
| `--glass-solid-border` | `rgba(255,255,255,0.10)` |

### Radius Scale

| Token | Value |
|---|---|
| `--r-xs` | `6px` |
| `--r-sm` | `10px` |
| `--r-md` | `14px` |
| `--r-lg` | `20px` |
| `--r-xl` | `28px` |
| `--r-xxl` | `36px` |
| `--r-pill` | `999px` |

### Spacing (4 px base)

| Token | Value |
|---|---|
| `--sp-1` | `4px` |
| `--sp-2` | `8px` |
| `--sp-3` | `12px` |
| `--sp-4` | `16px` |
| `--sp-6` | `24px` |
| `--sp-8` | `32px` |
| `--sp-12` | `48px` |

### Shadows

| Token | Value |
|---|---|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)` |
| `--shadow-float` | `0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)` |
| `--shadow-accent` | `0 0 20px rgba(30,215,96,0.25)` |

### Typography

| Token | Value |
|---|---|
| `--font-display` | `'Geist', -apple-system, system-ui, sans-serif` |
| `--font-body` | `'Geist', -apple-system, system-ui, sans-serif` |
| `--font-mono` | `'Geist Mono', ui-monospace, monospace` |

---

## Platform Data Reference

| ID | Name | Category | Scraper Approach |
|---|---|---|---|
| `blinkit` | Blinkit | grocery | Playwright — search results page |
| `zepto` | Zepto | grocery | Playwright — search results page |
| `swiggy_instamart` | Swiggy Instamart | grocery | Playwright — search results page |
| `bigbasket` | BigBasket | grocery | Playwright — search results page |
| `dmart_ready` | DMart Ready | grocery | Playwright — search results page |
| `amazon` | Amazon | electronics | PA API (Product Advertising API); Playwright fallback |
| `flipkart` | Flipkart | electronics | Affiliate API (token-based); Playwright fallback |
| `croma` | Croma | electronics | Playwright — PDP + search results |
| `reliance_digital` | Reliance Digital | electronics | Playwright — search results page |
| `vijay_sales` | Vijay Sales | electronics | Playwright — search results page |
| `tata_cliq` | Tata Cliq | electronics | Playwright — search results page |
| `myntra` | Myntra | electronics | Playwright — search results page |
| `blusmart` | BluSmart | cabs | Deep link / unofficial booking API |
| `rapido` | Rapido | cabs | Playwright — fare estimate flow |
| `uber` | Uber | cabs | Playwright — ride estimate flow |
| `ola` | Ola | cabs | Playwright — fare estimate flow |
