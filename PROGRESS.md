# Pricely — Progress Tracker

**Rewrite date:** May 2026
**Baseline runtime:** Next.js 16 · React 19 · TypeScript strict · pnpm
**Design references:** `docs/design/design-system-contract.md` · `docs/design/pricely-design-system.html`
**Product plan:** `docs/PRODUCT_PLAN.md`
**Backend spec:** `BACKEND_EXEC.md`

---

## Phase 0 — UI Rebuild (Complete)

- [x] Design tokens written to `src/styles/tokens.css`
- [x] `app/globals.css` — Tailwind import + token vars
- [x] `app/layout.tsx` — Geist + Geist Mono via next/font, metadata
- [x] `src/types/index.ts` — all shared types: PriceResult, Verdict, PriceHistoryPoint, WatchlistItem, FareResult, etc.
- [x] `src/lib/utils/cn.ts` — clsx + tailwind-merge helper
- [x] `src/lib/utils/format.ts` — formatINR, formatRelativeTime, normalizeQuery
- [x] `src/lib/utils/fetchJson.ts` — typed fetch wrapper
- [x] `src/lib/utils/phone.ts` — phone number utilities
- [x] `src/lib/utils/platforms.ts` — PLATFORMS registry
- [x] `src/components/ui/Glass.tsx` — glass surface primitive
- [x] `src/components/ui/Button.tsx` — primary/secondary/ghost variants
- [x] `src/components/ui/Chip.tsx` — filter pill chip
- [x] `src/components/ui/Nav.tsx` — top navigation bar
- [x] `src/components/ui/PriceBadge.tsx` — save/MRP badge
- [x] `src/components/ui/PriceChart.tsx` — 90-day price history chart
- [x] `src/components/ui/RetailerRow.tsx` — single retailer comparison row
- [x] `src/components/ui/SparkLine.tsx` — mini trend sparkline
- [x] `src/components/ui/StatCard.tsx` — stat summary card
- [x] `src/components/ui/WatchlistRow.tsx` — single watchlist item row
- [x] `src/components/ui/FareCard.tsx` — single cab fare result card
- [x] `app/page.tsx` — Home page (search hero, trending, feature cards)
- [x] `app/compare/page.tsx` — Compare page (retailer grid, price chart)
- [x] `app/cabs/page.tsx` — Cabs page (fare list, fare history chart)
- [x] `app/watchlist/page.tsx` — Watchlist page (item list)
- [x] `app/signin/page.tsx` — Sign in page
- [x] `app/signup/page.tsx` — Sign up page
- [x] `app/api/trending/route.ts` — mock GET handler
- [x] `app/api/compare/route.ts` — mock GET handler
- [x] `app/api/watchlist/route.ts` — mock GET handler
- [x] `app/api/trips/route.ts` — mock GET handler

---

## Phase 1 — Database + Auth

