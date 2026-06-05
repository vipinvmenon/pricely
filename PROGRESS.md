# Pricely — Status

**Implementation plan for next phases:** `NEXT_PHASE.md`

---

## What's done

| Area | Status |
|---|---|
| Home page (first-visit hero + returning feed) | Done |
| Compare page (VerdictHero, price history chart, retailer grid) | Done |
| Watchlist page (auth-gated, optimistic delete) | Done |
| Alerts page (target-price tracking, optimistic delete) | Done |
| Nav (Home / Compare / Watchlist / Alerts) | Done |
| Types, services, utils — grocery/cabs removed | Done |
| Supabase schema applied (5 tables + RLS) | Done |
| Auth (email + Google OAuth wired) | Done |
| Verdict engine (rule-based + GPT-4o-mini fallback) | Done |
| Alerts cron + Resend email | Done |
| Scraper service code (7 ecommerce scrapers) | Written — never deployed |

---

## What's blocking real data

Everything on the site is mock data. `SCRAPER_SERVICE_URL` is unset.

The blocking sequence is: **A → B → C → D**

| Phase | What | Where |
|---|---|---|
| A | Fix TypeScript build errors + railway.toml | `NEXT_PHASE.md#phase-a` |
| B | Deploy scraper to Railway, set env vars | `NEXT_PHASE.md#phase-b` |
| C | Validate and fix each scraper's CSS selectors | `NEXT_PHASE.md#phase-c` |
| D | End-to-end smoke tests | `NEXT_PHASE.md#phase-d` |

---

## Deferred (not blocking launch)

- City selector UI — hardcoded to Mumbai
- Rate limiting on public API routes
- Light theme — tokens exist, `ThemeProvider` not wired
- Remove unused `zustand` and `next-themes` deps
