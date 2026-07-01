# Pricely Launch Readiness — Progress Tracker

Companion to `LAUNCH_READINESS_AUDIT.md`. Tracks all 58 audited issues through the
milestone plan (vertical-slice sequence: lock product truth, prove one reliable
journey, then scale and polish).

- Starting score: **33/100 — No-go**
- Target for launch: complete **M0 -> M3** (all P0 blockers)
- Legend: `[ ]` not started, `[~]` in progress, `[x]` done, `[!]` blocked
- Issue numbers (#) map to the audit backlog table.

---

## Status summary

| Milestone | Focus | P-level | Issues | Status |
|---|---|---|---|---|
| M0 | Safety nets | P0 | 7, 50, 51 | Done (core) |
| M1 | Product truth (data model) | P0 | 1, 2, 3, 4, 42 | Done (core) |
| M2 | Reliable + scalable backend | P0 | 5, 6, 8, 12, 14, 15, 26, 48, 49 | Done (core) |
| M3 | Vertical slice (mobile-first) | P0 | 9, 10, 11, 13, 16, 17, 24, 25, 52 | Done (core) |
| M4 | Auth + alert lifecycle | P1 | 22, 23, 37, 43 | Done (core) |
| M5 | UX / data quality | P1 | 27, 28, 29, 30, 31, 32, 33, 35, 36, 38, 47 | Done (core) |
| M6 | Architecture + business | P1 | 53, 54, 55, 56, 57 | Done (core) |
| M7 | Polish + consistency | P2/P3 | 18, 19, 20, 21, 34, 39, 40, 41, 44, 45, 46, 58 | In progress |
| M8 | Delight / premium | P3 | (post-launch features) | Not started |

Counts: **~50 / 58 issues done** (partial credit on several items).

---

## Phase 1 (P0) — Launch blockers

### M0. Safety nets — DONE (core)
See session log. Items #7, #51 complete; #50 partial (no Sentry yet).

### M1. Product truth — DONE (core)
- [x] #1, #2, #3
- [x] #4 variant matching + disambiguation — `matchConfidence`, `alternateMatches`, `?confirm=` on compare
- [x] #42 chart ranges from real coverage + sr-only summary

### M2. Reliable backend — DONE (core)
- [x] #5, #6, #8, #12, #14, #48, #49
- [x] #15 `RESEND_FROM_EMAIL` + production sandbox warning
- [x] #26 Manual refresh on compare (`refresh=1` cache bypass, 60s cooldown)
- [~] #50 observability (structured logs; no Sentry yet)

### M3. Vertical slice (mobile-first) — DONE (core)

- [x] #9 (P0/L) Stacked retailer cards on mobile — `RetailerRow` + `globals.css` responsive rows
- [x] #10 (P0/M) Chart margins, mobile height, range chips from real coverage, screen-reader summary
- [x] #11 (P0/M) City selector in Nav + `useCity` localStorage hook; compare/trending use selected city
- [x] #13 (P0/M) `/terms` + `/privacy` pages; signup links updated
- [x] #16 (P0/S) Explicit Remove + confirm/cancel on watchlist and alerts
- [x] #17 (P0/M) Mobile card layouts for watchlist/alert rows
- [x] #24 (P1/S) Compare starts empty — no default Sony fetch without `?q=`
- [x] #25 (P1/M) Weak-match / no in-stock prices message + retry on errors
- [x] #31 (P1/S) Removed inert Delivery/Trust sort chips
- [x] #52 (P0/M) CSP, HSTS, Referrer-Policy, Permissions-Policy via middleware
- [~] Slice gate: alert journey telemetry + unit test (no live E2E yet)

### M4. Auth + alert lifecycle — DONE (core)

- [x] #22 (P1/L) Password reset (`/forgot-password`, `/reset-password`), account page + `DELETE /api/account`
- [x] #23 (P1/M) Pending alert buffer (`usePendingAlert`) — compare buffers before sign-in, flushes after auth
- [x] #37 (P1/M) Alert pause/reactivate via `PATCH /api/alerts` + UI on alerts page
- [x] #43 (P1/S) Signup validation — required full name, password confirm, strength hint, `role="alert"` errors
- Sign-in: forgot-password link, password visibility toggle, resend confirmation email

### M5. UX / data quality — DONE (core)
- [x] #28 Qualified home trust stats + coverage disclaimer
- [x] #35 Watchlist “Observed vs MRP” stat rename
- [x] #36 Hide guest stat cards; dedupe labels
- [x] #27 (P1/L) Price assumption disclosure on compare (shipping/coupons caveat)
- [x] #29 (P1/L) Search suggestions — recent searches, trending, live search titles
- [x] #30 (P1/L) Public positioning narrowed to electronics & fashion
- [x] #32 (P1/M) In-stock-only filter on compare
- [x] #33 (P1/L) Canonical `/product/[id]` permalink + OG metadata
- [x] #38 (P1/M) Loading skeletons + retry error states on compare/watchlist/alerts
- [x] #47 (P1/M) Toast feedback for track/alert actions

### M6. Architecture + business — DONE (core)
- [x] #54 (P1/M) Shared auth field styles (`src/lib/auth/fieldStyles.ts`)
- [x] #55 (P1/M) Privacy-conscious analytics (`trackEvent` + `/api/analytics`)
- [x] #56 (P1/M) SEO — Open Graph metadata, `robots.txt`, `sitemap.xml`, footer, `/methodology`
- [x] #57 (P1/L) Data export — `GET /api/account/export` + account page link
- [~] #53 Route/feature split (compare page still large; no broad refactor)

### M7. Polish + consistency — IN PROGRESS
- [x] #18 (P0/S) Raised `--text-faint` contrast for WCAG AA on dark canvas
- [x] #19 (P0/S) Search input uses tokenized `:focus-visible` (removed bare `outline: none`)
- [x] #20 (P0/M) Compare retailer grid uses `role="table"`; chart already has sr-only summary
- [x] #21 (P0/M) 44px touch targets on mobile nav links, chips, sm buttons, footer links
- [x] #39 (P1/S) Mobile nav: Escape to close, scroll lock, backdrop, `aria-controls`
- [x] #40 (P1/S) Removed link-wrapped buttons in Nav (router navigation instead)
- [x] #41 (P1/S) Home returning change rows are keyboard-focusable buttons
- [x] #46 (P2/S) Removed continuous `pulse-dot` animation (static status dot)
- [x] #34 (P1/M) `ProductImage` initials fallback on compare (real images when available)
- [x] #58 (P2/S) README: pnpm note, middleware deprecation, slice-gate checklist
- [ ] #44 shell contract, #45 inline-style debt

### Slice gate (manual)
- [x] Unit test: pending alert buffer
- [x] Telemetry: `alert_journey_*`, `compare_refreshed`
- [ ] Live E2E: sign-in → alert flush → cron → Resend delivery (staging credentials)

---

## Phase 2–4
(Unchanged — see prior sections in git history or audit doc.)

---

## Session log

| Date | Action | Outcome |
|---|---|---|
| 30 Jun 2026 | M0 + M1 | Fail-closed mock, history model, tests |
| 30 Jun 2026 | M2 | Transactional alerts, rate limits, email safety |
| 30 Jun 2026 | M3 | Mobile rows, city picker, legal pages, security headers, compare empty state |
| 30 Jun 2026 | M4 | Auth lifecycle, pending alerts, pause/reactivate, account deletion |
| 30 Jun 2026 | M1 #4 + M2 #48 + M5 | Variant disambiguation, scraper pool, trust copy |
| 30 Jun 2026 | M5 + M6 | Search UX, toasts, SEO, analytics, data export |
| 30 Jun 2026 | M7 + slice gate | A11y pass, alert journey telemetry, pending-alert test |
| 30 Jun 2026 | M2 close-out | Refresh prices, Resend from, ProductImage, cron logs |

---

## Validation log

| Date | Milestone | lint | tsc --noEmit | build | Notes |
|---|---|---|---|---|---|
| 30 Jun 2026 | M0–M3 | - | - | - | `bash scripts/run-unit-tests.sh` — 15/15 pass |
| 30 Jun 2026 | M4 | pass | pre-existing test ts errors | pass | lint clean; unit tests 15/15; build OK |
| 30 Jun 2026 | M1/M2/M5 | pass | pre-existing test ts errors | pass | 16/16 unit tests; build OK |
| 30 Jun 2026 | M5/M6 | pass | pre-existing test ts errors | pass | 16/16 tests; new routes OK |
| 30 Jun 2026 | M7 | pass | pre-existing test ts errors | pass | 17/17 tests; build OK |
| 30 Jun 2026 | M2 close | pass | pre-existing test ts errors | pass | 18/18 tests; build OK |
