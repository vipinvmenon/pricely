# Pricely — Backend Execution Spec

> This document is the single authoritative implementation reference for all
> backend work. Every API route, SQL table, TypeScript function, and scraper
> is specified here with enough precision that an agent has zero ambiguity
> about what to build.
>
> Read `docs/PRODUCT_PLAN.md` for context. Read `.cursor/rules/` before editing
> any file. This document supersedes `PLAN_BACKEND.md` and `BACKEND_PLAN.md`.

---

## Phase 1 — Database + Auth

### 1.1 Supabase Schema

Apply the following DDL to the Supabase project via the SQL editor.
The full file is at `supabase/schema.sql`. Reproduced here for reference.

```sql
create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_category') then
    create type public.product_category as enum ('grocery', 'electronics', 'cabs');
  end if;
end $$;

-- user_profiles
create table if not exists public.user_profiles (
  user_id   uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  city      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- products
create table if not exists public.products (
  id          text        primary key,
  title       text        not null,
  category    public.product_category not null,
  subtitle    text,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- watchlist
create table if not exists public.watchlist (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null default auth.uid()
                          references auth.users(id) on delete cascade,
  product_id  text        not null references public.products(id) on delete cascade,
  city        text        not null,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id, city)
);
create index if not exists watchlist_user_id_idx on public.watchlist(user_id);
create index if not exists watchlist_product_city_idx on public.watchlist(product_id, city);

-- alerts
create table if not exists public.alerts (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null default auth.uid()
                               references auth.users(id) on delete cascade,
  product_id       text        not null references public.products(id) on delete cascade,
  city             text        not null,
  platform_id      text,
  target_price     numeric     not null check (target_price >= 0),
  is_active        boolean     not null default true,
  created_at       timestamptz not null default now(),
  last_triggered_at timestamptz
);
create index if not exists alerts_user_id_idx on public.alerts(user_id);
create index if not exists alerts_product_city_idx on public.alerts(product_id, city);
create index if not exists alerts_active_idx on public.alerts(is_active) where is_active = true;

-- price_history
create table if not exists public.price_history (
  id          uuid        primary key default gen_random_uuid(),
  product_id  text        not null references public.products(id) on delete cascade,
  city        text        not null,
  platform_id text        not null,
  price       numeric     not null check (price >= 0),
  recorded_at timestamptz not null default now()
);
create index if not exists price_history_lookup_idx
  on public.price_history(product_id, city, platform_id, recorded_at desc);
-- Composite index for chart queries
create index if not exists price_history_chart_idx
  on public.price_history(product_id, city, recorded_at desc);

-- Row Level Security
alter table public.user_profiles  enable row level security;
alter table public.watchlist       enable row level security;
alter table public.alerts          enable row level security;
-- price_history and products are public read / service-role write
alter table public.price_history   enable row level security;
alter table public.products        enable row level security;

-- user_profiles policies
create policy "profiles_select_own" on public.user_profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.user_profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.user_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- watchlist policies
create policy "watchlist_select_own" on public.watchlist
  for select using (auth.uid() = user_id);
create policy "watchlist_insert_own" on public.watchlist
  for insert with check (auth.uid() = user_id);
create policy "watchlist_delete_own" on public.watchlist
  for delete using (auth.uid() = user_id);

-- alerts policies
create policy "alerts_select_own"  on public.alerts
  for select using (auth.uid() = user_id);
create policy "alerts_insert_own"  on public.alerts
  for insert with check (auth.uid() = user_id);
create policy "alerts_update_own"  on public.alerts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "alerts_delete_own"  on public.alerts
  for delete using (auth.uid() = user_id);

-- price_history: public read, service-role write
create policy "price_history_public_read" on public.price_history
  for select using (true);
create policy "price_history_service_write" on public.price_history
  for insert with check (auth.role() = 'service_role');

-- products: public read, service-role write
create policy "products_public_read" on public.products
  for select using (true);
create policy "products_service_write" on public.products
  for insert with check (auth.role() = 'service_role');
create policy "products_service_update" on public.products
  for update using (auth.role() = 'service_role');
```

### 1.2 Auth Configuration

**Supabase Dashboard steps (manual, not automated):**
1. Authentication → Providers → Google → Enable → paste Client ID + Secret from Google Cloud Console
2. Authentication → URL Configuration → add `http://localhost:3000/auth/callback` and `https://{VERCEL_URL}/auth/callback`
3. Authentication → Email Templates → customise confirmation email subject line

**Protected routes (require authenticated session):**
- `/watchlist` — redirect to `/signin` if unauthenticated
- `/api/watchlist` (POST, DELETE) — return 401
- `/api/alerts` (GET, POST, DELETE) — return 401

**Unauthenticated access:** Home, Compare, Cabs, Search — fully accessible.
Watchlist page renders a sign-in prompt instead of items.

### 1.3 Supabase Client Files

**`src/lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

**`src/lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    },
  )
}
```

### 1.4 Middleware

**`middleware.ts`** (repo root)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/watchlist')) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### 1.5 Platform Registry Update

**`src/types/index.ts`** — update `PlatformId`:
```typescript
export type PlatformId =
  | 'blinkit' | 'zepto' | 'swiggy_instamart' | 'bigbasket' | 'dmart_ready'
  | 'amazon' | 'flipkart' | 'croma' | 'reliance_digital' | 'vijay_sales'
  | 'tata_cliq' | 'myntra'
  | 'blusmart' | 'rapido' | 'uber' | 'ola'
