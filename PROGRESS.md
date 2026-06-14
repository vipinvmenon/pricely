# Pricely — Status

**Implementation plan for next phases:** `NEXT_PHASE.md`

---

## What's done

| Area | Status |
|---|---|
| Home page (first-visit hero + returning feed) | Done |
| Compare page (VerdictHero, price history chart, retailer grid, alert UI) | Done |
| Watchlist page (auth-gated, optimistic delete) | Done |
| Alerts page (target-price tracking, create + delete) | Done |
| Nav (Home / Compare / Watchlist / Alerts) | Done |
| Types, services, utils — grocery/cabs removed | Done |
| Supabase schema applied (5 tables + RLS) | Done |
| Auth (email + Google OAuth wired) | Done |
| Verdict engine (rule-based + GPT-4o-mini fallback) | Done |
| Alerts cron + Resend email | Done |
| Scraper service (7 retailers) | Done — validated locally |
| Phase A (build + railway.toml) | Done |
| Phase B (Railway deploy + local env) | Mostly done |
| Phase C (7/7 scraper validation) | Done |
| Local dev heat fix (mock-by-default, heap cap) | Done |

---

## Retailer coverage (7/7)

| Platform | Data path | Status |
|---|---|---|
| Amazon | PA API + Playwright fallback | Working |
| Flipkart | Affiliate API + Playwright fallback | Working |
| Reliance Digital | Playwright | Working |
| Tata Cliq | Playwright | Working |
| Vijay Sales | Magento GraphQL API | Working |
| Croma | Playwright (pincode + searchB) + stealth browser | Working |
| Myntra | Playwright slug search + stealth browser (fashion queries only) | Working |

Railway notes:
- `railway.toml` installs Playwright **Chrome** channel (required for Croma/Myntra)
- Optional `SCRAPER_PROXY_URL` for Akamai-heavy requests
- Optional `PLAYWRIGHT_CHANNEL=chrome` locally if bundled Chromium is blocked

---

## Local development

- `npm run dev` uses **mock data by default** (no scraper needed, low CPU)
- Live prices: `PRICELY_USE_MOCK_DATA=0 npm run dev` + scraper on `:3001`
- Stop runaway processes: `./scripts/stop-local.sh`

---

## Next milestone — Thin Beta

1. Watchlist live prices (fetch compare per item on load)
2. Stable product IDs (stop using raw search query as `productId`)
3. Vercel production deploy (env vars, OAuth redirects, Resend domain)
4. Real trending feed (replace mock `/api/trending`)

---

## Deferred (not blocking beta)

- City selector UI — hardcoded to Mumbai
- Rate limiting on public API routes
- Light theme — tokens exist, `ThemeProvider` not wired
- Remove unused `zustand` and `next-themes` deps
