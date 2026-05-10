# Pricely — Rewrite Progress

**Rewrite initiated:** May 2026  
**Baseline runtime:** Next.js 16 · React 19 · pnpm  
**Design references:** `docs/design/design-system-contract.md` · `docs/design/pricely-design-system.html`

---

## Phase 0 — Audit and Deletion Inventory

> Enumerate all files to delete or overwrite. Produce replacement list before any edits.

- [x] List all source files under `app/`, `src/` excluding `node_modules`, `.next`, `.git`
- [x] Read existing route pages: `layout.tsx`, `page.tsx`, `search`, `cabs`, `watchlist`, `alerts`, `profile`, `settings`, `item/[id]`
- [x] Read existing components: `src/components/ui/**`, `src/components/layout/**`
- [x] Read existing styles: `src/styles/**`
- [x] Read existing services/lib/types: `src/services/**`, `src/lib/**`, `src/types/**`
- [x] Confirm `app/` vs `src/app/` convention and lock in one path
- [x] Produce deletion list + replacement map

---

## Phase 1 — Rewrite Control Documents

> Create the 5 canonical control files that all future agents read before working.

- [x] `agents.md` — master agent instructions (platform registry, non-negotiables, file structure)
- [x] `PLAN_FRONTEND.md` — full frontend spec (layouts, interactions, data loading, animations)
- [x] `PLAN_BACKEND.md` — full backend spec (API routes, scrapers, DB schema, cron)
- [x] `TECH_STACK.md` — approved dependencies table + env variable list
- [x] `DESIGN_TOKENS.md` — full `tokens.css` content + GlassCard spec + typography scale

---

## Phase 2 — Foundation Reset

> Install new deps, establish token/type/util layer, delete old style and data files.

- [x] Dependencies installed (framer-motion, zustand, date-fns, @upstash/redis, lucide-react, next-themes; plus zod + Supabase)
- [x] Confirm no incompatible CSS-in-JS libraries present (styled-components, emotion, MUI, antd)
- [x] Write `src/styles/tokens.css` — full token set including `--glass-thin`, `--glass`, `--glass-strong`, `--void-dark`, `--void-light`, all radius, shadow, gradient, and semantic color vars
- [x] Write `app/globals.css` — imports `tokens.css`, sets `html/body` to `var(--bg-page)`
- [x] Write root `app/layout.tsx` — `next/font` (Inter Tight + Inter + JetBrains Mono), `ThemeProvider`, globals import
- [x] Write `src/types/index.ts` — `PriceResult`, `Verdict`, `PriceHistoryPoint`, `WatchlistItem`, `City`, `PlatformId`
- [x] Write `src/lib/utils/platforms.ts` — `PLATFORMS` registry (15 platforms, all categories)
- [x] Write `src/lib/utils/format.ts` — `formatPrice`, `formatRelativeTime`, `normalizeQuery`

---

## Phase 3 — Shared UI Primitives

> Build every reusable component before any page work starts.

- [x] `src/components/ui/GlassCard.tsx` — 3-level variant (thin/default/strong), pseudo-element pattern
- [x] `src/components/ui/SearchBar.tsx` — lg/md/sm sizes, glass-strong surface, accent filter button
- [x] `src/components/ui/badges.tsx` — `SaveBadge`, `ETABadge`, `OfferBadge`
- [x] `src/components/ui/VerdictChip.tsx` — buy (save-soft) and wait (warn-soft) variants
- [x] `src/components/features/PlatformLogo.tsx` — colored rounded square + abbreviation text
- [x] `src/components/features/SparkChart.tsx` — Canvas 2D, gradient fill + accent stroke + endpoint dot
- [x] `src/components/ui/ResultCard.tsx` — glass surface, BEST accent variant, price/save/ETA layout

---

## Phase 4 — App Shell and Navigation

> Build the permanent page chrome for desktop and mobile.

