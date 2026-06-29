# Pricely

**Never overpay again.**

Pricely is a buy-timing intelligence engine for Indian shoppers. It tracks prices across seven major retailers — Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, Tata Cliq, and Myntra — and answers one question with confidence:

> **Buy now, or wait?**

Not another deals feed. Not a coupon aggregator. A decision engine for purchases where timing actually matters — phones, laptops, sneakers, watches, appliances, and everything in between.

---

## The problem

Indian ecommerce is a maze of flash sales, fake discounts, and platform-specific pricing. The same iPhone can swing ₹8,000 in a week. Flipkart's "Big Billion Days" isn't always the best day. Amazon's "deal" might still be ₹2,000 above last month's low.

Most shoppers either buy too early and regret it, or wait too long and miss the window. There's no single place that watches the price *for you* and tells you when the moment is right.

## The idea

Pricely watches the price of anything you want to buy — logs it daily, learns the pattern, compares across retailers — and surfaces a clear verdict backed by 90-day price history.

```
  You search          Pricely tracks           You decide
  ───────────    →    ──────────────    →    ───────────
  "iPhone 16"         7 retailers              Buy now
                      daily price logs         or wait
                      sale-cycle patterns      (with reason)
```

**Track** what you want. **Watch** how the price moves. **Decide** with data, not guesswork.

---

## How it works

| Step | What happens |
|------|--------------|
| **01 — Track** | Search any product or add it to your watchlist. Pricely starts monitoring every retailer that sells it. |
| **02 — Watch** | Prices are logged continuously. The engine learns sale cycles, drops, restocks, and cross-platform spreads. |
| **03 — Decide** | A verdict engine analyses 90 days of history and tells you: buy now, wait, or set a target price alert. Always with the reason. |

---

## What you get

| Feature | Description |
|---------|-------------|
| **Compare** | Live prices across all seven retailers in one view — with the cheapest option highlighted. |
| **Verdict** | Rule-based buy/wait signal with GPT-4o-mini fallback for edge cases. No black box. |
| **Price history** | Interactive chart showing how a product's price has moved over time. |
| **Watchlist** | Save products you're considering. Sign in to sync across devices. |
| **Alerts** | Set a target price. Get an email the moment it drops. Checked every 5 minutes. |
| **Trending** | See what other shoppers are tracking right now. |

---

## Retailer coverage

| Platform | Categories | Data source |
|----------|------------|-------------|
| Amazon | Electronics, appliances | PA API v5 → Playwright fallback |
| Flipkart | Electronics, appliances | Affiliate API → Playwright fallback |
| Croma | Electronics, appliances | Playwright |
| Reliance Digital | Electronics, appliances | Playwright |
| Vijay Sales | Electronics, appliances | Magento GraphQL |
| Tata Cliq | Electronics, fashion | Playwright |
| Myntra | Fashion, sneakers, watches | Playwright |

Affiliate APIs are used where available; Playwright handles the rest on a dedicated Railway service. The app runs fully on mock data when the scraper service and Supabase are not configured, so live coverage depends on your deployment.

---

## Architecture

Pricely is a modern full-stack web app with a separate scraper microservice — Playwright can't run on Vercel serverless, so scraping lives on Railway.

