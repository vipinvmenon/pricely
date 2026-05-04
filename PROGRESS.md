# Pricely — Implementation Progress

> Full plan: `docs/PRODUCT_PLAN.md`
> Update this file as each item is completed.

---

## Legend
- `[x]` Completed
- `[ ]` Pending
- `[~]` In progress

---

## Phase 0 — Repository Foundation
*All done. Clean repo, src architecture, token scaffold, rules, AGENTS.md.*

- [x] Repository cleaned of template noise
- [x] `src/` architecture folders created
- [x] `src/styles/tokens.css` — initial token set
- [x] `tsconfig.json` — `@/*` path alias → `src/*`
- [x] `eslint.config.mjs` — docs/design excluded, lint clean
- [x] Build passing
- [x] Design system contract — `docs/design/design-system-contract.md`
- [x] Cursor rules — `.cursor/rules/00-06.mdc`
- [x] `AGENTS.md` — operating manual
- [x] `README.md` — project-specific
- [x] `docs/PRODUCT_PLAN.md` — this implementation plan

---

## Phase 1 — Design System Build-Out

### 1.1 Expanded Token System
- [ ] Full dark theme tokens (bg layers, glass, text, borders, shadows, accent, semantics)
- [ ] Light theme on `[data-theme="light"]` selector
- [ ] Shadow tokens (card, float, glow, accent-glow)
- [ ] Background gradient CSS variables
- [ ] Glass blur level tokens

### 1.2 Typography and Animation
- [ ] `src/styles/typography.css` — type scale utility classes
- [ ] `src/styles/animations.css` — shimmer, caret-blink, fade-in, slide-up, glow-pulse
- [ ] `prefers-reduced-motion` guard

### 1.3 Glass Surface Primitive
- [ ] `src/components/ui/Glass.tsx` — blur + tint + sheen + rim + border stack

### 1.4 App Shell and Navigation
- [ ] `src/components/ui/AppShell.tsx` — theme-aware root wrapper
- [ ] `src/components/layout/DesktopNav.tsx` — 232px sidebar
- [ ] `src/components/layout/MobileNav.tsx` — floating glass tab bar

---

## Phase 2 — Core UI Primitive Components

### 2.1 SearchBar
- [ ] `src/components/ui/SearchBar.tsx`
- [ ] Focus ring, animated caret, mic + filter buttons

### 2.2 Platform Components
- [ ] `src/components/ui/PlatformLogo.tsx`
- [ ] `src/components/ui/PlatformPill.tsx`

### 2.3 Price and Badge Components
- [ ] `src/components/ui/PriceBadge.tsx`
- [ ] `src/components/ui/SaveBadge.tsx`
- [ ] `src/components/ui/ETABadge.tsx`
- [ ] `src/components/ui/TrendChip.tsx`

### 2.4 Result Card
- [ ] `src/components/ui/ResultCard.tsx`
- [ ] `best` variant, `compact` variant

### 2.5 Verdict and Analytics Components
- [ ] `src/components/ui/VerdictChip.tsx`
- [ ] `src/components/ui/SparkChart.tsx`
- [ ] `src/components/ui/LineChart.tsx`

### 2.6 Loading States
- [ ] `src/components/ui/SkeletonCard.tsx`
- [ ] `SkeletonText`, `SkeletonChart`

### 2.7 Bottom Sheet and Compare Grid
- [ ] `src/components/ui/BottomSheet.tsx`
- [ ] `src/components/ui/CompareGrid.tsx`

### 2.8 Filter Chip
- [ ] `src/components/ui/FilterChip.tsx`

---

## Phase 3 — Data Layer

### 3.1 Types
- [ ] `src/types/product.ts`
- [ ] `src/types/platform.ts`
- [ ] `src/types/price.ts`
- [ ] `src/types/cab.ts`
- [ ] `src/types/alert.ts`
- [ ] `src/types/search.ts`
- [ ] `src/types/ui.ts`

### 3.2 Mock Data
- [ ] `src/lib/data/platforms.ts`
- [ ] `src/lib/data/mock-products.ts`
- [ ] `src/lib/data/mock-prices.ts`
- [ ] `src/lib/data/mock-history.ts`
- [ ] `src/lib/data/mock-cabs.ts`

### 3.3 Format Utilities
- [ ] `src/lib/format.ts` — formatINR, formatSaving, formatETA, formatSurge, formatRelativeTime

### 3.4 Services
- [ ] `src/services/search-service.ts`
- [ ] `src/services/price-service.ts`
- [ ] `src/services/cab-service.ts`
- [ ] `src/services/alert-service.ts`

### 3.5 API Route Handlers
- [ ] `app/api/search/route.ts`
- [ ] `app/api/prices/[id]/route.ts`
- [ ] `app/api/cabs/route.ts`
- [ ] `app/api/alerts/route.ts`

