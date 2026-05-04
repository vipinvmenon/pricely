# Pricely — Implementation Plan

> Real-time price comparison across Indian commerce platforms.
> Design philosophy: Apple polish · Linear gradients · Liquid glass · Fintech clarity.

---

## Product Overview

Pricely lets users search for any product or service and instantly see prices across platforms — groceries (Zepto, Blinkit, Instamart, Swiggy), ecommerce (Amazon, Flipkart, Myntra), and cabs (Uber, Ola, Rapido) — sorted cheapest first with savings, ETA, and a Buy/Wait signal.

**Not** a coupon site. **Not** a deals marketplace. A premium real-time decision engine.

---

## Stack Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | Already set up, SSR/RSC for fast TTI |
| Language | TypeScript (strict) | Foundation already strict |
| Styling | Tailwind CSS v4 + CSS custom properties | Token system in `src/styles/tokens.css` |
| Animation | CSS transitions + keyframes | Keep bundle lean; no heavy dep yet |
| Charts | Recharts | Composable, lightweight, SSR-safe |
| State | React Context + `useReducer` | No complex global state needed yet |
| Mock data | Static JSON in `src/lib/data/` | No backend yet; swap for real API later |
| Fonts | Geist Sans + Geist Mono (self-hosted via next/font) | Already wired in layout |

---

## Route Architecture

```
app/
  layout.tsx                        Root layout: theme, fonts, metadata
  page.tsx                          → src/features/home (search hero)
  globals.css                       Tailwind import + token vars
  
  search/
    page.tsx                        → src/features/search (results + filters)
  
  item/[id]/
    page.tsx                        → src/features/product (detail + price history)
  
  cabs/
    page.tsx                        → src/features/cabs (fare comparison)
  
  watchlist/
    page.tsx                        → src/features/watchlist
  
  alerts/
    page.tsx                        → src/features/alerts
  
  profile/
    page.tsx                        → src/features/account/profile
  
  settings/
    page.tsx                        → src/features/account/settings

  api/
    search/route.ts                 POST: query → results[]
    prices/[id]/route.ts            GET: platform prices for item
    cabs/route.ts                   POST: from/to → fare results[]
    alerts/route.ts                 GET/POST/DELETE: user alerts
```

---

## Source Architecture