- [x] `src/components/layout/DesktopNav.tsx` — logo row, quick search cmd bar, 5 nav items, user card at bottom (220px, `≥1024px`)
- [x] `src/components/layout/TabBar.tsx` — glass-strong pill, 4 tabs, active inner highlight, fixed bottom mobile
- [x] `app/(dashboard)/layout.tsx` — DesktopNav left + main flex-1 + TabBar, correct padding rules
- [x] Smoke check: shell renders correctly with no page content on both mobile and desktop widths

---

## Phase 5 — Pages (Mock-API-Backed)

> Each page wired to its `/api/*` contract from day one, even if API returns mock data.

### Home (`app/(dashboard)/page.tsx`)

- [x] Server-side city detection from `x-vercel-ip-city` header
- [x] Greeting (morning/afternoon/evening) + city + live "updated Xs ago" counter
- [x] SearchBar lg + category pills
- [x] Desktop: 60/40 trending + watchlist preview grid
- [x] Mobile: hero headline with gradient `everything.`, trending list
- [x] Wired to `GET /api/search/trending?city=`
- [x] Wired to `GET /api/watchlist` (empty state handled)

### Search Results (`app/(dashboard)/search/[query]/page.tsx`)

- [x] Sticky pre-filled SearchBar + category pills + sort pills
- [x] Product header card (thumbnail, name, platform count, VerdictChip)
- [x] Result cards sorted by active criterion
- [x] List reorder animation on sort (FLIP layout, `prefers-reduced-motion` safe)
- [x] Desktop sidebar: SparkChart + set alert card + quick compare
- [x] Mobile sticky CTA: best price + platform + savings
- [x] Wired to `GET /api/prices/grocery?q=&city=` via SWR

### Product Detail (`app/(dashboard)/product/[id]/page.tsx`)

- [x] Breadcrumb + hero glass card with thumbnail
- [x] Price summary: "Lowest right now" mono, SaveBadge, platform + delivery info, VerdictChip
- [x] Full-width SparkChart (90 days) with hover crosshair + glass tooltip
- [x] Platform comparison ResultCard list
- [x] Watch card: "Alert me at ₹X — likely in ~14 days"
- [x] Wired to `GET /api/history/[productId]?city=&days=90`

### Cabs (`app/(dashboard)/cabs/page.tsx`)

- [x] Route card: FROM/TO inputs, When/Seats selectors
- [x] Map area placeholder (240px mobile / 320px desktop)
- [x] Tier pills + fare ResultCards
- [x] Mobile sticky CTA: cheapest platform + fare + savings
- [x] Wired to `GET /api/prices/cabs?from_lat=&from_lng=&to_lat=&to_lng=&city=`

### Watchlist (`app/(dashboard)/watchlist/page.tsx`)

- [x] Grouped by category (Grocery / Electronics / Cabs)
- [x] Price delta indicators (save color / danger color)
- [x] Alert badge + remove button per item
- [x] Empty state: illustration + "Nothing here yet" + Search button
- [x] Wired to `GET /api/watchlist`

---

## Phase 6 — API Route Contract Layer

> All routes Zod-validated, mock-backed, typed — no business logic inside route files.

- [x] `app/api/search/trending/route.ts` — `GET ?city=`, returns `TrendingItem[]` mock
- [x] `app/api/prices/grocery/route.ts` — `GET ?q=&city=`, returns `PriceResult[]` mock (5 platforms)
- [x] `app/api/prices/electronics/route.ts` — `GET ?q=`, returns `PriceResult[]` mock (5 platforms)
- [x] `app/api/prices/cabs/route.ts` — `GET ?from_lat=&from_lng=&to_lat=&to_lng=&city=`, returns `PriceResult[]` mock
- [x] `app/api/history/[productId]/route.ts` — `GET ?city=&days=90`, returns `PriceHistoryPoint[]` (90 mock points)
- [x] `app/api/watchlist/route.ts` — `GET` + `POST` (add/remove) + `DELETE`, Supabase-backed with auth guard + mock fallback
- [x] `app/api/alerts/route.ts` — `POST { productId, targetPrice, platform?, city, title?, category? }`, Supabase-backed + mock fallback
- [x] `app/api/cron/check-alerts/route.ts` — `GET`, verifies `CRON_SECRET`, triggers alert checks

