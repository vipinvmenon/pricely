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
- [x] `app/layout.tsx` — Geist + Geist Mono via next/font, metadata; wrapped with SWRProvider
- [x] `src/types/index.ts` — all shared types: PriceResult, Verdict, PriceHistoryPoint, WatchlistItem, FareResult, scraper types, etc.
- [x] `src/lib/utils/cn.ts` — clsx + tailwind-merge helper
- [x] `src/lib/utils/format.ts` — formatINR, formatRelativeTime, normalizeQuery
- [x] `src/lib/utils/fetchJson.ts` — typed fetch wrapper
- [x] `src/lib/utils/phone.ts` — phone number utilities
- [x] `src/lib/utils/platforms.ts` — PLATFORMS registry (updated: tata_cliq, myntra, blusmart added; namma_yatri, indrive removed)
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
- [x] `src/components/providers/SWRProvider.tsx` — client SWR config wrapper
- [x] `app/page.tsx` — Home page (hardcoded preview data; trending API not wired yet)
- [x] `app/compare/page.tsx` — Compare page → wired to `/api/compare`
- [x] `app/cabs/page.tsx` — Cabs page → wired to `/api/trips`
- [x] `app/watchlist/page.tsx` — Watchlist page → wired to `/api/watchlist`
- [x] `app/signin/page.tsx` — Sign in page (wired: `signInWithPassword` + `signInWithOAuth` Google; error display; loading state)
- [x] `app/signup/page.tsx` — Sign up page (wired: `signUp` + `signInWithOAuth` Google; email confirmation screen; error display)

---

## Phase 1 — Database + Auth

- [x] `supabase/schema.sql` — full DDL with all tables + RLS policies written
- [ ] **MANUAL** Apply `supabase/schema.sql` to Supabase project via SQL editor
- [ ] **MANUAL** Enable Google OAuth provider in Supabase Dashboard → Authentication → Providers
- [ ] **MANUAL** Configure OAuth redirect URLs (localhost + production)
- [x] `src/lib/supabase/client.ts` — `createBrowserClient` singleton
- [x] `src/lib/supabase/server.ts` — `createServerClient` for RSC and route handlers
- [x] `middleware.ts` — session refresh on every request; env var guard (safe in local dev without credentials); redirects `/watchlist` → `/signin` when unauthenticated
- [x] `app/auth/callback/route.ts` — Supabase OAuth code exchange; redirects to `next` param after session set
- [x] `src/types/index.ts` — `tata_cliq`, `myntra`, `blusmart` added to `PlatformId`; `namma_yatri`, `indrive` removed
- [x] `src/lib/utils/platforms.ts` — Tata Cliq, Myntra, BluSmart added; Namma Yatri, InDrive removed
- [ ] Smoke-test: `supabase.auth.getUser()` returns null for unauthenticated request without error

---

## Phase 2 — Real API Routes

- [x] `src/lib/redis/client.ts` — Upstash Redis singleton
- [x] `src/lib/redis/keys.ts` — cache key factory + TTL constants
- [x] `src/lib/swr/config.ts` — SWRConfig: refreshInterval 5 min, revalidateOnFocus false
- [x] `app/api/trending/route.ts` — Zod schema, Redis cache check, mock fallback
- [x] `app/api/compare/route.ts` — Zod schema (`q`, `city`), Redis cache check, service call, mock fallback
- [x] `app/api/watchlist/route.ts` — GET/POST/DELETE, Zod schema, Supabase auth guard, mock fallback
- [x] `app/api/trips/route.ts` — Zod schema (`from`, `to`, `city`), Redis cache check, service call, mock fallback
- [x] All routes emit `X-Response-Time` response header
- [x] All routes return identical shape to mocks when `SCRAPER_SERVICE_URL` is unset ✓ (verified locally)

---

## Phase 3 — Price Data Infrastructure

- [x] `src/lib/supabase/server.ts` — added `createServiceClient()` export (service role, bypasses RLS)
- [x] `src/lib/scraper/client.ts` — HTTP client for Railway scraper service
- [x] `src/services/compareService.ts` — full implementation: scraper call → Redis write → DB write → return; retailer name now uses PLATFORMS registry
- [x] `src/services/priceHistoryService.ts` — `writePricePoints`, `getPriceHistory` (Supabase); deduplication guard; switched to service role client (anon key blocked by RLS `price_history_service_write` policy)
- [x] `scraper/` directory — Railway microservice (Express + Playwright)
- [x] `scraper/package.json`
- [x] `scraper/tsconfig.json`
- [x] `scraper/types.ts`
- [x] `scraper/lib/retry.ts` — shared retry helper
- [x] `scraper/index.ts` — Express HTTP server + auth middleware + `/scrape` + `/scrape/cabs` + `/health`
- [ ] **MANUAL** Deploy scraper service to Railway; set `SCRAPER_SERVICE_URL` + `SCRAPER_SERVICE_SECRET` in Vercel env

---

## Phase 4 — Scrapers: Retailers