```
src/
  components/
    ui/
      AppShell.tsx                  Root layout shell
      Glass.tsx                     Liquid glass surface primitive
      SearchBar.tsx                 Pill search input with glass + focus states
      ResultCard.tsx                One platform's price offer
      CompareGrid.tsx               Desktop tabular comparison view
      PlatformPill.tsx              Logo + name pill chip
      PlatformLogo.tsx              Coloured glyph mark
      PriceBadge.tsx                ₹ value with mono tabular numerals
      SaveBadge.tsx                 "Save ₹X · Y%" pill
      ETABadge.tsx                  Delivery/ETA pill
      TrendChip.tsx                 ↑/↓ price direction chip
      VerdictChip.tsx               Buy now / Wait chip with confidence
      SparkChart.tsx                Inline price sparkline
      LineChart.tsx                 Full price history chart
      SkeletonCard.tsx              Shimmer loading placeholder
      BottomSheet.tsx               Mobile slide-up panel
      TabBar.tsx                    Mobile bottom navigation bar
      FilterChip.tsx                Toggle-able filter chip
      PriceAlertModal.tsx           Create price drop alert modal
    layout/
      DesktopNav.tsx                232px fixed side navigation
      MobileNav.tsx                 Floating bottom tab bar
  
  features/
    home/
      HomePage.tsx                  Orchestrator
      SearchHero.tsx                Full-screen search hero (dark bg + search bar)
      RecentSearches.tsx            Local recent searches list
      TrendingSearches.tsx          Curated suggestions
    
    search/
      SearchResultsPage.tsx         Orchestrator
      SearchResultsList.tsx         Sorted result cards list
      FilterPanel.tsx               Category + platform + delivery filter sidebar
      PlatformFilterRow.tsx         Scrollable platform chips
      SearchPageHeader.tsx          Search bar + live indicator
    
    product/
      ProductDetailPage.tsx         Orchestrator
      ProductHero.tsx               Image + title + price summary
      PriceHistorySection.tsx       Full chart + range selector
      OffersList.tsx                Compact offer list
      BuyWaitCard.tsx               Verdict chip + reasoning
      ProductCompareGrid.tsx        Desktop comparison table
      SetAlertButton.tsx            Price drop alert trigger
    
    cabs/
      CabsPage.tsx                  Orchestrator
      RouteInput.tsx                From / To inputs
      CabResultsList.tsx            Sorted cab result cards
      SurgeAdvisor.tsx              Wait N min, save ₹X card
      MockMap.tsx                   Route map placeholder
    
    watchlist/
      WatchlistPage.tsx             Orchestrator
      WatchlistGrid.tsx             Grid of tracked items
      WatchlistCard.tsx             Compact item card with price delta
    
    alerts/
      AlertsPage.tsx                Orchestrator
      AlertCard.tsx                 Alert target + status
      CreateAlertSheet.tsx          Bottom sheet for new alert
    
    account/
      ProfilePage.tsx
      SettingsPage.tsx
  
  hooks/
    use-search.ts                   Search query + results state
    use-prices.ts                   Platform prices fetch + polling
    use-watchlist.ts                Watchlist CRUD (localStorage backed)
    use-alerts.ts                   Alerts CRUD
  
  services/
    http-client.ts                  Base fetch wrapper (typed, throws on error)
    search-service.ts               Query → SearchResult[]
    price-service.ts                itemId → PlatformPrice[]
    cab-service.ts                  route → CabFare[]
    alert-service.ts                Alert CRUD
  
  lib/
    cn.ts                           className merge utility
    format.ts                       formatPrice, formatETA, formatSaving
    data/
      platforms.ts                  Platform metadata (id, name, gradient, category)
      mock-products.ts              Sample searchable products
      mock-prices.ts                Platform × item price table
      mock-cabs.ts                  Cab fare samples
      mock-history.ts               30d price history data
  
  types/
    product.ts
    platform.ts
    price.ts
    cab.ts
    alert.ts
    search.ts
    ui.ts
  
  constants/
    platforms.ts                    PLATFORM_IDS, PLATFORM_CATEGORIES
    categories.ts                   CATEGORY list + display names
    routes.ts                       ROUTES map
  
  config/
    site.ts                         APP_NAME, tagline, metadata
  
  styles/
    tokens.css                      Full dark + light token set
    animations.css                  Keyframes: shimmer, caret, fade, slide-up
    typography.css                  Display / text / mono scale utility classes
```

---

## Phase 0 — Design System Foundation (COMPLETE)
*Status: Done. Foundation cleanup and token scaffold created.*

- [x] Repository cleaned (template noise removed)
- [x] `src/` architecture created
- [x] `src/styles/tokens.css` — base token set (dark mode)
- [x] `tsconfig.json` path alias `@/*` -> `src/*`
- [x] ESLint + build passing
- [x] Design system contract documented in `docs/design/design-system-contract.md`
- [x] Cursor rules created (`.cursor/rules/00-06`)
- [x] `AGENTS.md` operating manual created

---

## Phase 1 — Design System Build-Out

### 1.1 Expanded Token System
*File: `src/styles/tokens.css`*

- [ ] Full dark theme token set (bg layers, glass variants, text layers, borders, shadows, accent family, semantic states)
- [ ] Full light theme token set on `[data-theme="light"]`
- [ ] Shadow tokens (card, float, glow, accent-glow)
- [ ] Background gradient tokens (voidDark, voidLight, rampAccent, rampSave)
- [ ] Glass blur level scale tokens

### 1.2 Typography and Animation Foundations
*Files: `src/styles/typography.css`, `src/styles/animations.css`*

- [ ] Type scale utility classes (display-xl through caption)
- [ ] Mono / tabular-nums utility class
- [ ] Keyframe: `shimmer` (loading state sweep)
- [ ] Keyframe: `caret-blink` (search cursor)
- [ ] Keyframe: `fade-in`, `slide-up` (entrance)
- [ ] Keyframe: `accent-glow-pulse`
- [ ] `prefers-reduced-motion` guard wrapper

### 1.3 Glass Surface Primitive
*File: `src/components/ui/Glass.tsx`*