---

## Phase 7 — Data Infrastructure

> Production adapters behind the API routes.

- [x] `src/lib/cache/redis.ts` — Upstash client, `getCache`, `setCache`, key factory functions
- [x] `src/lib/db/supabase.ts` — server client (service role) + browser client (anon), session helpers
- [x] Supabase schema SQL: `products`, `price_history`, `user_profiles`, `watchlist`, `alerts` (`supabase/schema.sql`)
- [x] RLS policies: `watchlist` and `alerts` scoped to `auth.uid()` (in `supabase/schema.sql`)
- [x] `src/lib/geo/index.ts` — `getCityFromRequest(req)` using `x-vercel-ip-city`
- [x] `src/lib/scrapers/base.ts` — `BaseScraper` with `withRetry`, `userAgent()`, backoff helpers

---

## Phase 8 — External Provider Integrations

> Replace mock responses one platform at a time. Keep mock fallback behind env var check.

### Integration plumbing

- [x] Scraper service client (`src/lib/scraper-service/client.ts`) + grocery route calls it when env is set
- [x] Scraper service scaffold (`scraper-service/`) exposes `POST /v1/prices` with secret header auth
- [x] Price routes cache `price:*` keys in Redis (300s) with live→mock fallback

### Grocery

- [x] DMart Ready — Playwright (Railway service), best-effort search + first price extraction
- [x] BigBasket — Playwright (Railway service), best-effort search + first price extraction
- [x] Blinkit — Playwright (Railway service), geolocation + localStorage bootstrap, best-effort search + first price extraction
- [x] Zepto — Playwright (Railway service), geolocation bootstrap + XHR JSON sniffing for first price
- [x] Swiggy Instamart — Playwright (Railway service), geolocation bootstrap, best-effort search + first price extraction

### Electronics

- [ ] Amazon PA API — `paapi5-nodejs-sdk`, affiliate credentials
- [ ] Flipkart Affiliate API — `affiliate-api.flipkart.net`, header-based auth
- [ ] Croma — Playwright scraping
- [ ] Reliance Digital — Playwright scraping

- [ ] Vijay Sales — Playwright scraping

### Cabs

- [ ] Namma Yatri — BECKN protocol `POST /mobility/search`, free, no auth
- [ ] Uber — OAuth client_credentials → `GET /v1.2/estimates/price`
- [ ] Ola — Playwright intercept (fragile, try/catch)
- [ ] Rapido — Playwright scrape (rapido.bike web app)
- [ ] InDrive — Playwright scrape (fare range, not fixed)

---

## Phase 9 — Alerts, Auth, Cron, and Verdict Engine

> Final production feature layer.

- [x] Supabase Auth: Google OAuth + phone OTP flows (`/login`, `/auth/callback`, middleware session refresh, `NavUserCard`)
- [x] Auth guards on `/api/watchlist` and `/api/alerts` routes (session via Supabase cookies; unauthenticated → 401 when project env is set)
- [x] Watchlist optimistic UI mutations via SWR (remove path)
- [x] `src/lib/ai/verdict.ts` — rule-based verdict engine (near-ATL → buy, >30d avg → wait)
- [x] GPT-4o-mini fallback for ambiguous verdict cases (behind `OPENAI_API_KEY` env check; `POST /api/ai/verdict`)
- [x] `vercel.json` cron: `{ "path": "/api/cron/check-alerts", "schedule": "*/5 * * * *" }`
- [x] Alert email delivery via Resend on trigger (`RESEND_API_KEY`, optional `RESEND_FROM_EMAIL`; cron reads `price_history` vs `target_price`)
- [x] `CRON_SECRET` header verification on cron route (`x-cron-secret` or `Authorization: Bearer`)

---

## Notes

- Validation commands (`npm run lint`, `npx tsc --noEmit`, `npm run build`) require explicit user approval before running.
- Each phase must be fully complete before the next begins.
- Mock fallbacks must remain active for local development throughout the rewrite.