---

## Phase 4 — Search Experience

### 4.1 Search Home Page
- [ ] `src/features/home/SearchHero.tsx` — full-viewport hero
- [ ] `src/features/home/RecentSearches.tsx`
- [ ] `src/features/home/TrendingSearches.tsx`
- [ ] Category chips row
- [ ] Platform logo strip
- [ ] `app/page.tsx` updated to new home

### 4.2 Search Suggestions
- [ ] `src/features/home/SearchSuggestions.tsx` — dropdown, keyboard nav

### 4.3 Search Results Page
- [ ] `app/search/page.tsx`
- [ ] `src/features/search/SearchResultsPage.tsx`
- [ ] `src/features/search/SearchResultsList.tsx`
- [ ] `src/features/search/FilterPanel.tsx`
- [ ] `src/features/search/PlatformFilterRow.tsx`
- [ ] `src/features/search/SearchPageHeader.tsx`
- [ ] Loading skeleton state
- [ ] Empty state

---

## Phase 5 — Product Detail Page

- [ ] `app/item/[id]/page.tsx`
- [ ] `src/features/product/ProductDetailPage.tsx`
- [ ] `src/features/product/ProductHero.tsx`
- [ ] `src/features/product/PriceHistorySection.tsx` — with LineChart
- [ ] `src/features/product/ProductCompareGrid.tsx`
- [ ] `src/features/product/BuyWaitCard.tsx`
- [ ] `src/features/product/SetAlertButton.tsx`
- [ ] `src/features/alerts/CreateAlertSheet.tsx`

---

## Phase 6 — Cab Fare Comparison

- [ ] `app/cabs/page.tsx`
- [ ] `src/features/cabs/CabsPage.tsx`
- [ ] `src/features/cabs/RouteInput.tsx`
- [ ] `src/features/cabs/CabResultsList.tsx`
- [ ] `src/features/cabs/SurgeAdvisor.tsx`
- [ ] `src/features/cabs/MockMap.tsx`

---

## Phase 7 — Watchlist and Alerts

- [ ] `app/watchlist/page.tsx`
- [ ] `src/features/watchlist/WatchlistPage.tsx`
- [ ] `src/features/watchlist/WatchlistCard.tsx`
- [ ] `app/alerts/page.tsx`
- [ ] `src/features/alerts/AlertsPage.tsx`
- [ ] `src/features/alerts/AlertCard.tsx`
- [ ] `src/hooks/use-watchlist.ts`
- [ ] `src/hooks/use-alerts.ts`

---

## Phase 8 — Account Pages

- [ ] `app/profile/page.tsx`
- [ ] `src/features/account/ProfilePage.tsx`
- [ ] `app/settings/page.tsx`
- [ ] `src/features/account/SettingsPage.tsx`
- [ ] Theme toggle (dark / light switch)

---

## Phase 9 — Mobile Refinements

- [ ] Bottom sheet for filters on mobile
- [ ] Sticky floating CTA on results and product pages
- [ ] Swipe-to-dismiss on bottom sheets
- [ ] Touch target size audit (min 44×44)
- [ ] Safe area insets applied globally
- [ ] Responsive grid switches verified

---

## Phase 10 — Polish and Performance

### 10.1 States
- [ ] Shimmer skeletons on all data views
- [ ] Error states with retry
- [ ] Empty states with CTAs

### 10.2 Animation
- [ ] Page transitions
- [ ] Result card staggered entrance
- [ ] Search bar focus animation
- [ ] Bottom sheet spring animation
- [ ] Reduced-motion fallbacks verified

### 10.3 Performance
- [ ] Static prerender for home
- [ ] Recharts dynamic import
- [ ] Image optimization
- [ ] Font preloading

### 10.4 PWA and Metadata
- [ ] `app/manifest.ts`
- [ ] Favicon + apple-touch-icon
- [ ] OG metadata per page

---

## Summary Stats

| Phase | Total Items | Completed | Remaining |
|---|---|---|---|
| 0 — Foundation | 10 | 10 | 0 |
| 1 — Design System | 11 | 0 | 11 |
| 2 — UI Primitives | 18 | 0 | 18 |
| 3 — Data Layer | 18 | 0 | 18 |
| 4 — Search Experience | 15 | 0 | 15 |
| 5 — Product Detail | 8 | 0 | 8 |
| 6 — Cab Comparison | 6 | 0 | 6 |
| 7 — Watchlist & Alerts | 8 | 0 | 8 |
| 8 — Account | 5 | 0 | 5 |
| 9 — Mobile Refinements | 6 | 0 | 6 |
| 10 — Polish | 12 | 0 | 12 |
| **Total** | **117** | **10** | **107** |