```
┌─────────────────────────────────────────────────────────┐
│  Vercel — Next.js 16 + React 19                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Pages   │  │ API routes│  │  Cron    │             │
│  │  Compare │  │  /compare │  │  Alerts  │             │
│  │  Watchlist│ │  /verdict │  │  (5 min) │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│         │            │                │                 │
│         ▼            ▼                ▼                 │
│    Supabase     Upstash Redis      Resend email         │
│    (Auth + DB)  (price cache)      (alert delivery)     │
└────────────────────────┬────────────────────────────────┘
                         │ SCRAPER_SERVICE_URL
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Railway — Express + Playwright                         │
│  7 retailer scrapers · stealth browser · proxy support  │
└─────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript (strict) |
| Styling | CSS design tokens + Tailwind |
| Data fetching | SWR (5-minute refresh) |
| Validation | Zod on every API route |
| Auth + database | Supabase (PostgreSQL + RLS) |
| Cache | Upstash Redis |
| Email | Resend |
| AI verdict fallback | GPT-4o-mini |
| Charts | Recharts |
| App hosting | Vercel |
| Scraper hosting | Railway |

---

## Project status

Working toward a stable v1. The v1 promise: search a product, compare live or mock
prices across the seven supported retailers, see a buy/wait verdict, and save to a
watchlist or alert when signed in.

| Area | Status |
|------|--------|
| Home, Compare, Watchlist, Alerts pages | Implemented |
| Auth (email + Google OAuth) | Implemented |
| Verdict engine + price history chart | Implemented |
| Alert cron + email delivery | Implemented |
| 7 retailer scrapers | Implemented (live coverage varies by site and credentials) |
| Local dev on mock data, no credentials | Supported |

Deferred to v1.1: city-selector UI, light-theme parity, and additional categories
(groceries, cabs). See [`PROGRESS.md`](PROGRESS.md).

---

## For developers

### Quick start

**Requirements:** Node.js ≥ 20, pnpm

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

No credentials needed — all API routes return mock data when `SCRAPER_SERVICE_URL` and `NEXT_PUBLIC_SUPABASE_URL` are unset. For live prices:

```bash
# Terminal 1 — scraper service
cd scraper && pnpm install && pnpm dev

# Terminal 2 — app with live data
PRICELY_USE_MOCK_DATA=0 pnpm dev
```

### Project structure

```
app/                  Next.js App Router — pages and API routes
src/
  components/ui/      Shared UI primitives
  lib/                Redis, Supabase, SWR, fetch utilities
  services/           Compare, watchlist, alerts, verdict logic
  styles/             Design tokens (tokens.css)
  types/              Shared TypeScript contracts
scraper/              Railway microservice — Express + Playwright
supabase/             Schema and migrations
docs/design/          Design reference artifacts (read-only)
```

### Commands

```bash
pnpm dev            # Start Next.js dev server
pnpm build          # Production build
pnpm lint           # ESLint
pnpm tsc --noEmit   # Type check
```

### Environment variables

<details>
<summary><strong>Vercel (Next.js app)</strong></summary>

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://<host>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>

# Railway scraper service
SCRAPER_SERVICE_URL=https://<service>.railway.app
SCRAPER_SERVICE_SECRET=<random_32_char_secret>

# OpenAI (verdict engine fallback)
OPENAI_API_KEY=sk-...

# Amazon PA API v5
AMAZON_ACCESS_KEY=<key>
AMAZON_SECRET_KEY=<secret>
AMAZON_PARTNER_TAG=<tag>-21

# Flipkart Affiliate
FLIPKART_AFFILIATE_ID=<id>
FLIPKART_AFFILIATE_TOKEN=<token>

# Resend email
RESEND_API_KEY=re_...

# Vercel cron verification
CRON_SECRET=<random_32_char_secret>
```

</details>

<details>
<summary><strong>Railway (scraper service)</strong></summary>

```bash
SCRAPER_SERVICE_SECRET=<same as above>
AMAZON_ACCESS_KEY=<key>
AMAZON_SECRET_KEY=<secret>
AMAZON_PARTNER_TAG=<tag>-21
FLIPKART_AFFILIATE_ID=<id>
FLIPKART_AFFILIATE_TOKEN=<token>
PORT=3001
```

Health check: `GET /health` → `{ "ok": true }`

</details>

### Deployment

- **Vercel** — push to `main`, auto-deploys
- **Railway** — push to `main`, builds via `railway.toml`

---

## Design

Pricely uses a dark, data-forward visual language — monospace accents, glass plates, and a single green accent for savings signals. The design system is contract-driven:

- Token contract: [`docs/design/design-system-contract.md`](docs/design/design-system-contract.md)
- Visual reference: [`docs/design/pricely-design-system.html`](docs/design/pricely-design-system.html) (open in browser)

---

<p align="center">
  <strong>Pricely</strong> — price intelligence for Indian shoppers.<br>
  <em>Buy now, or wait. Always with the reason.</em>
</p>
