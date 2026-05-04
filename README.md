# Pricely

Real-time price comparison across Indian commerce platforms.

Pricely helps users search for products or trips and instantly compare live prices, ETAs, and savings across multiple apps. The goal is quick, confident buy-now vs wait decisions, not coupon hunting.

## Product Snapshot

- **Category:** premium real-time decision engine
- **Core promise:** find the cheapest option fast, with clear savings context
- **Primary markets:** India-first grocery, ecommerce, and cab comparisons
- **Design direction:** Apple polish, linear gradients, liquid glass, fintech clarity

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- ESLint 9

## Project Structure

- `app/` route shell and file-based routing entrypoints
- `src/components/` shared reusable UI
- `src/features/` feature-scoped logic and UI
- `src/services/` API/data access layer
- `src/lib/` shared utilities
- `src/types/` shared types
- `src/constants/` shared constants
- `src/config/` app configuration
- `src/styles/` token and style foundations
- `docs/design/` archived design artifacts and design-system contract

## Supported Comparison Domains

- Grocery delivery (for example: Zepto, Blinkit, Instamart, Swiggy Instamart)
- Ecommerce and fashion (for example: Amazon, Flipkart, Myntra)
- Cab fares (for example: Uber, Ola, Rapido)

## Core User Experience

- Search for any product or route
- See cross-platform results sorted by cheapest first
- Compare price, ETA, and savings in one view
- Get a recommendation signal (buy now / wait)
- Set watchlist and alert workflows as the product evolves

## Current Implementation Status

- Phase 0 foundation is complete: repo baseline, strict TypeScript, architecture scaffolding, and design-system contract
- Feature implementation is tracked in `docs/PRODUCT_PLAN.md`
- Execution progress is tracked in `PROGRESS.md`

## Design Governance

- Enforced contract: `docs/design/design-system-contract.md`
- Cursor rules: `.cursor/rules/*.mdc`
- Agent operating guide: `AGENTS.md`

## Commands

- `npm run dev` - start local development server
- `npm run lint` - run lint checks
- `npx tsc --noEmit` - run type checks
- `npm run build` - build production bundle

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Product Roadmap

- **Phase 1-2:** design system and UI primitives
- **Phase 3:** typed data layer and mock-backed services
- **Phase 4-8:** search, product detail, cabs, watchlist, alerts, account
- **Phase 9-10:** mobile polish, performance, and PWA readiness

For full breakdown, see `docs/PRODUCT_PLAN.md`.