- [ ] `Glass` component: blur + tint + inner radial sheen + specular rim + hairline border
- [ ] Props: `mode`, `strong`, `radius`, `floating`, `padding`, `className`
- [ ] All decoration layers via `position:absolute` under content `zIndex` stack
- [ ] Light mode glass variant

### 1.4 App Shell and Navigation
*Files: `src/components/ui/AppShell.tsx`, `src/components/layout/DesktopNav.tsx`, `src/components/layout/MobileNav.tsx`*

- [ ] `AppShell`: theme-aware root wrapper, bg gradient, min-height full
- [ ] `DesktopNav`: 232px fixed sidebar, logo, nav items, user footer, command bar slot
- [ ] `MobileNav`: floating bottom tab bar (glass capsule), 4 tabs: Search · Watch · Trips · You
- [ ] `DesktopShell`: two-column grid (nav + content)
- [ ] `MobileShell`: stack (content + bottom nav) with safe area padding

---

## Phase 2 — Core UI Primitive Components

### 2.1 SearchBar
*File: `src/components/ui/SearchBar.tsx`*

- [ ] Pill geometry, glass body, blur + tint + specular rim
- [ ] Props: `value`, `onChange`, `placeholder`, `size` (sm/md/lg), `focused`
- [ ] Animated cursor caret when `focused`
- [ ] Search icon left, mic button + filter button right
- [ ] Focus ring using `accentSoft` token on focus state
- [ ] Keyboard accessible (label, role)

### 2.2 Platform Components
*Files: `src/components/ui/PlatformLogo.tsx`, `src/components/ui/PlatformPill.tsx`*

- [ ] `PlatformLogo`: coloured gradient circle/rounded-square with letter glyph
- [ ] `PlatformPill`: logo + name + optional tagline, glass bg
- [ ] Active/inactive state via token colors
- [ ] Platform data driven from `src/lib/data/platforms.ts`

### 2.3 Price and Badge Components
*Files: `src/components/ui/PriceBadge.tsx`, `src/components/ui/SaveBadge.tsx`, `src/components/ui/ETABadge.tsx`, `src/components/ui/TrendChip.tsx`*

- [ ] `PriceBadge`: ₹ prefix (dimmed), mono tabular numerals, strike-through variant
- [ ] `SaveBadge`: ↓ arrow, "Save ₹X · Y%", saveSoft bg, save text color
- [ ] `ETABadge`: clock icon, ETA text, fast/slow tone variants
- [ ] `TrendChip`: directional arrow, ₹ amount, up/down color semantics

### 2.4 Result Card
*File: `src/components/ui/ResultCard.tsx`*

- [ ] Glass body + inner sheen + specular rim + hairline border
- [ ] `best` variant: accent border + inset glow + "Cheapest" ribbon
- [ ] `compact` prop for dense list view
- [ ] Platform logo + name + ETA inline
- [ ] Price area: MRP struck, current price, SaveBadge
- [ ] Offer code display (if present)

### 2.5 Verdict and Analytics Components
*Files: `src/components/ui/VerdictChip.tsx`, `src/components/ui/SparkChart.tsx`, `src/components/ui/LineChart.tsx`*

- [ ] `VerdictChip`: buy/wait verdict, confidence %, colored icon dot
- [ ] `SparkChart`: inline SVG sparkline, accent fill gradient, end dot
- [ ] `LineChart`: full recharts line chart, gradient fill, grid lines, month labels, tooltip

### 2.6 Loading and Skeleton States
*File: `src/components/ui/SkeletonCard.tsx`*

- [ ] `SkeletonCard`: shimmer animation, matches ResultCard layout
- [ ] `SkeletonText`: shimmer text line
- [ ] `SkeletonChart`: shimmer chart placeholder

### 2.7 Bottom Sheet and Compare Grid
*Files: `src/components/ui/BottomSheet.tsx`, `src/components/ui/CompareGrid.tsx`*

- [ ] `BottomSheet`: slide-up modal on mobile, header, dismiss swipe area, backdrop
- [ ] `CompareGrid`: desktop table, sticky header row, platform + price + save + ETA + action columns
- [ ] Best row highlighted with accent left border + accentSoft bg
- [ ] Filter chip row for desktop

### 2.8 Filter Chip
*File: `src/components/ui/FilterChip.tsx`*

