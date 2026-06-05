# Pricely — Product Plan

**Updated:** Jun 2026

---

## Product Overview

Pricely is a buy-timing intelligence engine for Indian consumers. It tracks prices across 7 ecommerce retailers — Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, Tata Cliq, and Myntra — for electronics, fashion, sneakers, appliances, and watches. For every product, Pricely logs price history, computes a 90-day verdict, and tells the user one thing: **buy now, or wait**.

Grocery and cabs are out of scope. Pricely is not a deals site or a coupon aggregator — it is a decision engine for purchases where timing matters.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Package manager | pnpm |
| Styling | CSS custom properties (design tokens) + Tailwind |
| Client data fetching | SWR (`refreshInterval: 300_000`) |
| Input validation | Zod on every API route |
| Auth + Database | Supabase (PostgreSQL + Auth + RLS) |
| Cache | Upstash Redis |
| Email | Resend |
| Price data | Playwright scrapers on Railway |
| Frontend hosting | Vercel |
| Scraper hosting | Railway |
| Cron | Vercel cron (alert checks every 5 min) |
| AI verdict fallback | GPT-4o-mini |
| Charts | Recharts |
| Fonts | Geist + Geist Mono (next/font) |

---

## Platform Coverage

| ID | Name | Category | Data Source |
|---|---|---|---|
| `amazon` | Amazon | Electronics, Appliances | PA API v5 + Playwright fallback |
| `flipkart` | Flipkart | Electronics, Appliances | Affiliate API + Playwright fallback |
| `croma` | Croma | Electronics, Appliances | Playwright |
| `reliance_digital` | Reliance Digital | Electronics, Appliances | Playwright |
| `vijay_sales` | Vijay Sales | Electronics, Appliances | Playwright |
| `tata_cliq` | Tata Cliq | Electronics, Fashion | Playwright |
| `myntra` | Myntra | Fashion, Sneakers, Watches | Playwright |

---

## Route Architecture

```
app/
  page.tsx              Home — first-visit hero / returning feed
  compare/page.tsx      Compare — VerdictHero, retailer grid, price history
  watchlist/page.tsx    Watchlist — auth-gated, price tracking
  alerts/page.tsx       Alerts — target-price notifications
  signin/page.tsx       Sign in — email + Google OAuth
  signup/page.tsx       Sign up
  auth/callback/        OAuth code exchange

  api/
    trending/           GET /api/trending
    compare/            GET /api/compare?q=&city=
    watchlist/          GET / POST / DELETE (auth)
    alerts/             GET / POST / DELETE (auth)
    verdict/            GET /api/verdict?productId=&city=
    search/             GET /api/search?q=&city=
    cron/alerts/        GET (CRON_SECRET required)

middleware.ts           Supabase session refresh
```

---

## Design Token Quick Reference

All values from `src/styles/tokens.css`.

| Token | Value |
|---|---|
| `--bg0` | `#0A0A0B` |
| `--bg1` | `#111214` |
| `--bg2` | `#1A1C1F` |
| `--bg3` | `#222528` |
| `--accent` | `#1ED760` |
| `--text` | `#F4F4F6` |
| `--text-dim` | `#8A8F98` |
| `--text-faint` | `#4A4F58` |
| `--save` | `#1ED760` |
| `--warn` | `#F5A623` |
| `--danger` | `#F05252` |
| `--glass-plate-bg` | `rgba(255,255,255,0.04)` |
| `--glass-plate-border` | `rgba(255,255,255,0.08)` |
| `--r-pill` | `9999px` |
| `--font-mono` | `'Geist Mono', ui-monospace, monospace` |