```

**`src/lib/utils/platforms.ts`** — add to PLATFORMS record:
```typescript
tata_cliq:  { id: 'tata_cliq',  name: 'Tata Cliq',  category: 'electronics' },
myntra:     { id: 'myntra',     name: 'Myntra',      category: 'electronics' },
blusmart:   { id: 'blusmart',   name: 'BluSmart',    category: 'cabs' },
```
Remove `namma_yatri` and `indrive` entries.

---

## Phase 2 — Real API Routes

### 2.1 Redis Client

**`src/lib/redis/client.ts`**
```typescript
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

**`src/lib/redis/keys.ts`**
```typescript
export const keys = {
  compare:   (productId: string, city: string) => `compare:${productId}:${city}`,
  trending:  (city: string)                     => `trending:${city}`,
  trips:     (from: string, to: string, city: string) => `trips:${from}:${to}:${city}`,
  watchlist: (userId: string)                   => `watchlist:${userId}`,
} as const

export const TTL = {
  compare:   300,   // 5 min
  trending:  600,   // 10 min
  trips:     120,   // 2 min
  watchlist: 60,    // 1 min
} as const
```

### 2.2 GET /api/trending

**File:** `app/api/trending/route.ts`
**Method:** GET
**Query params:** `city` (optional, default `'mumbai'`)

**Zod schema:**
```typescript
const QuerySchema = z.object({
  city: z.string().default('mumbai'),
})
```

**Response type:** `TrendingItem[]`

**Implementation:**
1. Check Redis cache with `keys.trending(city)` — return if hit
2. Query Supabase `products` table for top-10 most-watched items in city (via watchlist join)
3. Fall back to hardcoded mock array if `NEXT_PUBLIC_SUPABASE_URL` is unset
4. Write result to Redis with `TTL.trending`
5. Return `NextResponse.json(items)`

**Mock fallback condition:** `if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return MOCK_TRENDING`

### 2.3 GET /api/compare

**File:** `app/api/compare/route.ts`
**Method:** GET
**Query params:** `q` (required), `city` (optional, default `'mumbai'`)

**Zod schema:**
```typescript
const QuerySchema = z.object({
  q:    z.string().min(1).max(200),
  city: z.string().default('mumbai'),
})
```

**Response type:** `CompareResponse` (product, retailers, history, verdict)

**Implementation:**
1. Parse + validate query with Zod — return 400 on failure
2. Normalise `q` via `normalizeQuery(q)` from `src/lib/utils/format.ts`
3. Check Redis cache with `keys.compare(normalizedQ, city)` — return if hit
4. Call `compareService.compare(q, city)` — see Phase 3
5. Call `verdictService.computeVerdict(history)` — see Phase 9
6. Write to Redis with `TTL.compare`
7. Return `NextResponse.json(result)`

**Mock fallback condition:** `if (!process.env.SCRAPER_SERVICE_URL) return MOCK_COMPARE_RESPONSE`

**Error handling:**
- 400: Zod parse failure (return `{ error: string, issues: ZodIssue[] }`)
- 503: Scraper service unreachable (return `{ error: 'scraper_unavailable' }`, activate mock)
- 500: All other errors (return `{ error: 'internal_error' }`)

### 2.4 GET / POST / DELETE /api/watchlist

**File:** `app/api/watchlist/route.ts`
**Auth:** Required for POST and DELETE. GET requires auth to return user-specific data.

**GET:**
```typescript
// Query: none
// Response: WatchlistPageItem[]
// 1. getUser() — 401 if null
// 2. Check Redis keys.watchlist(userId)
// 3. Fetch from Supabase watchlist JOIN products JOIN price_history (latest price per platform)
// 4. Map to WatchlistPageItem[]
// 5. Write to Redis TTL.watchlist
```

**POST Zod schema:**
```typescript
const PostBodySchema = z.object({
  productId: z.string().min(1),
  city:      z.string().min(1).default('mumbai'),
})
```
```typescript
// 1. getUser() — 401 if null
// 2. Validate body
// 3. Upsert to watchlist table
// 4. Invalidate Redis keys.watchlist(userId)
// 5. Return { id: string }
```

**DELETE Zod schema:**
```typescript
const DeleteQuerySchema = z.object({
  id: z.string().uuid(),
})
```
```typescript
// 1. getUser() — 401 if null
// 2. Validate query
// 3. Delete from watchlist WHERE id = ? AND user_id = ? (RLS also enforces this)
// 4. Invalidate Redis keys.watchlist(userId)
// 5. Return { success: true }
```

### 2.5 GET /api/trips

**File:** `app/api/trips/route.ts`
**Method:** GET
**Query params:** `from`, `to` (required, lat,lng format), `city` (optional)

**Zod schema:**
```typescript
const QuerySchema = z.object({
  from: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  to:   z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  city: z.string().default('mumbai'),
})
```

**Response type:** `TripsResponse`

**Implementation:**
1. Parse + validate
2. Check Redis `keys.trips(from, to, city)` — return if hit
3. Call `tripsService.getFares(from, to, city)`
4. Write to Redis `TTL.trips`
5. Return result

**Mock fallback condition:** `if (!process.env.SCRAPER_SERVICE_URL) return MOCK_TRIPS_RESPONSE`

---

## Phase 3 — Price Data Infrastructure

### 3.1 Scraper Service Architecture