- [ ] Toggle on/off states
- [ ] Accent active state vs glass default
- [ ] Count badge slot

---

## Phase 3 — Data Layer

### 3.1 Types
*Files: `src/types/*.ts`*

- [ ] `Product`: id, name, category, brand, image, slug
- [ ] `Platform`: id, name, category (grocery/ecom/cab/fashion), gradient, glyph, tagline
- [ ] `PlatformPrice`: productId, platformId, price, mrp, eta, offers, availability, updatedAt
- [ ] `CabFare`: platformId, tier, price, eta, surge, savings
- [ ] `PriceHistoryPoint`: date, price, platformId
- [ ] `SearchResult`: product + topPrice + platforms[]
- [ ] `Alert`: id, productId, targetPrice, platformId, isActive, triggeredAt
- [ ] `WatchlistItem`: productId, addedAt, currentBestPrice, lastCheckPrice

### 3.2 Mock Data
*Files: `src/lib/data/*.ts`*

- [ ] `platforms.ts`: 10 platforms (zip, bolt, aisle, basket, kart, marq, vogue, drift, hop, loop) with full metadata
- [ ] `mock-products.ts`: 20 products across 3 categories (grocery, electronics, fashion)
- [ ] `mock-prices.ts`: platform × product price table
- [ ] `mock-history.ts`: 30-day price history per product
- [ ] `mock-cabs.ts`: cab fare samples for sample routes

### 3.3 Formatting Utilities
*File: `src/lib/format.ts`*

- [ ] `formatINR(n)`: ₹1,24,999 format with Indian number grouping
- [ ] `formatSaving(orig, curr)`: "Save ₹X (Y%)"
- [ ] `formatETA(minutes)`: "8 min", "today", "2 days"
- [ ] `formatSurge(multiplier)`: "1.4×"
- [ ] `formatRelativeTime(date)`: "12s ago", "3 min ago"

### 3.4 Services
*Files: `src/services/*.ts`*

- [ ] `search-service.ts`: `searchProducts(query)` → `SearchResult[]` (mock-backed)
- [ ] `price-service.ts`: `getPlatformPrices(productId)` → `PlatformPrice[]`
- [ ] `cab-service.ts`: `getCabFares(from, to)` → `CabFare[]`
- [ ] `alert-service.ts`: CRUD for alerts (localStorage-backed)

### 3.5 API Route Handlers
*Files: `app/api/**.ts`*

- [ ] `GET /api/search?q=` → SearchResult[]
- [ ] `GET /api/prices/[id]` → PlatformPrice[]
- [ ] `POST /api/cabs` body: `{ from, to }` → CabFare[]
- [ ] `GET/POST/DELETE /api/alerts`

---

## Phase 4 — Search Experience

### 4.1 Search Home Page
*Files: `src/features/home/*`*

- [ ] Full-viewport dark hero, void gradient background (green radial blobs)
- [ ] Centered large tagline: "Find anything, cheaper." (Display XL)
- [ ] Large glass SearchBar (size="lg") in center
- [ ] Category chips below bar (Grocery · Electronics · Fashion · Cabs)
- [ ] Trending searches chips section
- [ ] Recent searches (localStorage-backed)
- [ ] Platform logo strip ("Available on 12+ platforms")
- [ ] Responsive: mobile hero is tall and thumb-centric, desktop is wider centered

### 4.2 Search Suggestions (Autocomplete)
*Files: `src/features/home/SearchSuggestions.tsx`*

- [ ] Dropdown below search bar (glass surface)
- [ ] Fuzzy-matched product suggestions from mock data
- [ ] Recent searches shown when query is empty
- [ ] Category-grouped results
- [ ] Keyboard navigable (arrow keys + Enter)
- [ ] Escape closes dropdown

### 4.3 Search Results Page
*Files: `src/features/search/*`*

- [ ] Sticky search bar at top with current query
- [ ] "Live · 12s ago" freshness indicator with green dot
- [ ] Platform filter chips (horizontal scroll on mobile, sidebar on desktop)
- [ ] Sort options: Cheapest · Fastest · Best value
- [ ] Delivery time filter chips (< 10 min · < 30 min · Today · 2 days+)
- [ ] Result cards list, sorted cheapest first
- [ ] Best result highlighted at top
- [ ] Product summary card (image + title + verdict + sparkline)
- [ ] Loading skeletons while fetching
- [ ] Empty state for no results