- [x] `scraper/scrapers/amazon.ts` — PA API v5 + Playwright fallback
- [x] `scraper/scrapers/flipkart.ts` — Affiliate API + Playwright fallback
- [x] `scraper/scrapers/croma.ts`
- [x] `scraper/scrapers/reliance_digital.ts`
- [x] `scraper/scrapers/vijay_sales.ts`
- [x] `scraper/scrapers/tata_cliq.ts`
- [x] `scraper/scrapers/myntra.ts`
- [x] `scraper/scrapers/blinkit.ts`
- [x] `scraper/scrapers/zepto.ts`
- [x] `scraper/scrapers/swiggy_instamart.ts`
- [x] `scraper/scrapers/bigbasket.ts`
- [x] `scraper/scrapers/dmart_ready.ts`
- [x] All scrapers wired into `scraper/index.ts` dispatcher

---

## Phase 5 — Scrapers: Cabs

- [x] `src/services/tripsService.ts` — full implementation with scraper call + Redis cache
- [x] `scraper/scrapers/cabs/blusmart.ts`
- [x] `scraper/scrapers/cabs/rapido.ts`
- [x] `scraper/scrapers/cabs/uber.ts`
- [x] `scraper/scrapers/cabs/ola.ts`
- [x] Cab scrapers wired into `scraper/index.ts` (`POST /scrape/cabs`)

---

## Phase 6 — Price History

- [x] `price_history` table defined in `supabase/schema.sql`
- [x] `writePricePoints(points)` implemented with deduplication
- [x] `getPriceHistory(productId, city, days)` implemented
- [x] `getPriceHistory` wired into `app/api/compare/route.ts` response (via compareService)
- [ ] **MANUAL** Apply schema to Supabase and verify chart renders real DB data

---

## Phase 7 — Watchlist

- [x] `src/services/watchlistService.ts` — `getWatchlist`, `addToWatchlist`, `removeFromWatchlist`
- [x] Auth guard in `app/api/watchlist/route.ts` — 401 when `getUser()` returns null
- [x] `POST /api/watchlist` — Zod body, Supabase insert, Redis invalidation
- [x] `DELETE /api/watchlist` — Zod query, Supabase delete, Redis invalidation
- [x] `app/watchlist/page.tsx` — SWR; 401 triggers sign-in prompt; optimistic DELETE via `mutate`; `usePendingWatchlist` flush on auth
- [x] `src/lib/hooks/usePendingWatchlist.ts` — `addPendingWatchlistItem`, `getPendingWatchlistItems`, flush hook
- [ ] Verify watchlist CRUD end-to-end for authenticated user

---

## Phase 8 — Alerts + Cron + Email

- [x] `src/services/alertsService.ts` — `getAlerts`, `createAlert`, `deleteAlert`, `getActiveAlerts`, `markAlertTriggered`; fixed `getActiveAlerts` to resolve user emails via `auth.admin.getUserById` (PostgREST cannot join `auth.users`); `markAlertTriggered` now also sets `is_active: false`
- [x] `app/api/alerts/route.ts` — GET/POST/DELETE with Zod + auth guard
- [x] `src/lib/email/resend.ts` — `sendPriceDropEmail` (dynamic import; skips gracefully when `RESEND_API_KEY` unset)
- [x] `app/api/cron/alerts/route.ts` — `CRON_SECRET` verification, alert loop, email dispatch
- [x] `vercel.json` — cron schedule `*/5 * * * *` + API security headers
- [ ] Verify: `GET /api/cron/alerts` returns 401 without correct `Authorization` header
- [ ] Verify: alert email sends via Resend test key

---

## Phase 9 — Verdict Engine

- [x] `src/services/verdictService.ts` — async `computeVerdict(history)`; rule logic: 90-day low, avg, 7-day trend
- [x] GPT-4o-mini async fallback (fires when `history.length < 7` or no rule matches; requires `OPENAI_API_KEY`; validates JSON response shape)
- [x] Dead code path removed — default case now directly returns `gptFallback(history)`
- [x] `app/api/verdict/route.ts` — GET with Zod: `productId`, `city`
- [x] Verdict wired into `app/api/compare/route.ts` response
- [ ] Verify: verdict changes from `buy` to `wait` correctly with test history arrays

---

## Phase 10 — Search

- [x] `src/services/searchService.ts` — fan-out, normalisation, deduplication, price-rank sort
- [x] `app/api/search/route.ts` — GET with Zod: `q`, `city`, `category` (optional)
- [ ] Verify: search returns results sorted cheapest-first with correct `platformId` values

---

## Phase 11 — Performance + Observability

- [x] Redis TTLs enforced in `src/lib/redis/keys.ts`
- [x] `src/lib/swr/config.ts` — `refreshInterval: 300_000`, `revalidateOnFocus: false`
- [x] App wrapped with `SWRConfig` in `app/layout.tsx`
- [x] `X-Response-Time` header on all API route handlers
- [x] `stale-while-revalidate` on `app/api/compare/route.ts`
- [x] No live scraper call on first render in local dev (mock fallback active) ✓

---

## Phase 12 — Launch Readiness

- [x] `LAUNCH_CHECKLIST.md` — complete pre-launch verification checklist
- [ ] **MANUAL** Set all production env vars in Vercel Dashboard
- [ ] **MANUAL** Set all production env vars in Railway Dashboard
- [x] `vercel.json` — cron schedule + security headers
- [x] `railway.toml` — scraper service start command + health check
- [x] `README.md` — local dev setup, env var guide, pnpm commands, platform coverage table
- [ ] Run smoke tests (see `LAUNCH_CHECKLIST.md`)
- [ ] `npm run build` — zero type errors, zero lint errors

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