The scraper service runs as a **separate persistent Node.js process on Railway**.
Next.js API routes call it over HTTP. Vercel cannot run Playwright.

```
Vercel (Next.js)                    Railway (scraper service)
─────────────────                   ──────────────────────────
app/api/compare/route.ts
  └─ compareService.ts
       └─ src/lib/scraper/client.ts  ──POST /scrape──►  scraper/index.ts
                                                          └─ scrapers/amazon.ts
                                                          └─ scrapers/flipkart.ts
                                                          └─ ... (12 retail + 4 cab)
```

### 3.2 Scraper Service HTTP Contract

**`POST /scrape`** (retail products)
```typescript
// Request body
interface ScrapeRequest {
  query:       string        // normalised search query
  platforms:   PlatformId[]  // which platforms to scrape
  city:        string        // city slug
  maxResults?: number        // per platform, default 3
}

// Response body
interface ScrapeResponse {
  results: ScrapeResult[]
  errors:  ScrapeError[]
}

interface ScrapeResult {
  platformId:  PlatformId
  price:       number
  mrp?:        number
  title:       string
  url:         string
  stock:       'in_stock' | 'low_stock' | 'out_of_stock'
  delivery?:   string       // e.g. "Free · 1 day"
  returns?:    string       // e.g. "7 days"
  scrapedAt:   string       // ISO timestamp
}

interface ScrapeError {
  platformId: PlatformId
  message:    string
  retryable:  boolean
}
```

**`POST /scrape/cabs`** (cab fares)
```typescript
interface CabScrapeRequest {
  from:      string   // "lat,lng"
  to:        string   // "lat,lng"
  platforms: PlatformId[]
}

interface CabScrapeResponse {
  results: CabScrapeResult[]
  errors:  ScrapeError[]
}

interface CabScrapeResult {
  platformId:       PlatformId
  price:            number
  eta:              string    // "4 min away"
  surgeMultiplier?: number
  bookUrl:          string
  scrapedAt:        string
}
```

**Auth:** `Authorization: Bearer {SCRAPER_SERVICE_SECRET}` on every request.

### 3.3 Scraper HTTP Client

**`src/lib/scraper/client.ts`**
```typescript
import type { ScrapeRequest, ScrapeResponse, CabScrapeRequest, CabScrapeResponse } from '@/types'

const BASE = process.env.SCRAPER_SERVICE_URL
const SECRET = process.env.SCRAPER_SERVICE_SECRET

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!BASE) throw new Error('SCRAPER_SERVICE_URL not configured')
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SECRET}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Scraper responded ${res.status}`)
  return res.json() as Promise<T>
}

export const scraperClient = {
  scrape:     (req: ScrapeRequest)    => post<ScrapeResponse>('/scrape', req),
  scrapeCabs: (req: CabScrapeRequest) => post<CabScrapeResponse>('/scrape/cabs', req),
}
```

### 3.4 Compare Service

**`src/services/compareService.ts`**
```typescript
import { scraperClient } from '@/lib/scraper/client'
import { redis } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import { priceHistoryService } from './priceHistoryService'
import type { CompareResponse, PlatformId } from '@/types'

const RETAIL_PLATFORMS: PlatformId[] = [
  'amazon', 'flipkart', 'croma', 'reliance_digital',
  'vijay_sales', 'tata_cliq', 'myntra',
]

export async function compare(query: string, city: string): Promise<CompareResponse> {
  const cacheKey = keys.compare(query, city)
  const cached = await redis.get<CompareResponse>(cacheKey).catch(() => null)
  if (cached) return cached

  if (!process.env.SCRAPER_SERVICE_URL) return MOCK_COMPARE_RESPONSE

  const { results, errors } = await scraperClient.scrape({
    query, platforms: RETAIL_PLATFORMS, city, maxResults: 1,
  })

  const retailers = results
    .sort((a, b) => a.price - b.price)
    .map((r, i) => ({ rank: i + 1, ...r, isLowest: i === 0 }))

  await priceHistoryService.writePricePoints(
    results.map(r => ({ productId: query, platformId: r.platformId, city, price: r.price }))
  )

  const history = await priceHistoryService.getPriceHistory(query, city, 90)

  const response: CompareResponse = {
    product: { id: query, name: results[0]?.title ?? query, brand: '', category: 'electronics' },
    retailers,
    history,
    errors,
  }

  await redis.setex(cacheKey, TTL.compare, response)
  return response
}
```

---

## Phase 4 — Scrapers: Retailers

All scraper files live in the `scraper/` directory (Railway service root).

### 4.1 Shared Scraper Interface

**`scraper/types.ts`**
```typescript
export interface ScraperContext {
  query:    string
  city:     string
  maxResults: number
}

export interface ScraperResult {
  platformId:  string
  price:       number
  mrp?:        number
  title:       string
  url:         string
  stock:       'in_stock' | 'low_stock' | 'out_of_stock'
  delivery?:   string
  returns?:    string
  scrapedAt:   string
}

