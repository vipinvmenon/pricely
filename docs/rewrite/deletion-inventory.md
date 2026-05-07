# Phase 0 — Deletion Inventory (Current -> Target)

Generated: 2026-05-05

This document enumerates what exists now under `app/` and `src/`, and maps it to the target rewrite architecture defined in [`REBUILD_PLAN.md`](d:\Projects\pricely\REBUILD_PLAN.md).

## Routing convention

This repo uses the top-level Next.js App Router in [`app/`](d:\Projects\pricely\app/).

There is no `src/app/` directory.

## Replacement strategy (how to interpret the map)

The rewrite plan specifies a full reset:
- Everything under `app/` (routes/layouts/API routes and `globals.css`) is replaced.
- Everything under `src/` (components/features/styles/lib/services/hooks/types/constants/config) is replaced by the target architecture.

Therefore, this Phase 0 inventory is intentionally strict: even if some modules look similar to target equivalents, they are still treated as “replace wholesale” in this rewrite.

## Target architecture summary (for mapping)

From [`REBUILD_PLAN.md`](d:\Projects\pricely\REBUILD_PLAN.md), the target shape is:

- `app/(dashboard)/...` for the authenticated shell + pages
- `app/api/...` for Zod-validated, mock-backed API contracts
- `src/components/ui/*`, `src/components/layout/*`, `src/components/features/*` for UI primitives
- `src/lib/*` for cache/db/scrapers/ai/geo/utils
- `src/styles/tokens.css` as the CSS variable source of truth
- `src/types/index.ts` as the single type barrel

## Replacement map: `app/`

### Layout, globals, and app chrome
- `app/layout.tsx` -> replace (new root layout: fonts + Theme init + `globals.css`)
- `app/globals.css` -> replace (import tokens + set `html/body` to token-driven background/text)
- `app/manifest.ts` -> recreate or keep equivalent (not currently covered by REBUILD_PLAN target list, but app manifest is required)
- `app/icon.tsx` -> recreate equivalent icon handler if needed
- `app/apple-icon.tsx` -> recreate equivalent apple icon handler if needed

### Pages (route movement into `app/(dashboard)/...`)
- `app/page.tsx` -> delete/replace as `app/(dashboard)/page.tsx`
- `app/search/page.tsx` -> delete/replace as `app/(dashboard)/search/[query]/page.tsx`
- `app/cabs/page.tsx` -> delete/replace as `app/(dashboard)/cabs/page.tsx`
- `app/watchlist/page.tsx` -> delete/replace as `app/(dashboard)/watchlist/page.tsx`
- `app/item/[id]/page.tsx` -> delete/replace as `app/(dashboard)/product/[id]/page.tsx`

Deferred/removed for the moment (not in the Phase 5/REBUILD_PLAN UI route list):
- `app/alerts/page.tsx` -> deferred to later phases (UI page not listed in REBUILD_PLAN page routes; API routes exist later)
- `app/profile/page.tsx` -> deferred (auth-gated page, later in Phase 9 in most plans)
- `app/settings/page.tsx` -> deferred (auth-gated and/or settings page, later)

### API routes
All API routes under `app/api/` are replaced with the target contracts in REBUILD_PLAN Phase 6+.

Current -> Target mapping:
- `app/api/search/route.ts` -> replaced by `app/api/search/trending/route.ts`
- `app/api/prices/[id]/route.ts` -> replaced by category-specific routes:
  - `app/api/prices/grocery/route.ts`
  - `app/api/prices/electronics/route.ts`
  - `app/api/history/[productId]/route.ts` (history is a separate contract)
- `app/api/cabs/route.ts` -> replaced by `app/api/prices/cabs/route.ts` (target uses GET + geo params)
- `app/api/alerts/route.ts` -> replaced by:
  - `app/api/alerts/route.ts` (create alerts)
  - `app/api/watchlist/route.ts` (watchlist CRUD)
  - `app/api/cron/check-alerts/route.ts` (cron-triggered checks)

## Replacement map: `src/`

### UI layer
The target UI layer is:
- `src/components/ui/*` (GlassCard, SearchBar, ResultCard, VerdictChip, etc.)
- `src/components/layout/*` (DesktopNav, TabBar)
- `src/components/features/*` (orchestrators/composites used by pages)

Current mapping:
- `src/components/**` -> replaced to match the target folder contracts above.
- `src/features/**` -> deleted (dissolved) and moved into `src/components/features/**`.

### Styles layer
- `src/styles/**` -> deleted/replaced.
- Target: `src/styles/tokens.css` as the single source of truth for all CSS variables.

### Types layer
- `src/types/**` -> deleted/replaced.
- Target: `src/types/index.ts` as the single type barrel.