---

## Phase 5 — Product Detail Page

### 5.1 Product Hero
*Files: `src/features/product/ProductHero.tsx`*

- [ ] Product image (large, rounded glass surface)
- [ ] Thumbnail strip below image
- [ ] Brand + category mono eyebrow
- [ ] Product title (Display L)
- [ ] Cheapest price + platform inline
- [ ] VerdictChip (buy/wait) + "Set price alert" button
- [ ] Variant selectors (storage, color) where applicable

### 5.2 Price History Section
*Files: `src/features/product/PriceHistorySection.tsx`*

- [ ] Glass card container
- [ ] Range selector tabs: 30d · 90d · 6m · 1y
- [ ] Full LineChart with recharts
- [ ] 30d high / 30d low annotations
- [ ] Prediction text below chart ("Pricely predicts ₹X within 14 days")
- [ ] VerdictChip + confidence signal

### 5.3 Platform Comparison
*Files: `src/features/product/ProductCompareGrid.tsx`*

- [ ] Desktop: CompareGrid table (Platform · Price · MRP · Save · ETA · Action)
- [ ] Mobile: ResultCard stack
- [ ] Best row: accent left border + accentSoft bg + "Cheapest" ribbon
- [ ] Buy CTA per row (accent for best, glass for others)

### 5.4 Price Alert Flow
*Files: `src/features/product/SetAlertButton.tsx`, `src/features/alerts/CreateAlertSheet.tsx`*

- [ ] Trigger button on product page
- [ ] Bottom sheet (mobile) / modal (desktop)
- [ ] Target price input (slider + manual input)
- [ ] Platform-specific or any-platform toggle
- [ ] Confirm creates alert in localStorage
- [ ] Toast confirmation

---

## Phase 6 — Cab Fare Comparison

### 6.1 Route Input
*Files: `src/features/cabs/RouteInput.tsx`*

- [ ] Glass card with From/To inputs and vertical connector line
- [ ] Swap button
- [ ] Submit triggers fare fetch
- [ ] Popular routes shortcuts

### 6.2 Fare Results
*Files: `src/features/cabs/CabResultsList.tsx`*

- [ ] Sorted cab result rows (CompareGrid on desktop, ResultCard on mobile)
- [ ] Columns: App · Tier · Fare · Save · ETA · Surge · Action
- [ ] Surge displayed in warning color if > 1.2×
- [ ] Best row highlighted
- [ ] Mock route map (placeholder SVG with dotted path)

### 6.3 Surge Advisor
*Files: `src/features/cabs/SurgeAdvisor.tsx`*

- [ ] Warning card: "Wait N min, save ₹X"
- [ ] Surge drop prediction text
- [ ] Warning token bg + amber border

### 6.4 Trip Stats Row
- [ ] Distance · ETA · Surge factor in a 3-col glass card

---

## Phase 7 — Watchlist and Alerts

### 7.1 Watchlist
*Files: `src/features/watchlist/*`*

- [ ] Grid of WatchlistCards
- [ ] Each card: product image, title, current best price, price delta (↑↓), platform
- [ ] Empty state: "You haven't saved anything yet."
- [ ] Add item → navigate to search
- [ ] Remove item (swipe on mobile, delete icon on desktop)

### 7.2 Alerts Page
*Files: `src/features/alerts/*`*

- [ ] List of active alerts
- [ ] AlertCard: product + target price + current price + status (active/triggered)
- [ ] Triggered alerts shown in accent green
- [ ] Create new alert button

---

## Phase 8 — Account Pages

### 8.1 Profile
*Files: `src/features/account/ProfilePage.tsx`*

- [ ] User avatar (initials fallback)
- [ ] Savings summary: "You've saved ₹4,210 ↓"
- [ ] City indicator
- [ ] Stats row: Searches · Alerts · Watchlist

### 8.2 Settings
*Files: `src/features/account/SettingsPage.tsx`*

- [ ] Theme toggle (dark / light)
- [ ] City preference
- [ ] Notification preferences
- [ ] Platform preferences (enable/disable platforms)