export type Scraper = (ctx: ScraperContext) => Promise<ScraperResult[]>
```

### 4.2 Scraper Service Entry Point

**`scraper/index.ts`**
```typescript
import express from 'express'
import { amazon }          from './scrapers/amazon'
import { flipkart }        from './scrapers/flipkart'
import { croma }           from './scrapers/croma'
import { reliance_digital } from './scrapers/reliance_digital'
import { vijay_sales }     from './scrapers/vijay_sales'
import { tata_cliq }       from './scrapers/tata_cliq'
import { myntra }          from './scrapers/myntra'
import { blinkit }         from './scrapers/blinkit'
import { zepto }           from './scrapers/zepto'
import { swiggy_instamart } from './scrapers/swiggy_instamart'
import { bigbasket }       from './scrapers/bigbasket'
import { dmart_ready }     from './scrapers/dmart_ready'
import { blusmart }        from './scrapers/cabs/blusmart'
import { rapido }          from './scrapers/cabs/rapido'
import { uber }            from './scrapers/cabs/uber'
import { ola }             from './scrapers/cabs/ola'

const SCRAPERS: Record<string, Scraper> = {
  amazon, flipkart, croma, reliance_digital, vijay_sales,
  tata_cliq, myntra, blinkit, zepto, swiggy_instamart,
  bigbasket, dmart_ready,
}

const CAB_SCRAPERS: Record<string, CabScraper> = {
  blusmart, rapido, uber, ola,
}

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token !== process.env.SCRAPER_SERVICE_SECRET) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  next()
})

app.post('/scrape', async (req, res) => {
  const { query, platforms, city, maxResults = 3 } = req.body
  const results = []
  const errors = []
  await Promise.allSettled(
    platforms.map(async (id: string) => {
      try {
        const r = await SCRAPERS[id]?.({ query, city, maxResults })
        if (r) results.push(...r)
      } catch (err) {
        errors.push({ platformId: id, message: String(err), retryable: true })
      }
    })
  )
  res.json({ results, errors })
})

app.post('/scrape/cabs', async (req, res) => {
  // similar fan-out for cab scrapers
})

app.get('/health', (_, res) => res.json({ ok: true }))

app.listen(process.env.PORT ?? 3001)
```

### 4.3 Per-Platform Scraper Specs

**`scraper/scrapers/amazon.ts`**
- Approach: Amazon Product Advertising API (PA API v5) via `AMAZON_ACCESS_KEY` + `AMAZON_SECRET_KEY` + `AMAZON_PARTNER_TAG`
- Fallback: Playwright on `amazon.in/s?k={query}`
- Extract: `ItemInfo.Title.DisplayValue`, `Offers.Listings[0].Price.Amount`, `Offers.Listings[0].SavingBasis.Amount` (MRP), `Offers.Listings[0].Availability.Type`
- Retry: 2 retries with 500 ms back-off; treat `TooManyRequests` as non-retryable
- Fragility: Low (official API)

**`scraper/scrapers/flipkart.ts`**
- Approach: Flipkart Affiliate API (`FLIPKART_AFFILIATE_ID` + `FLIPKART_AFFILIATE_TOKEN`)
- Fallback: Playwright on `flipkart.com/search?q={query}`
- Extract: `productBaseInfoV1.title`, `productBaseInfoV1.flipkartSpecialPrice`, `productBaseInfoV1.mrp`, `productBaseInfoV1.stockInfo`
- Retry: 2 retries; `401` is non-retryable
- Fragility: Low (official API)

**`scraper/scrapers/croma.ts`**
- Approach: Playwright on `croma.com/search?q={query}`
- Selector targets: `.product-item` → `h3.product-title`, `.pdp-price` (current), `.line-through` (MRP)
- Extract: title, current price, MRP, stock label, delivery estimate from badge
- Retry: 2 retries; `TimeoutError` triggers retry
- Fragility: Medium (DOM selectors)

**`scraper/scrapers/reliance_digital.ts`**
- Approach: Playwright on `reliancedigital.in/search?q={query}`
- Selector targets: `.sp__name`, `.final-price`, `.mrp`
- Fragility: Medium

**`scraper/scrapers/vijay_sales.ts`**
- Approach: Playwright on `vijaysales.com/search?q={query}`
- Selector targets: `.product-name`, `.special-price`, `.old-price`
- Fragility: Medium

**`scraper/scrapers/tata_cliq.ts`**
- Approach: Playwright on `tatacliq.com/search#?q={query}`
- Note: SPA — wait for `.product-card` hydration before extracting
- Fragility: Medium-High (heavy JS)

**`scraper/scrapers/myntra.ts`**
- Approach: Playwright on `myntra.com/{category}-{query}/buy`
- Note: Category-aware URL (fashion only; skip for electronics queries)
- Fragility: High (auth-wall on some paths)

**`scraper/scrapers/blinkit.ts`**
- Approach: Playwright on `blinkit.com/s/?q={query}`
- Note: Location cookie required; set to city coordinates before scraping
- Extract: `.Product__Title`, `.Price-box__price`, `.out-of-stock` badge
- Fragility: High (location-gated)

**`scraper/scrapers/zepto.ts`**
- Approach: Playwright on `zeptonow.com/search?query={query}`
- Note: serviceability check required; set pincode cookie
- Fragility: High

**`scraper/scrapers/swiggy_instamart.ts`**
- Approach: Playwright on `swiggy.com/instamart/search?query={query}`
- Note: City-aware; pass city in URL/cookie
- Fragility: High

**`scraper/scrapers/bigbasket.ts`**
- Approach: Playwright on `bigbasket.com/ps/?q={query}`
- Note: Login wall for some cities; use guest session
- Fragility: Medium

**`scraper/scrapers/dmart_ready.ts`**
- Approach: Playwright on `dmartready.com/search/{query}`
- Note: Only available in select cities (Mumbai, Pune, Bangalore, Hyderabad)
- Fragility: Medium