### Data layer (mock/services -> cache/db/scrapers)
- `src/services/**`, `src/hooks/**` -> deleted/replaced.
- Target:
  - `src/lib/cache/redis.ts` (Upstash Redis client + key factories)
  - `src/lib/db/supabase.ts` (server+browser clients + helpers)
  - `src/lib/scrapers/*` (Railway scraper service pattern)
  - `src/lib/geo/index.ts`
  - `src/lib/ai/verdict.ts`
  - `src/lib/utils/*` (format + platform registry, etc.)

## Appendices

### Appendix A — Current `app/` files
- app\api\alerts\route.ts
- app\api\cabs\route.ts
- app\api\prices\[id]\route.ts
- app\api\search\route.ts
- app\apple-icon.tsx
- app\cabs\page.tsx
- app\globals.css
- app\icon.tsx
- app\item\[id]\page.tsx
- app\layout.tsx
- app\manifest.ts
- app\page.tsx
- app\profile\page.tsx
- app\search\page.tsx
- app\settings\page.tsx
- app\watchlist\page.tsx
- app\alerts\page.tsx

### Appendix B — Current `src/` files
- src\components\layout\DesktopNav.tsx
- src\components\layout\MobileNav.tsx
- src\components\ui\AppShell.tsx
- src\components\ui\BottomSheet.tsx
- src\components\ui\CompareGrid.tsx
- src\components\ui\ETABadge.tsx
- src\components\ui\FilterChip.tsx
- src\components\ui\Glass.tsx
- src\components\ui\LineChart.tsx
- src\components\ui\PlatformLogo.tsx
- src\components\ui\PlatformPill.tsx
- src\components\ui\PriceBadge.tsx
- src\components\ui\RechartsLineChart.client.tsx
- src\components\ui\ResultCard.tsx
- src\components\ui\SaveBadge.tsx
- src\components\ui\SearchBar.tsx
- src\components\ui\SparkChart.tsx
- src\components\ui\SkeletonCard.tsx
- src\components\ui\TrendChip.tsx
- src\components\ui\VerdictChip.tsx
- src\components\ui\BottomSheet.tsx
- src\components\ui\MobileStickyCTA.tsx
- src\components\ui\VerdictChip.tsx
- src\config\site.ts
- src\constants\routes.ts
- src\features\account\ProfilePage.tsx
- src\features\account\SettingsPage.tsx
- src\features\alerts\AlertCard.tsx
- src\features\alerts\AlertsPage.tsx
- src\features\alerts\CreateAlertSheet.tsx
- src\features\cabs\CabResultsList.tsx
- src\features\cabs\CabsPage.tsx
- src\features\cabs\MockMap.tsx
- src\features\cabs\RouteInput.tsx
- src\features\cabs\SurgeAdvisor.tsx
- src\features\home\HomePage.tsx
- src\features\home\PricelyDesignUI.tsx
- src\features\home\RecentSearches.tsx
- src\features\home\SearchHero.tsx
- src\features\home\SearchSuggestions.tsx
- src\features\home\TrendingSearches.tsx
- src\features\home\pricely-design.module.css
- src\features\product\BuyWaitCard.tsx
- src\features\product\ProductCompareGrid.tsx
- src\features\product\ProductDetailPage.tsx
- src\features\product\ProductHero.tsx
- src\features\product\PriceHistorySection.tsx
- src\features\product\SetAlertButton.tsx
- src\features\search\FilterPanel.tsx
- src\features\search\PlatformFilterRow.tsx
- src\features\search\SearchPageHeader.tsx
- src\features\search\SearchResultsList.tsx
- src\features\search\SearchResultsPage.tsx
- src\features\watchlist\WatchlistCard.tsx
- src\features\watchlist\WatchlistPage.tsx
- src\hooks\use-alerts.ts
- src\hooks\use-theme.ts
- src\hooks\use-watchlist.ts
- src\lib\cn.ts
- src\lib\format.ts
- src\lib\data\mock-cabs.ts
- src\lib\data\mock-history.ts
- src\lib\data\mock-products.ts
- src\lib\data\mock-prices.ts
- src\lib\data\platforms.ts
- src\services\alert-service.ts
- src\services\cab-service.ts
- src\services\http-client.ts
- src\services\price-service.ts
- src\services\search-service.ts
- src\styles\animations.css
- src\styles\tokens.css
- src\styles\typography.css
- src\types\alert.ts
- src\types\cab.ts
- src\types\index.ts
- src\types\platform.ts
- src\types\price.ts
- src\types\product.ts
- src\types\search.ts
- src\types\ui.ts

