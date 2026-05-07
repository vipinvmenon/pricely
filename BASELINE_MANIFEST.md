# Baseline Manifest — Pre-Rewrite State

Captured before the full rewrite begins. Describes what currently exists and what happens to each file.

---

## Preserve Untouched

These files must never be modified during the rewrite:

| File | Reason |
|---|---|
| `package.json` | Dependency and scripts baseline |
| `package-lock.json` | Lockfile |
| `tsconfig.json` | TypeScript config |
| `next.config.ts` | Next.js config |
| `postcss.config.mjs` | Tailwind/PostCSS pipeline |
| `eslint.config.mjs` | Lint baseline |
| `.gitignore` | Repository hygiene |
| `next-env.d.ts` | Next.js TS declarations |
| `.env*` | Environment variable files |
| `docs/design/design-system-contract.md` | Enforced engineering contract |
| `docs/design/pricely-design-system.html` | Pixel-level visual reference |
| `docs/design/ios-frame.jsx` | Mobile frame reference |
| `docs/PRODUCT_PLAN.md` | Product strategy reference |
| `.cursor/rules/*.mdc` | Agent rules (already rewritten) |
| `AGENTS.md` | Agent operating manual |
| `REBUILD_PLAN.md` | Rewrite architecture plan |
| `PROGRESS.md` | Phase-by-phase progress tracker |
| `BASELINE_MANIFEST.md` | This file |

---

## Delete During Phase 0 Audit

> Confirm each file's content before deleting. Produce replacement map first.

### Route layer (`app/`)
| File | Replacement |
|---|---|
| `app/layout.tsx` | New root layout (fonts, ThemeProvider) |
| `app/page.tsx` | `app/(dashboard)/page.tsx` |
| `app/globals.css` | New globals importing `tokens.css` |
| `app/alerts/page.tsx` | Moved into alerts feature (Phase 5 or later) |
| `app/cabs/page.tsx` | `app/(dashboard)/cabs/page.tsx` |
| `app/item/[id]/page.tsx` | `app/(dashboard)/product/[id]/page.tsx` |
| `app/profile/page.tsx` | Deferred to Phase 9 (auth-gated) |
| `app/search/page.tsx` | `app/(dashboard)/search/[query]/page.tsx` |
| `app/settings/page.tsx` | Deferred |
| `app/watchlist/page.tsx` | `app/(dashboard)/watchlist/page.tsx` |
| `app/api/alerts/route.ts` | New Zod-validated route (Phase 6) |
| `app/api/cabs/route.ts` | `app/api/prices/cabs/route.ts` (Phase 6) |
| `app/api/search/route.ts` | `app/api/search/trending/route.ts` (Phase 6) |
| `app/api/prices/[id]/route.ts` | `app/api/history/[productId]/route.ts` (Phase 6) |

### Source layer (`src/`)
All files under the following directories are replaced wholesale:
- `src/components/` → rebuilt in Phase 3
- `src/features/` → dissolved; logic moves to `src/components/features/` and `src/lib/`
- `src/styles/` → replaced by new `tokens.css` in Phase 2
- `src/services/` → replaced by `src/lib/cache/`, `src/lib/db/`, scraper service pattern
- `src/hooks/` → replaced by SWR hooks inline in client components
- `src/types/` → replaced by single `src/types/index.ts` barrel
- `src/constants/` → merged into `src/lib/utils/platforms.ts`
- `src/config/` → merged into root layout and environment variable helpers
- `src/lib/data/` (mock data files) → replaced by typed mock responses in API routes

---

## Current App State (Before Rewrite)

| Area | Status |
|---|---|
| Visual system | Partial — tokens exist but GlassCard not universal, wrong fonts (Geist) |
| Routes | Present but wrong URL shape, no dashboard route group |
| API routes | Stub-level, no Zod validation, no Redis, no real scraping |
| Database | No Supabase schema deployed |
| Cache | No Redis integration |
| Auth | No Supabase Auth |
| Scrapers | No scraper implementations |
| Verdict engine | Not implemented |
| Alerts/cron | Stub only |

---

## New Directories Created in Phase 2+

```
src/
  app/
    (dashboard)/
  components/
    ui/
    layout/
    features/
  lib/
    scrapers/
    cache/
    db/
    ai/
    geo/
    utils/
  styles/
  types/
```
