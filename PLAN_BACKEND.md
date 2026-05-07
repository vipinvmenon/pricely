# PLAN_BACKEND.md

Backend specification for the Pricely full rewrite.

This file defines the API contract layer, mock-to-production progression, validation rules, cache/DB responsibilities, and the scraper/verdict/cron responsibilities.

## API design rules

All API route handlers must follow:
1. Zod validation on input (query params, path params, body)
2. Mock-backed typed responses for local development
3. No business logic “in the route file” beyond validation + orchestration
4. Output must match `src/types/index.ts` contracts

Mock fallback rule (must stay active for local dev):

```ts
if (!process.env.SCRAPER_SERVICE_URL) {
  return MOCK_RESULT;
}
```

## Route contract layer (Phase 6)

Target API routes (typed + mock-backed):

```text
app/api/
  search/trending/route.ts
  prices/
    grocery/route.ts
    electronics/route.ts
    cabs/route.ts
  history/[productId]/route.ts
  watchlist/route.ts
  alerts/route.ts
  cron/check-alerts/route.ts
```

Expected method shapes:
- `GET /api/search/trending?city=` -> trending items (mock)
- `GET /api/prices/grocery?q=&city=` -> `PriceResult[]` (mock)
- `GET /api/prices/electronics?q=&city=` -> `PriceResult[]` (mock)
- `GET /api/prices/cabs?from_lat=&from_lng=&to_lat=&to_lng=&city=` -> `PriceResult[]` (mock)
- `GET /api/history/[productId]?city=&days=90` -> `PriceHistoryPoint[]` (mock)
- `GET /api/watchlist` and `POST /api/watchlist` and `DELETE` semantics -> Supabase-backed with auth guard
- `POST /api/alerts` -> Supabase-backed alert creation
- `GET /api/cron/check-alerts` -> verifies `CRON_SECRET`, triggers checks

## Cache + persistence responsibilities

Data flow contract (high-level):
1. API handler validates input with Zod
2. Upstash Redis cache check:
   - If hit: return cached typed payload
   - If miss: proceed to fetch/scrape
3. Scraper service fetch (Railway) and/or external provider calls
4. Upstash Redis write-back
5. Supabase persistence for watchlist/alerts and (optionally) price history
6. Return response to the client

## Scraper service (Phase 8)

- Scraping is executed by a persistent Node process (Railway) because Playwright cannot be used directly in Vercel API routes.
- API routes call the scraper service via `SCRAPER_SERVICE_URL` and authenticate via `SCRAPER_SERVICE_SECRET`.
- Scraper integration must keep mock fallback active when scraper service env vars are missing.

## Verdict engine (Phase 9)

Verdict behavior:
- Implement a rule-based verdict engine in `src/lib/ai/verdict.ts`
- Near ATL -> `buy`
- If price is not favorable over the relevant history horizon -> `wait`
- GPT fallback for ambiguous verdict cases is optional and behind `OPENAI_API_KEY` presence.

## Cron + alerts (Phase 9)

- Cron calls `GET /api/cron/check-alerts` every 5 minutes.
- Cron route verifies `CRON_SECRET` and triggers alert checks.
- On trigger: send alert email via Resend.

