# Pricely — Full Rewrite Plan

> This document supersedes all previous rebuild/refactor plans.  
> The previous `REBUILD_PLAN.md` (search-first UX pass) is no longer active — it addressed a partial refactor of the old codebase. This is a full rewrite.

---

## What Is Being Replaced

Everything under `app/` (routes, layouts, API routes, globals.css) and `src/` (components, features, styles, lib, services, hooks, types, constants, config) is being deleted and rewritten from scratch.

**Preserved without modification:**
- `package.json`, `tsconfig.json`, `next.config.*`, `.env*`, `.gitignore`
- `docs/` — all design reference files, product plan, existing plans
- `.cursor/rules/` — agent rule files (already rewritten for the new architecture)
- `postcss.config.mjs`, `eslint.config.mjs`

---

## Why a Full Rewrite (Not a Patch)

The existing codebase has the right folder intent but the wrong implementation throughout:
- UI components use flat backgrounds, no glass system, wrong fonts (Geist → Inter Tight + Inter + JetBrains Mono)
- No real API surface — all data is static mock objects wired directly into components
- No Redis cache, no Supabase schema, no scraper architecture
- Route structure does not match the target app (missing dashboard route group, wrong URL shapes)
- The design system has partial token coverage and no GlassCard primitive

Building on top would require touching every file anyway. A clean rewrite with clear phase gates is lower risk.

---

## Target Architecture

```
app/                              ← Next.js App Router
  (dashboard)/                    ← authenticated shell
    layout.tsx                    ← DesktopNav + TabBar shell
    page.tsx                      ← Home
    search/[query]/page.tsx
    product/[id]/page.tsx
    cabs/page.tsx
    watchlist/page.tsx
  api/
    prices/{grocery,electronics,cabs}/route.ts
    search/trending/route.ts
    alerts/route.ts
    watchlist/route.ts
    history/[productId]/route.ts
    cron/check-alerts/route.ts
  layout.tsx                      ← root: fonts, ThemeProvider
  globals.css

src/
  components/
    ui/          GlassCard · SearchBar · ResultCard · VerdictChip · badges
    layout/      DesktopNav · TabBar
    features/    SparkChart · PlatformLogo · PriceAlert · WatchlistButton
  lib/
    scrapers/    BaseScraper + per-platform (Railway only)
    cache/       redis.ts — Upstash client + key factories
    db/          supabase.ts — server + browser clients
    ai/          verdict.ts — rule-based + optional GPT-4o-mini
    geo/         index.ts — city from request headers
    utils/       format.ts · platforms.ts
  styles/
    tokens.css   ← single source of truth for all CSS variables
  types/
    index.ts     ← PriceResult · Verdict · PriceHistoryPoint · WatchlistItem · City
```

---

## Design System

**Logo:** Direction B — 4 descending bars, gradient `#1ED760 → #1DB954`, ascending opacity `0.5 / 0.7 / 0.85 / 1.0`  
**Wordmark:** `Pricely.` — Inter Tight 500, -0.4px tracking, trailing `.` in `var(--accent)`  
**Glass levels:** thin (blur 12px) · default (blur 28px) · strong (blur 40px)  
**Fonts:** Inter Tight (display) · Inter (body) · JetBrains Mono (prices, ETA, timestamps)  
**Theme:** dark default · light parity via `[data-theme="light"]` CSS var overrides  

Full token reference: see `DESIGN_TOKENS.md` (created in Phase 1).  
Full visual reference: open `docs/design/pricely-design-system.html` in a browser.

---

## Platform Coverage

| Category | Platforms |
|---|---|
| Grocery | Blinkit · Zepto · Swiggy Instamart · BigBasket · DMart Ready |
| Electronics | Flipkart · Amazon · Croma · Reliance Digital · Vijay Sales |
| Cabs | Ola · Uber · Rapido · Namma Yatri · InDrive |

Single registry: `src/lib/utils/platforms.ts` — imported everywhere, never duplicated.

---

## Data Flow

```
User request
  ↓
Next.js API route (Zod validation)
  ↓
Upstash Redis cache check → return if hit
  ↓
Railway Scraper Service (Playwright) / External API
  ↓
Promise.allSettled (partial failure safe)
  ↓
Redis write + Supabase persist (fire-and-forget)
  ↓
Return PriceResult[] to client
  ↓
SWR (refreshInterval: 300s) in client component
```

---

## Execution Phases

Track status in `PROGRESS.md`.

| Phase | Description | Status |
|---|---|---|
| 0 | Audit and deletion inventory | Not started |
| 1 | Rewrite control documents (5 files) | Not started |
| 2 | Foundation reset (deps, tokens, types, utils) | Not started |
| 3 | Shared UI primitives (GlassCard, SearchBar, etc.) | Not started |
| 4 | App shell and navigation | Not started |
| 5 | Pages with mock-API contracts | Not started |
| 6 | API route contract layer | Not started |
| 7 | Data infrastructure (Supabase, Redis) | Not started |
| 8 | External provider integrations | Not started |
| 9 | Alerts, auth, cron, verdict engine | Not started |

---

## Infrastructure Services Required

| Service | Purpose | Tier |
|---|---|---|
| Vercel | Next.js hosting + edge network + cron | Free/Pro |
| Railway | Playwright scraper service (persistent Node) | Free/Hobby |
| Supabase | PostgreSQL + Auth + RLS | Free |
| Upstash | Serverless Redis | Free |
| Resend | Transactional email for alerts | Free (3k/mo) |
| OpenAI | GPT-4o-mini for ambiguous verdict cases | Pay-as-you-go |
| Google Maps JS API | Cab route visualization | Pay-as-you-go |
| Amazon PA API | Electronics pricing (affiliate) | Free with account |
| Flipkart Affiliate API | Electronics pricing (affiliate) | Free with account |

---

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Railway scraper service
SCRAPER_SERVICE_URL=
SCRAPER_SERVICE_SECRET=

# OpenAI
OPENAI_API_KEY=

# Amazon PA API
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=

# Flipkart Affiliate
FLIPKART_AFFILIATE_ID=
FLIPKART_AFFILIATE_TOKEN=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=

# Alert cron
CRON_SECRET=

# Resend email
RESEND_API_KEY=
```