### 4.4 Playwright Boilerplate Pattern

All Playwright scrapers follow this pattern:
```typescript
import { chromium } from 'playwright'
import type { Scraper } from '../types'

export const croma: Scraper = async ({ query, maxResults }) => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  try {
    await page.goto(`https://www.croma.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 10_000,
    })
    await page.waitForSelector('.product-item', { timeout: 5_000 })
    const items = await page.$$eval('.product-item', (els, max) =>
      els.slice(0, max).map(el => ({
        title:    el.querySelector('h3.product-title')?.textContent?.trim() ?? '',
        price:    parseFloat(el.querySelector('.pdp-price')?.textContent?.replace(/[^0-9.]/g, '') ?? '0'),
        mrp:      parseFloat(el.querySelector('.line-through')?.textContent?.replace(/[^0-9.]/g, '') ?? '0') || undefined,
        url:      (el.querySelector('a') as HTMLAnchorElement)?.href ?? '',
        stock:    el.querySelector('.out-of-stock') ? 'out_of_stock' : 'in_stock',
      })), maxResults)
    return items.map(item => ({ ...item, platformId: 'croma', scrapedAt: new Date().toISOString() }))
  } finally {
    await browser.close()
  }
}
```

---

## Phase 5 — Scrapers: Cabs

### 5.1 Cab Scraper Interface

```typescript
export interface CabScraperContext {
  from: string  // "lat,lng"
  to:   string  // "lat,lng"
}

export interface CabScraperResult {
  platformId:       string
  price:            number
  eta:              string
  surgeMultiplier?: number
  bookUrl:          string
  scrapedAt:        string
}

export type CabScraper = (ctx: CabScraperContext) => Promise<CabScraperResult>
```

### 5.2 Per-Cab Scraper Specs

**`scraper/scrapers/cabs/blusmart.ts`**
- Approach: Deep link to `blu-smart.com` + parse fare from redirect or unofficial booking API
- Extract: base fare, ETA
- Fallback: Return fixed estimate if scrape fails (lower fragility tolerance)

**`scraper/scrapers/cabs/uber.ts`**
- Approach: Playwright on `m.uber.com/looking` — set pickup/dropoff via URL params
- Extract: `.price-range`, `.eta` from ride options list
- Note: Surge multiplier readable from product card
- Fragility: High (SPA, auth may be required)

**`scraper/scrapers/cabs/ola.ts`**
- Approach: Playwright on `book.olacabs.com` — set pickup/dropoff, extract fare estimate
- Fragility: High

**`scraper/scrapers/cabs/rapido.ts`**
- Approach: Playwright on `rapido.bike` — booking flow with coordinates
- Fragility: Medium-High

### 5.3 Trips Service (Full Implementation)

**`src/services/tripsService.ts`**
```typescript
import { scraperClient } from '@/lib/scraper/client'
import { redis } from '@/lib/redis/client'
import { keys, TTL } from '@/lib/redis/keys'
import type { TripsResponse, PlatformId } from '@/types'

const CAB_PLATFORMS: PlatformId[] = ['blusmart', 'rapido', 'uber', 'ola']

export async function getFares(from: string, to: string, city: string): Promise<TripsResponse> {
  const cacheKey = keys.trips(from, to, city)
  const cached = await redis.get<TripsResponse>(cacheKey).catch(() => null)
  if (cached) return cached

  if (!process.env.SCRAPER_SERVICE_URL) return MOCK_TRIPS_RESPONSE

  const { results, errors } = await scraperClient.scrapeCabs({
    from, to, platforms: CAB_PLATFORMS,
  })

  const fares = results
    .sort((a, b) => a.price - b.price)
    .map((r, i) => ({ ...r, isLowest: i === 0 }))

  const response: TripsResponse = { fares, errors }
  await redis.setex(cacheKey, TTL.trips, response)
  return response
}
```

---

## Phase 6 — Price History

### 6.1 Price History Service

**`src/services/priceHistoryService.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import type { HistoryPoint, PlatformId } from '@/types'

interface PricePoint {
  productId:  string
  platformId: PlatformId
  city:       string
  price:      number
}

export async function writePricePoints(points: PricePoint[]): Promise<void> {
  const supabase = await createClient()

  for (const point of points) {
    // Deduplication: skip if price unchanged within last hour
    const { data: last } = await supabase
      .from('price_history')
      .select('price, recorded_at')
      .eq('product_id', point.productId)
      .eq('platform_id', point.platformId)
      .eq('city', point.city)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
    if (last && last.price === point.price && last.recorded_at > oneHourAgo) {
      continue
    }

    await supabase.from('price_history').insert({
      product_id:  point.productId,
      platform_id: point.platformId,
      city:        point.city,
      price:       point.price,
    })
  }
}

export async function getPriceHistory(
  productId: string,
  city: string,
  days: number,
): Promise<HistoryPoint[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()

  const { data } = await supabase
    .from('price_history')
    .select('price, recorded_at')
    .eq('product_id', productId)
    .eq('city', city)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true })

  return (data ?? []).map(row => ({
    date:  row.recorded_at.slice(0, 10),
    price: row.price,
  }))
}
```

### 6.2 Data Retention

- Records older than 365 days can be pruned via a scheduled Supabase Edge Function or manual SQL job.
- No automatic deletion is implemented in Phase 6 — add as a future maintenance task.

---

## Phase 7 — Watchlist

### 7.1 Watchlist Service

**`src/services/watchlistService.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import type { WatchlistPageItem } from '@/types'

