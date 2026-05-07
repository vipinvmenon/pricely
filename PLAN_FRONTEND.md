# PLAN_FRONTEND.md

Frontend specification for the Pricely full rewrite.

This file describes the target route structure, UI composition rules, data-loading expectations, and animation/accessibility contracts.

## Route architecture

All end-user pages live under the authenticated dashboard route group:

```text
app/
  (dashboard)/
    layout.tsx
    page.tsx
    search/[query]/page.tsx
    product/[id]/page.tsx
    cabs/page.tsx
    watchlist/page.tsx
```

### Dashboard layout (`app/(dashboard)/layout.tsx`)
- Renders the permanent chrome:
  - `DesktopNav` on `>= 1024px`
  - `TabBar` on mobile (fixed bottom)
- Provides correct padding/gutters for content so the glass cards never collide with nav/tab overlays.

## Data loading contract (client)

Client views use SWR for fetching and polling:
- `refreshInterval: 300_000` (5 minutes)
- Always surface explicit UI states:
  - loading skeletons
  - empty state
  - error state (cheap message + retry affordance)

## Endpoint wiring (by page)

All pages are wired to the API contracts introduced in the backend plan:

- Home (`app/(dashboard)/page.tsx`)
  - `GET /api/search/trending?city=`
  - `GET /api/watchlist` (empty state handled)

- Search results (`app/(dashboard)/search/[query]/page.tsx`)
  - `GET /api/prices/grocery?q=&city=` via SWR (initial grocery results)
  - additional categories depend on platform filters; they map to the corresponding `api/prices/*` routes

- Product detail (`app/(dashboard)/product/[id]/page.tsx`)
  - `GET /api/history/[productId]?city=&days=90`
  - product summary + platform comparison use the category pricing endpoints

- Cabs (`app/(dashboard)/cabs/page.tsx`)
  - `GET /api/prices/cabs?from_lat=&from_lng=&to_lat=&to_lng=&city=`

- Watchlist (`app/(dashboard)/watchlist/page.tsx`)
  - `GET /api/watchlist`

## UI primitives used across pages

Pages are composed from a shared primitives library (must be built before page work):
- `GlassCard` (3-level variant: thin/default/strong)
- `SearchBar` (pill form, explicit focus states)
- `ResultCard` (best/normal variants)
- `VerdictChip` (buy/wait)
- `SparkChart` (canvas)
- badges (`SaveBadge`, `ETABadge`, offer badges)
- layout chrome (`DesktopNav`, `TabBar`)

## Animations

Only subtle, purpose-driven animations:
- List reordering (Framer Motion `layout` animations)
- Entrance transitions (fade/slide)
- All animations must honor `prefers-reduced-motion`.

## Accessibility minimums

- Keyboard-reachable controls
- Visible focus ring for every interactive component
- Minimum touch target size: `44x44`
- ARIA roles/labels for tabs, toggles, and dialogs

