# Pricely

Real-time price comparison across Indian commerce platforms.

Pricely helps users search for products or trips and instantly compare live prices, ETAs, and savings across multiple apps — grocery, electronics, and cab fares. The goal is quick, confident buy-now vs wait decisions.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, React 19, TypeScript strict |
| Package manager | pnpm |
| Styling | CSS design tokens + Tailwind utilities |
| Animation | Framer Motion |
| Data fetching | SWR (`refreshInterval: 300s`) |
| Validation | Zod on every API route |
| Auth + Database | Supabase (PostgreSQL + RLS) |
| Cache | Upstash Redis |
| App hosting | Vercel |
| Scraper service | Railway (separate Node.js + Playwright process) |

## Project Structure

```
app/                  Next.js App Router pages and API routes
src/
  components/ui/      Shared UI primitives
  lib/                Redis, Supabase, SWR, fetch utilities
  services/           Business logic (compare, watchlist, alerts, verdict…)
  styles/             CSS design tokens (tokens.css)
  types/              Shared TypeScript types (index.ts)
scraper/              Railway microservice — Express + Playwright scrapers
  scrapers/           Per-platform retail scrapers (12 platforms)
  scrapers/cabs/      Per-platform cab scrapers (4 platforms)
supabase/             schema.sql DDL
docs/design/          Read-only design reference artifacts
```

## Local Development

**Requirements:** Node.js ≥ 20, pnpm

```bash
# Install dependencies
pnpm install

# Start dev server (no credentials needed — all routes use mock fallbacks)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are needed for local development. All API routes automatically return mock data when `SCRAPER_SERVICE_URL` and `NEXT_PUBLIC_SUPABASE_URL` are not set.

## Environment Variables

### Vercel (Next.js app)

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

### Railway (scraper service)

```bash
SCRAPER_SERVICE_SECRET=<same as above>
AMAZON_ACCESS_KEY=<key>
AMAZON_SECRET_KEY=<secret>
AMAZON_PARTNER_TAG=<tag>-21
FLIPKART_AFFILIATE_ID=<id>
FLIPKART_AFFILIATE_TOKEN=<token>
PORT=3001
```

## Scraper Service

The scraper runs as a separate persistent Node.js process on Railway because Playwright cannot run on Vercel serverless functions.

```bash
# From repo root
cd scraper
pnpm install
pnpm dev          # tsx watch mode
pnpm build        # tsc → dist/
pnpm start        # node dist/index.js
```

Health check: `GET /health` → `{ "ok": true }`

## Commands

```bash
pnpm dev            # Start Next.js dev server
pnpm build          # Production build
pnpm lint           # ESLint
pnpm tsc --noEmit   # Type check
```

## Platform Coverage

| Platform | Category | Approach |
|---|---|---|
| Amazon | Electronics | PA API v5 → Playwright fallback |
| Flipkart | Electronics | Affiliate API → Playwright fallback |
| Croma | Electronics | Playwright |
| Reliance Digital | Electronics | Playwright |
| Vijay Sales | Electronics | Playwright |
| Tata Cliq | Electronics | Playwright (SPA) |
| Myntra | Fashion | Playwright (fashion queries only) |
| Blinkit | Grocery | Playwright (location-gated) |
| Zepto | Grocery | Playwright (pincode-gated) |
| Swiggy Instamart | Grocery | Playwright (city-aware) |
| BigBasket | Grocery | Playwright |
| DMart Ready | Grocery | Playwright (Mumbai/Pune/Bangalore/Hyderabad only) |
| BluSmart | Cabs | Playwright + haversine estimate fallback |
| Rapido | Cabs | Playwright + haversine estimate fallback |
| Uber | Cabs | Playwright + haversine estimate fallback |
| Ola | Cabs | Playwright + haversine estimate fallback |

## Deployment

See `LAUNCH_CHECKLIST.md` for the full pre-launch verification checklist.

- **Vercel:** push to `main` — Vercel auto-deploys
- **Railway:** push to `main` — Railway builds via `railway.toml`

## Design Governance

- Token contract: `docs/design/design-system-contract.md` (read-only)
- Visual reference: `docs/design/pricely-design-system.html` (open in browser)
- Agent rules: `.cursor/rules/*.mdc`
- Implementation spec: `BACKEND_EXEC.md`
- Progress tracking: `PROGRESS.md`