export async function getWatchlist(userId: string): Promise<WatchlistPageItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('watchlist')
    .select('id, product_id, city, products(title, category, subtitle)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return mapToPageItems(data ?? [])
}

export async function addToWatchlist(
  userId: string, productId: string, city: string
): Promise<{ id: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('watchlist')
    .insert({ user_id: userId, product_id: productId, city })
    .select('id')
    .single()
  if (error) throw error
  return { id: data.id }
}

export async function removeFromWatchlist(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('watchlist').delete().eq('id', id).eq('user_id', userId)
}
```

### 7.2 localStorage Fallback

For unauthenticated users, pending watchlist adds are stored in localStorage under
`pricely_pending_watchlist` as `Array<{ productId: string, city: string }>`.
On sign-in success, the auth callback flushes pending items by calling
`POST /api/watchlist` for each, then clears localStorage.

### 7.3 Optimistic Mutation

In the watchlist page, use SWR's `mutate` with optimistic data:
```typescript
await mutate('/api/watchlist',
  currentItems.filter(item => item.id !== id),
  { revalidate: false }
)
await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' })
await mutate('/api/watchlist')
```

---

## Phase 8 — Alerts + Cron + Email

### 8.1 Alerts Service

**`src/services/alertsService.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getAlerts(userId: string) { ... }
export async function createAlert(userId: string, productId: string, city: string, targetPrice: number, platformId?: string) { ... }
export async function deleteAlert(id: string, userId: string) { ... }

