# Pricely — Progress (by version)

Status tracker organised by release.

The v1 promise: **search a product, compare live-or-mock prices across the seven
supported Indian retailers, get a buy/wait verdict, and save to watchlist or
alerts when signed in.** Dark theme is the baseline. No grocery/cabs, no city
selector, no light-theme parity in v1 — those are explicitly deferred below.

Supported retailers (v1): Amazon, Flipkart, Croma, Reliance Digital, Vijay
Sales, Tata Cliq, Myntra.

---

## v1.0 — Stabilization (in progress)

Goal: make the existing product honest, coherent, and reliable for a first
stable release without redesigning it.

### Phase status

| Phase | Scope | Status |
|---|---|---|
| 1 — Scope & contract cleanup | Honest copy/metadata, retailer + city constants, drop dead `trips` key | Done |
| 2 — Architecture cleanup | `layout/` + `features/` extraction, shared `SearchBar`, thin pages | Done |
| 3 — API stabilization | Central city schema + IP detection, normalized cache keys, mock parity, typed responses, standard errors | Done |
| 4 — Core reliability | Honest sparse-history verdict, safe `compareByProductId`, less history pollution, env-guarded writes | Done |
| 5 — UI quality pass | `GlassCard` + alias tokens, token-ize colors, focus-visible, touch targets, missing states | Done |
| 6 — Verification | lint / `tsc --noEmit` / build all green (16 routes) | Done |

### What changed in v1.0 (so far)

- **Honesty:** removed "12 retailers", "2.1 million users", and grocery/cab/"saved
  trips" copy from metadata, sign-in, sign-up, and the home stats block.
- **Constants:** centralized `SUPPORTED_CITIES` + `coerceCity`, and
  `SUPPORTED_PLATFORM_IDS` / `platformName` so scrape fan-out and labels have one
  source of truth.
- **Architecture:** `Nav` moved to `src/components/layout`; `VerdictHero` and the
  home blocks moved to `src/components/features`; one shared `SearchBar` in
  `src/components/ui`; pages are now composition-focused.
- **API:** `resolveCity()` validates/coerces city (with `x-vercel-ip-city`
  detection) on every route; search cache key normalized; alerts GET has a mock
  fallback for credential-free local dev; verdict/cron return typed shapes;
  cron now fails closed without `CRON_SECRET`.
- **Reliability:** verdict no longer says "buy" with high confidence on thin
  history; `compareByProductId` falls back to stored title or history-only
  instead of scraping by an opaque id; price-history writes/reads no-op without
  service-role creds; match threshold raised to reduce bad-match pollution.
- **Scraper service:** fails closed in production when `SCRAPER_SERVICE_SECRET`
  is unset (no more silent allow-all); strict `/scrape` validation (query,
  platforms, clamped `maxResults`) with partial per-platform results preserved.

### Verification

`npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass (16 routes
compile). The app builds and runs on mock data with no credentials.

### Local development

- `pnpm dev` (or `npm run dev`) uses **mock data by default** — no scraper, no
  credentials, low CPU.
- Live prices: `PRICELY_USE_MOCK_DATA=0 pnpm dev` with the scraper on `:3001`.

---

## v1.1 — UI/UX improvement pass (planned)

The next version focuses on **look and feel** now that the product is stable and
honest. This is where the larger design work lands — deliberately kept out of
v1.0 to keep the stabilization diff conservative and reversible.

Planned:

- **Full GlassCard pattern:** adopt the contract's pseudo-element glass surface
  and retune blur (12 / 28 / 40px); migrate remaining inline glass usage.
- **Token rename pass:** move components onto the contract's canonical token
  names (`--glass`, `--glass-strong`, `--glass-border`, `--accent-soft`,
  `--line`, etc.) and reduce inline-style sprawl on pages.
- **Light theme parity:** wire `next-themes` (`attribute="data-theme"`,
  `defaultTheme="dark"`), add `[data-theme="light"]` token overrides, and restore
  a working theme toggle (removed in v1.0 because it was a non-functional stub).
- **City selector UX:** Zomato/Swiggy-style location picker on top of the v1.0
  detection plumbing, with a serviceable-cities list.
- **Motion + polish:** page-enter and list-stagger transitions within the
  120–180ms contract range, reduced-motion safe.
- **Component states audit:** consistent empty/loading/error/disabled treatments
  across watchlist, alerts, and compare.

---

## v1.2+ — Product expansion (backlog)

Bigger scope, not scheduled yet:

- Additional categories (groceries, cabs) — requires new providers, schema, and
  navigation, and was intentionally cut from the v1 promise.
- Rate limiting on public API routes.
- Real-time trending feed improvements and personalization.
- Remove unused dependencies once the theme/state work settles.

---

## Retailer coverage (7/7 implemented)

| Platform | Data path | Notes |
|---|---|---|
| Amazon | PA API + Playwright fallback | Live coverage varies by anti-bot |
| Flipkart | Affiliate API + Playwright fallback | Selectors can drift |
| Reliance Digital | Playwright | XHR-loaded prices |
| Tata Cliq | Playwright | React SPA, longer hydration |
| Vijay Sales | Magento GraphQL API | Mumbai/Pune focused |
| Croma | Playwright (stealth) | Needs Chrome channel |
| Myntra | Playwright (stealth) | Fashion queries only |

Live coverage depends on deployment (scraper service + credentials). The app
runs fully on mock data without them.