---

## Phase 9 — Mobile Refinements

- [ ] Bottom sheet for filters (mobile)
- [ ] Sticky floating CTA on product and results pages
- [ ] Swipe-to-dismiss on bottom sheets
- [ ] Touch-friendly target sizes (min 44×44)
- [ ] Safe area insets handled globally
- [ ] Responsive grid switches (1-col mobile → 2-col tablet → sidebar+content desktop)

---

## Phase 10 — Polish and Performance

### 10.1 Loading and Error States
- [ ] Shimmer skeletons for all data-driven views
- [ ] Inline error messages with retry affordance
- [ ] Empty states with helpful actions

### 10.2 Animation
- [ ] Page transitions (fade-in on route change)
- [ ] Result card entrance (staggered slide-up)
- [ ] Search bar focus expansion
- [ ] Bottom sheet slide-up with spring
- [ ] Reduced-motion fallback on all animations

### 10.3 Performance
- [ ] Static prerender for home page
- [ ] Recharts lazy-loaded (dynamic import)
- [ ] Image optimization via next/image
- [ ] Font preloading

### 10.4 PWA and Metadata
- [ ] `app/manifest.ts` for PWA manifest
- [ ] Favicon and apple-touch-icon
- [ ] OG metadata for product pages
- [ ] App-like feel on mobile (standalone mode)

---

## Design Token Quick Reference

### Dark Theme (hero)
- Void: `#07080B` / Canvas: `#0E1015` / Raised: `#171A22` / Overlay: `#21242E`
- Text: `#F6F6F8` / Dim: `rgba(246,246,248,0.66)` / Faint: `rgba(246,246,248,0.42)`
- Glass: `rgba(28,30,38,0.32)` / Strong: `rgba(34,36,46,0.55)`
- Accent: `#1DB954` / AccentSoft: `rgba(29,185,84,0.12)`
- Save: `#5BE3A0` / Warn: `#FFC062` / Danger: `#FF6680`

### Light Theme
- Void: `#F2EEE8` / Canvas: `#F9F6F1` / Raised: `#FFFFFF`
- Glass: `rgba(255,255,255,0.42)` / Strong: `rgba(255,255,255,0.65)`

### Gradient Ramps
- `rampAccent`: `linear-gradient(135deg, #1ED760 0%, #1DB954 50%, #0F8A3F 100%)`
- `voidDark`: radial green blobs over `#191414` base

### Radius Scale
`xs:8px · sm:12px · md:16px · lg:22px · xl:30px · pill:9999px`

### Blur Scale
`frosted:8px · glass:24px · strong:40px`

---

## Platform Data Reference

| ID | Name | Category | Tagline |
|---|---|---|---|
| zip | Zip | grocery | 8-min |
| bolt | Bolt | grocery | 10-min |
| aisle | Aisle | grocery | 15-min |
| basket | Basket | grocery | today |
| kart | Kart | ecom | 2 days |
| marq | Marq | ecom | tomorrow |
| vogue | Vogue.in | fashion | 3 days |
| drift | Drift | cab | 4 min |
| hop | Hop | cab | 6 min |
| loop | Loop | cab | 8 min |

---

## Component Dependency Map

```
AppShell
  DesktopNav / MobileNav (TabBar)
  
SearchHero
  SearchBar → FilterChip
  
SearchResultsPage
  SearchPageHeader → SearchBar
  PlatformFilterRow → PlatformPill
  SearchResultsList → ResultCard (best/default) → PlatformLogo, PriceBadge, SaveBadge, ETABadge
  ProductSummaryCard → VerdictChip, SparkChart
  
ProductDetailPage
  ProductHero → PriceBadge, SaveBadge, VerdictChip
  PriceHistorySection → LineChart
  ProductCompareGrid → CompareGrid → PlatformLogo, PriceBadge, SaveBadge, ETABadge
  
CabsPage
  RouteInput
  CabResultsList → CompareGrid → PlatformLogo, PriceBadge, SaveBadge, ETABadge
  SurgeAdvisor
  
WatchlistPage → WatchlistCard → PriceBadge, TrendChip
AlertsPage → AlertCard → PriceBadge
```

---

*See `PROGRESS.md` for current completion status.*