// Used by cron only — uses service role client
export async function getActiveAlerts() {
  // Returns all alerts WHERE is_active = true
  // Joins with products table for title
}
```

### 8.2 Alerts API Route

**`app/api/alerts/route.ts`**

**GET:** Return all alerts for authenticated user.

**POST Zod schema:**
```typescript
const PostBodySchema = z.object({
  productId:   z.string().min(1),
  city:        z.string().min(1).default('mumbai'),
  targetPrice: z.number().positive(),
  platformId:  z.string().optional(),
})
```

**DELETE Zod schema:**
```typescript
const DeleteQuerySchema = z.object({ id: z.string().uuid() })
```

All three methods return 401 when `getUser()` returns null.

### 8.3 Cron Route

**`app/api/cron/alerts/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { getActiveAlerts } from '@/services/alertsService'
import { compare } from '@/services/compareService'
import { sendPriceDropEmail } from '@/lib/email/resend'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const alerts = await getActiveAlerts()

  for (const alert of alerts) {
    const result = await compare(alert.productId, alert.city)
    const lowestPrice = result.retailers[0]?.price
    if (!lowestPrice) continue

    if (lowestPrice <= alert.targetPrice) {
      await sendPriceDropEmail({
        to:           alert.userEmail,
        productTitle: alert.productTitle,
        targetPrice:  alert.targetPrice,
        currentPrice: lowestPrice,
        retailerName: result.retailers[0].name,
        buyUrl:       result.retailers[0].buyUrl,
      })
      // Mark alert as triggered (keep active for re-trigger next day)
      await supabase.from('alerts').update({ last_triggered_at: new Date().toISOString() }).eq('id', alert.id)
    }
  }

  return NextResponse.json({ processed: alerts.length })
}
```

**`vercel.json`** cron entry:
```json
{
  "crons": [
    {
      "path": "/api/cron/alerts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 8.4 Resend Email

**`src/lib/email/resend.ts`**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface PriceDropEmailParams {
  to:           string
  productTitle: string
  targetPrice:  number
  currentPrice: number
  retailerName: string
  buyUrl:       string
}

export async function sendPriceDropEmail(params: PriceDropEmailParams): Promise<void> {
  await resend.emails.send({
    from:    'Pricely <alerts@pricely.in>',
    to:      params.to,
    subject: `Price drop: ${params.productTitle} is now ₹${params.currentPrice.toLocaleString('en-IN')}`,
    html:    buildEmailHtml(params),
  })
}

function buildEmailHtml(params: PriceDropEmailParams): string {
  return `
    <h2>Your target price was hit</h2>
    <p><strong>${params.productTitle}</strong></p>
    <p>Current price on ${params.retailerName}:
       <strong>₹${params.currentPrice.toLocaleString('en-IN')}</strong></p>
    <p>Your target was ₹${params.targetPrice.toLocaleString('en-IN')}</p>
    <a href="${params.buyUrl}">Buy now →</a>
  `
}
```

---

## Phase 9 — Verdict Engine

### 9.1 Rule-Based Logic

**`src/services/verdictService.ts`**
```typescript
import type { HistoryPoint, Verdict } from '@/types'

export function computeVerdict(history: HistoryPoint[]): Verdict {
  if (history.length < 7) {
    return gptFallback(history)
  }

  const prices = history.map(h => h.price)
  const current = prices[prices.length - 1]
  const min90 = Math.min(...prices)
  const avg90 = prices.reduce((a, b) => a + b, 0) / prices.length
  const recent7 = prices.slice(-7)
  const trend = recent7[6] - recent7[0]  // positive = rising, negative = falling

  const vsMin  = (current - min90) / min90          // 0 = at 90d low
  const vsAvg  = (current - avg90) / avg90          // negative = below avg

  if (vsMin <= 0.03 && vsAvg <= -0.05) {
    // At or near 90-day low, below average — strong buy
    return { action: 'buy', confidence: 0.9, reason: 'Near 90-day low and below average price' }
  }
  if (vsMin <= 0.10 && trend < 0) {
    // Within 10% of low and price is falling — buy
    return { action: 'buy', confidence: 0.75, reason: 'Close to 90-day low with downward trend' }
  }
  if (vsMin > 0.15 && trend > 0) {
    // More than 15% above low and rising — wait
    return { action: 'wait', confidence: 0.8, reason: 'Price is above average and trending up' }
  }

  const confidence = 0.45
  if (confidence < 0.5) return gptFallback(history)

  // Default: neutral buy
  return { action: 'buy', confidence: 0.55, reason: 'Price is near historical average' }
}
```

### 9.2 GPT-4o-mini Fallback

```typescript
async function gptFallback(history: HistoryPoint[]): Promise<Verdict> {
  const OpenAI = (await import('openai')).default
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = `
You are a price analysis assistant for Indian e-commerce.
Given this 90-day price history (date, price in INR):
${JSON.stringify(history)}

Return a JSON object with exactly these fields:
{
  "action": "buy" or "wait",
  "confidence": number between 0 and 1,
  "reason": string, max 80 characters, in plain English
}

Rules:
- "buy" if current price is at or near the historical low
- "wait" if price is elevated and likely to drop soon
- confidence reflects how clear the signal is
- reason must be concise and consumer-friendly (e.g. "Lowest price in 3 months")
`.trim()

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 120,
  })

  return JSON.parse(completion.choices[0].message.content ?? '{}') as Verdict
}
```

### 9.3 Verdict API Route

**`app/api/verdict/route.ts`**
```typescript
// GET /api/verdict?productId=&city=
// Zod: { productId: z.string().min(1), city: z.string().default('mumbai') }
// 1. Fetch price history via priceHistoryService
// 2. Compute verdict via verdictService.computeVerdict
// 3. Return { verdict: Verdict }
```

---

## Phase 10 — Search

### 10.1 Search Service

**`src/services/searchService.ts`**
```typescript
import { scraperClient } from '@/lib/scraper/client'
import type { PriceResult, PlatformCategory, PlatformId } from '@/types'

const CATEGORY_PLATFORMS: Record<PlatformCategory, PlatformId[]> = {
  grocery:     ['blinkit', 'zepto', 'swiggy_instamart', 'bigbasket', 'dmart_ready'],
  electronics: ['amazon', 'flipkart', 'croma', 'reliance_digital', 'vijay_sales', 'tata_cliq', 'myntra'],
  cabs:        [],
}

export async function search(
  query: string,
  city: string,
  category?: PlatformCategory,
): Promise<PriceResult[]> {
  if (!process.env.SCRAPER_SERVICE_URL) return MOCK_SEARCH_RESULTS

  const platforms = category
    ? CATEGORY_PLATFORMS[category]
    : [...CATEGORY_PLATFORMS.grocery, ...CATEGORY_PLATFORMS.electronics]

  const { results } = await scraperClient.scrape({ query, platforms, city, maxResults: 3 })

  return normaliseAndRank(results)
}

function normaliseAndRank(raw: ScrapeResult[]): PriceResult[] {
  // Deduplicate by normalised title (lowercase, stripped punctuation)
  const seen = new Map<string, PriceResult>()
  for (const r of raw) {
    const key = r.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!seen.has(key) || r.price < seen.get(key)!.price) {
      seen.set(key, {
        platformId:   r.platformId as PlatformId,
        platformName: PLATFORMS[r.platformId as PlatformId]?.name ?? r.platformId,
        category:     'electronics',
        price:        r.price,
        mrp:          r.mrp,
        updatedAt:    r.scrapedAt,
        url:          r.url,
      })
    }
  }
  return [...seen.values()].sort((a, b) => a.price - b.price)
}
```

### 10.2 Search API Route

**`app/api/search/route.ts`**
```typescript
// GET /api/search?q=&city=&category=
// Zod schema:
const QuerySchema = z.object({
  q:        z.string().min(1).max(200),
  city:     z.string().default('mumbai'),
  category: z.enum(['grocery', 'electronics']).optional(),
})
// 1. Parse + validate
// 2. normalizeQuery(q)
// 3. searchService.search(q, city, category)
// 4. Return PriceResult[]
```

---

## Phase 11 — Performance + Observability

### 11.1 Redis TTL Reference

| Cache key pattern | TTL | Rationale |
|---|---|---|
| `compare:{productId}:{city}` | 300 s (5 min) | Price freshness vs scraper load |
| `trending:{city}` | 600 s (10 min) | Low volatility |
| `trips:{from}:{to}:{city}` | 120 s (2 min) | Surge changes fast |
| `watchlist:{userId}` | 60 s (1 min) | Near-real-time for UX |
| `alerts:*` | No cache | Always read from DB |
| `search:{query}:{city}` | 180 s (3 min) | Balances freshness vs load |

### 11.2 What Is Never Cached

- Alert state (`is_active`, `last_triggered_at`) — always read from DB
- User authentication session — managed by Supabase cookies
- Cron job execution state — stateless by design

### 11.3 SWR Config

**`src/lib/swr/config.ts`**
```typescript
export const SWR_CONFIG = {
  refreshInterval:    300_000,   // 5 min polling
  revalidateOnFocus:  false,     // avoid noisy re-fetches
  revalidateOnReconnect: true,
  dedupingInterval:   10_000,
  shouldRetryOnError: false,
} as const
```

Wrap `app/layout.tsx` children with:
```typescript
import { SWRConfig } from 'swr'
import { SWR_CONFIG } from '@/lib/swr/config'
// <SWRConfig value={SWR_CONFIG}>{children}</SWRConfig>
```

### 11.4 Request Timing

Add to every API route handler:
```typescript
const start = Date.now()
// ... handler logic ...
const response = NextResponse.json(data)
response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
return response
```

### 11.5 Stale-While-Revalidate for Compare

In `app/api/compare/route.ts`, after confirming cache hit, set headers to allow
stale serving:
```typescript
response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
```

---

## Phase 12 — Launch Readiness

### 12.1 Environment Variables

**Required in Vercel (production):**

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

# OpenAI
OPENAI_API_KEY=sk-...

# Amazon PA API
AMAZON_ACCESS_KEY=<key>
AMAZON_SECRET_KEY=<secret>
AMAZON_PARTNER_TAG=<tag>-21

# Flipkart Affiliate
FLIPKART_AFFILIATE_ID=<id>
FLIPKART_AFFILIATE_TOKEN=<token>

# Resend email
RESEND_API_KEY=re_...

# Vercel cron secret
CRON_SECRET=<random_32_char_secret>
```

