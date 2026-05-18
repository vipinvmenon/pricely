# Pricely — Launch Checklist

Work through this list top-to-bottom before going live. Each item must be verified, not assumed.

---

## 1. Database (Supabase)

- [ ] Apply `supabase/schema.sql` to Supabase project via SQL editor
- [ ] Confirm all 5 tables exist: `user_profiles`, `products`, `watchlist`, `alerts`, `price_history`
- [ ] Confirm RLS is enabled on all 5 tables
- [ ] Enable Google OAuth: Authentication → Providers → Google → paste Client ID + Secret
- [ ] Add redirect URLs: `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`
- [ ] Run smoke: `supabase.auth.getUser()` returns `null` for unauthenticated request without error

## 2. Upstash Redis

- [ ] Create Upstash Redis database (free tier is fine to start)
- [ ] Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into Vercel env vars
- [ ] Verify connection: `redis.ping()` returns `PONG`

## 3. Scraper Service (Railway)

- [ ] Push repo to GitHub (or connect Railway to existing GitHub repo)
- [ ] Create Railway project → deploy from repo root → Railway auto-detects `railway.toml`
- [ ] Set Railway env vars:
  - `SCRAPER_SERVICE_SECRET` (random 32-char string, same value as Vercel)
  - `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG`
  - `FLIPKART_AFFILIATE_ID`, `FLIPKART_AFFILIATE_TOKEN`
  - `PORT=3001`
- [ ] Wait for health check to pass: `GET https://<railway-url>/health` → `{ "ok": true }`
- [ ] Install Playwright browsers: add `npm exec playwright install chromium` to Railway build command
- [ ] Copy Railway service URL into Vercel env as `SCRAPER_SERVICE_URL`

## 4. Vercel — Environment Variables

Set all of these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SCRAPER_SERVICE_URL
SCRAPER_SERVICE_SECRET
OPENAI_API_KEY
AMAZON_ACCESS_KEY
AMAZON_SECRET_KEY
AMAZON_PARTNER_TAG
FLIPKART_AFFILIATE_ID
FLIPKART_AFFILIATE_TOKEN
RESEND_API_KEY
CRON_SECRET
```

- [ ] All 15 variables set in Vercel for Production environment
- [ ] Redeploy after setting variables (Vercel requires redeploy to pick up new env vars)

## 5. Email (Resend)

- [ ] Create Resend account at resend.com
- [ ] Add and verify sending domain (e.g. `alerts@pricely.in`)
- [ ] Copy API key → `RESEND_API_KEY` in Vercel
- [ ] Test: send a manual `POST` to `/api/cron/alerts` with correct `CRON_SECRET` and confirm email arrives

## 6. API Smoke Tests

Run each of these after production deploy:

- [ ] `GET /` — home page loads, no console errors
- [ ] `GET /compare?q=sony+wh1000xm5` — compare page renders retailer rows
- [ ] `GET /cabs` — cab fares render at least one card
- [ ] `GET /api/trending` — JSON array with ≥ 1 item
- [ ] `GET /api/compare?q=iphone+15&city=mumbai` — returns `{ product, retailers, history, verdict }`
- [ ] `GET /api/trips?from=19.076,72.877&to=18.924,72.833&city=mumbai` — returns `{ fares, errors }`
- [ ] `GET /api/watchlist` (no cookie) → 401
- [ ] `POST /api/watchlist` (no cookie) → 401
- [ ] `GET /api/alerts` (no cookie) → 401
- [ ] `GET /api/cron/alerts` (no Authorization header) → 401
- [ ] `GET /api/cron/alerts` with `Authorization: Bearer <CRON_SECRET>` → `{ processed: N }`
- [ ] `GET /api/verdict?productId=test&city=mumbai` → `{ verdict: { action, confidence, reason } }`
- [ ] `GET /api/search?q=milk&city=mumbai` → sorted `PriceResult[]`

## 7. Auth Flow

- [ ] Sign up with email → confirmation email arrives via Resend (or Supabase default)
- [ ] Sign in with Google → redirects back to app, session cookie set
- [ ] Visit `/watchlist` without session → redirects to `/signin`
- [ ] After sign-in → `/watchlist` loads user-specific data

## 8. Watchlist + Alerts

- [ ] Add item to watchlist (while signed in) → appears in `/watchlist`
- [ ] Remove item from watchlist → optimistic removal, then confirms on server
- [ ] Create price alert → appears in alerts list
- [ ] Cron fires → `last_triggered_at` updates when price ≤ target

## 9. Build Health

- [ ] `npm run lint` — zero errors, zero warnings
- [ ] `npx tsc --noEmit` — zero type errors
- [ ] `npm run build` — builds successfully, no skipped pages

## 10. Performance

- [ ] Lighthouse score ≥ 90 on `/` (Performance)
- [ ] All API routes return `X-Response-Time` header
- [ ] `/api/compare` returns `Cache-Control: s-maxage=300, stale-while-revalidate=60`
- [ ] No duplicate network requests on initial page load (verify in DevTools Network tab)