- [ ] Apply `supabase/schema.sql` to Supabase project via SQL editor
- [ ] Enable Google OAuth provider in Supabase Dashboard → Authentication → Providers
- [ ] Configure OAuth redirect URLs in Supabase Dashboard (localhost + production)
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr` if not present
- [ ] Create `src/lib/supabase/client.ts` — `createBrowserClient` singleton
- [ ] Create `src/lib/supabase/server.ts` — `createServerClient` for RSC and route handlers
- [ ] Create `middleware.ts` — session refresh on every request, `updateSession` helper
- [ ] Update `src/types/index.ts` — add `tata_cliq`, `myntra`, `blusmart` to `PlatformId`; remove `namma_yatri`, `indrive`
- [ ] Update `src/lib/utils/platforms.ts` — add Tata Cliq, Myntra, BluSmart; remove Namma Yatri, InDrive
- [ ] Smoke-test: `supabase.auth.getUser()` returns null for unauthenticated request without error

---

## Phase 2 — Real API Routes

- [ ] Create `src/lib/redis/client.ts` — Upstash Redis singleton
- [ ] Create `src/lib/redis/keys.ts` — cache key factory: `compareKey`, `trendingKey`, `tripsKey`, `watchlistKey`
- [ ] Create `src/services/compareService.ts` — stub (returns mock data; wires to Redis cache skeleton)
- [ ] Create `src/services/tripsService.ts` — stub (returns mock data; wires to Redis cache skeleton)
- [ ] Rewrite `app/api/trending/route.ts` — Zod schema, Redis cache check, Supabase fallback, mock fallback
- [ ] Rewrite `app/api/compare/route.ts` — Zod schema (`q`, `city`), Redis cache check, `compareService` call, mock fallback
- [ ] Rewrite `app/api/watchlist/route.ts` — GET/POST/DELETE, Zod schema, Supabase auth guard, mock fallback
- [ ] Rewrite `app/api/trips/route.ts` — Zod schema (`from`, `to`, `city`), Redis cache check, `tripsService` call, mock fallback
- [ ] Verify: all routes return identical shape to mocks when `SCRAPER_SERVICE_URL` is unset

---

## Phase 3 — Price Data Infrastructure

- [ ] Create `src/lib/scraper/client.ts` — HTTP client for Railway scraper service (`SCRAPER_SERVICE_URL` + `SCRAPER_SERVICE_SECRET`)
- [ ] Create `scraper/` directory at repo root (Railway microservice)
- [ ] Create `scraper/package.json` — Node + Playwright + Express dependencies
- [ ] Create `scraper/types.ts` — `ScrapeRequest`, `ScrapeResult`, `ScrapeError` types
- [ ] Create `scraper/index.ts` — Express HTTP server, `POST /scrape` endpoint, auth middleware
- [ ] Update `src/services/compareService.ts` — full implementation: scraper call → Redis write → DB write → return
- [ ] Update `src/services/priceHistoryService.ts` — `writePricePoints`, `getPriceHistory` (Supabase)
- [ ] Implement deduplication in `priceHistoryService.ts` — skip write if price unchanged within 1 hour for same `(product_id, platform_id, city)`
- [ ] Verify: mock fallback activates when `SCRAPER_SERVICE_URL` is unset in local dev

---

## Phase 4 — Scrapers: Retailers

- [ ] Create `scraper/scrapers/amazon.ts` — PA API integration; Playwright fallback
- [ ] Create `scraper/scrapers/flipkart.ts` — Affiliate API integration; Playwright fallback
- [ ] Create `scraper/scrapers/croma.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/reliance_digital.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/vijay_sales.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/tata_cliq.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/myntra.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/blinkit.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/zepto.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/swiggy_instamart.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/bigbasket.ts` — Playwright scraper
- [ ] Create `scraper/scrapers/dmart_ready.ts` — Playwright scraper
- [ ] Wire all scrapers into `scraper/index.ts` dispatcher
- [ ] Deploy scraper service to Railway; set `SCRAPER_SERVICE_URL` in Vercel env

---

## Phase 5 — Scrapers: Cabs

- [ ] Create `scraper/scrapers/cabs/blusmart.ts` — deep link / unofficial API
- [ ] Create `scraper/scrapers/cabs/rapido.ts` — Playwright fare estimate flow
- [ ] Create `scraper/scrapers/cabs/uber.ts` — Playwright ride estimate flow
- [ ] Create `scraper/scrapers/cabs/ola.ts` — Playwright fare estimate flow
- [ ] Wire cab scrapers into `scraper/index.ts` dispatcher (separate `POST /scrape/cabs` endpoint)
- [ ] Update `src/services/tripsService.ts` — full implementation with scraper call + Redis cache

---

## Phase 6 — Price History

- [ ] Confirm `price_history` table exists in Supabase (from `supabase/schema.sql`)
- [ ] Implement `writePricePoints(points: PricePoint[]): Promise<void>` in `src/services/priceHistoryService.ts`
- [ ] Implement `getPriceHistory(productId: string, platformId: PlatformId, city: string, days: number): Promise<HistoryPoint[]>` in `src/services/priceHistoryService.ts`
- [ ] Implement deduplication guard: query last record for `(product_id, platform_id, city)` before insert
- [ ] Wire `getPriceHistory` into `app/api/compare/route.ts` response
- [ ] Verify: chart in `app/compare/page.tsx` renders real data from DB (falls back to mock when empty)

---

## Phase 7 — Watchlist

- [ ] Create `src/services/watchlistService.ts` — `getWatchlist`, `addToWatchlist`, `removeFromWatchlist`
- [ ] Implement auth guard in `app/api/watchlist/route.ts` — 401 when `getUser()` returns null
- [ ] Implement `POST /api/watchlist` — Zod body: `{ productId, city }`, insert to Supabase
- [ ] Implement `DELETE /api/watchlist` — Zod query: `{ id }`, delete from Supabase
- [ ] Implement localStorage fallback — store pending adds for unauthenticated users; flush on sign-in
- [ ] Wire optimistic SWR mutation in watchlist page for instant UI feedback
- [ ] Verify: watchlist CRUD works end-to-end for authenticated user

---

## Phase 8 — Alerts + Cron + Email

- [ ] Create `src/services/alertsService.ts` — `getAlerts`, `createAlert`, `deleteAlert`, `getActiveAlerts`
- [ ] Create `app/api/alerts/route.ts` — GET/POST/DELETE, Zod schema, auth guard
- [ ] Create `src/lib/email/resend.ts` — Resend client singleton + `sendPriceDropEmail` function
- [ ] Create price drop email template in `src/lib/email/resend.ts`
- [ ] Create `app/api/cron/alerts/route.ts` — `CRON_SECRET` verification, fetch all active alerts, compare to current prices, fire emails
- [ ] Add cron entry to `vercel.json`: `{ "path": "/api/cron/alerts", "schedule": "*/5 * * * *" }`
- [ ] Verify: cron route returns 401 without correct `Authorization: Bearer {CRON_SECRET}` header
- [ ] Verify: alert email sends successfully via Resend test key

---

## Phase 9 — Verdict Engine

- [ ] Create `src/services/verdictService.ts` — `computeVerdict(history: HistoryPoint[]): Verdict`
- [ ] Implement rule-based logic: compare current price to 90-day low, 90-day avg, trend direction
- [ ] Implement GPT-4o-mini fallback: fires when `history.length < 7` or rule confidence `< 0.5`
- [ ] Embed GPT-4o-mini prompt template in `verdictService.ts`
- [ ] Create `app/api/verdict/route.ts` — GET with Zod: `productId`, `city`
- [ ] Wire verdict into `app/api/compare/route.ts` response
- [ ] Verify: verdict changes from `buy` to `wait` correctly given test history arrays

---

## Phase 10 — Search

- [ ] Create `src/services/searchService.ts` — `search(query, city, category): PriceResult[]`
- [ ] Implement fan-out: call all scrapers for the matching category in parallel
- [ ] Implement result normalisation: map raw scraper output to `PriceResult` type
- [ ] Implement deduplication: merge results for same product title + brand across scrapers
- [ ] Implement ranking: sort by price ascending; boost results with higher stock confidence
- [ ] Create `app/api/search/route.ts` — GET with Zod: `q`, `city`, `category` (optional)
- [ ] Verify: search returns results sorted cheapest-first with correct `platformId` values

---

## Phase 11 — Performance + Observability

- [ ] Enforce Redis TTLs in `src/lib/redis/keys.ts`: compare 5 min, trending 10 min, trips 2 min, watchlist 1 min
- [ ] Create `src/lib/swr/config.ts` — `SWRConfig` provider with `refreshInterval: 300_000`, `revalidateOnFocus: false`
- [ ] Wrap app with `SWRConfig` in `app/layout.tsx`
- [ ] Add request timing log to all API route handlers (`X-Response-Time` header)
- [ ] Implement stale-while-revalidate in `app/api/compare/route.ts` — return stale cache immediately, revalidate in background
- [ ] Verify: no page makes a live scraper call on first render in local dev (mock fallback active)

---

## Phase 12 — Launch Readiness

- [ ] Create `LAUNCH_CHECKLIST.md` — complete env var list, Vercel project config, Railway service config
- [ ] Set all production env vars in Vercel Dashboard
- [ ] Set all production env vars in Railway Dashboard
- [ ] Finalise `vercel.json` — cron schedule, security headers
- [ ] Create `railway.toml` — scraper service start command, health check path
- [ ] Update `README.md` — local dev setup, env var setup, pnpm commands
- [ ] Run smoke tests: home loads, compare returns data, cabs returns fares, watchlist auth-gates correctly, cron route rejects without secret
- [ ] Verify: `npm run build` passes with zero type errors and zero lint errors

---

## Notes

**Invariants — never skip these:**

- Mock fallbacks must remain active throughout all phases. Local dev must run
  without live credentials. Every API route checks for `SCRAPER_SERVICE_URL`
  before calling the scraper service.

- Each phase must reach a clean build before the next phase begins. Do not
  start Phase N+1 if Phase N introduces type errors or lint errors.

- Validation commands (`npm run lint`, `npx tsc --noEmit`, `npm run build`)
  require explicit user approval before running.

- Files under `docs/design/` are never modified. They are read-only design
  reference artifacts.

- `package.json`, `tsconfig.json`, `next.config.*`, `.env*`, `.gitignore` are
  never modified by agents.

- All `.cursor/rules/` files are preserved as-is.
