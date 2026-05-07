# TECH_STACK.md

Approved stack and contract-level dependency expectations for the Pricely rewrite.

## Runtime baseline

- Framework: Next.js (App Router)
- Language: TypeScript (strict)
- Package manager: pnpm
- Styling: CSS custom properties (design tokens) + Tailwind utilities
- State: Zustand (theme, city, auth session only)
- Client fetching: SWR
- Validation: Zod on every API route
- Charts/visualizations: React-friendly canvas/SVG (and optionally Recharts where needed)

## Planned dependency set (installation occurs in Phase 2)

The rewrite plan expects these additional packages to be installed as part of foundation:

| Package | Purpose |
|---|---|
| `framer-motion` | List reordering + subtle transitions |
| `zustand` | Theme/city/auth session state |
| `swr` | Client data fetching + polling |
| `date-fns` | Date math + relative time formatting helpers |
| `zod` | API request/response validation |
| `@supabase/supabase-js` | Supabase client for DB + auth |
| `@supabase/ssr` | Supabase SSR helpers |
| `@upstash/redis` | Upstash Redis client (cache) |
| `lucide-react` | Iconography |
| `next-themes` | Theme hydration handling |

## Environment variables

Required environment variables (from [`REBUILD_PLAN.md`](d:\Projects\pricely\REBUILD_PLAN.md)):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Railway scraper service
SCRAPER_SERVICE_URL=
SCRAPER_SERVICE_SECRET=

# OpenAI
OPENAI_API_KEY=

# Amazon PA API
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=

# Flipkart Affiliate API
FLIPKART_AFFILIATE_ID=
FLIPKART_AFFILIATE_TOKEN=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=

# Alert cron
CRON_SECRET=

# Resend email
RESEND_API_KEY=
```

## Local development rule

Local dev must not require live credentials. API routes must keep mock fallbacks active behind environment variable presence checks, e.g.:

```ts
if (!process.env.SCRAPER_SERVICE_URL) return MOCK_PRICES;
```