**Required in Railway (scraper service):**

```bash
SCRAPER_SERVICE_SECRET=<same as above>
AMAZON_ACCESS_KEY=<key>
AMAZON_SECRET_KEY=<secret>
AMAZON_PARTNER_TAG=<tag>-21
FLIPKART_AFFILIATE_ID=<id>
FLIPKART_AFFILIATE_TOKEN=<token>
PORT=3001
```

**Local development (`.env.local` — never committed):**

All production vars can be omitted. Routes activate mock fallbacks automatically
when `SCRAPER_SERVICE_URL` and `NEXT_PUBLIC_SUPABASE_URL` are unset.

### 12.2 Vercel Project Config

**`vercel.json`**
```json
{
  "crons": [
    {
      "path": "/api/cron/alerts",
      "schedule": "*/5 * * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### 12.3 Railway Service Config

**`railway.toml`**
```toml
[build]
builder = "nixpacks"
buildCommand = "cd scraper && pnpm install && pnpm run build"

[deploy]
startCommand = "cd scraper && node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 10
restartPolicyType = "always"
```

### 12.4 Smoke Test Checklist

After deploying, verify these manually or via automated requests:

- [ ] `GET /` — home page loads, trending items visible
- [ ] `GET /compare?q=sony+wh1000xm5` — compare page loads, retailer rows rendered
- [ ] `GET /cabs` — cab fares load, at least one FareCard rendered
- [ ] `GET /api/trending` — returns array with at least 1 item
- [ ] `GET /api/compare?q=test&city=mumbai` — returns product + retailers + history
- [ ] `GET /api/trips?from=19.076,72.877&to=18.924,72.833&city=mumbai` — returns fares
- [ ] `GET /api/watchlist` without auth — returns 401
- [ ] `POST /api/watchlist` without auth — returns 401
- [ ] `GET /api/cron/alerts` without `Authorization` header — returns 401
- [ ] `GET /api/cron/alerts` with correct `CRON_SECRET` — returns `{ processed: N }`
- [ ] Sign in with Google — redirects back to app, session cookie set
- [ ] Sign in with email — confirmation email arrives via Resend
- [ ] Add item to watchlist — appears in `/watchlist`
- [ ] Create alert — appears in alerts list
- [ ] `/watchlist` without session — redirects to `/signin`

---

## Non-Negotiables

These constraints must never be skipped, shortcut, or changed without explicit
user approval.

1. **Mock fallbacks always active.** Every API route checks for the presence of
   `SCRAPER_SERVICE_URL` (and `NEXT_PUBLIC_SUPABASE_URL` where applicable)
   before making live calls. Local development must run without any credentials.

2. **Zod on every route.** All API route handlers validate inputs with Zod and
   return a structured `{ error, issues }` response on parse failure before any
   business logic executes.

3. **No `any` types.** TypeScript strict mode is active. No `@ts-ignore` or
   `@ts-expect-error` suppressions anywhere in `src/` or `app/`.

4. **RLS enforced.** All user-owned data (watchlist, alerts, user_profiles) has
   Row Level Security enabled and policies in place. The service role key is
   only used in server-side code (never exposed to the client).

5. **Playwright runs on Railway only.** No Playwright import, require, or dynamic
   import anywhere inside `app/`, `src/`, or any file that could reach a Vercel
   serverless function. All scraping happens in the `scraper/` service.

6. **Design tokens only.** No hardcoded hex colours, spacing values, or radius
   values in any component or page file. All visual values come from
   `src/styles/tokens.css` custom properties.

7. **Phase gates.** Each phase must reach a clean build (`npm run build` passes,
   zero type errors, zero lint errors) before the next phase begins. Validation
   commands require explicit user approval before running.

8. **`docs/design/` is read-only.** Files under `docs/design/` are design
   reference artifacts. They are never modified during implementation.

9. **`CRON_SECRET` always verified.** The cron route must check the
   `Authorization` header against `CRON_SECRET` as its first operation,
   before any database access.

10. **Service role key server-only.** `SUPABASE_SERVICE_ROLE_KEY` must only
    appear in server-side files (`app/api/`, `src/services/`, `src/lib/supabase/server.ts`).
    It must never be assigned to a `NEXT_PUBLIC_` variable.
