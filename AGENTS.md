# AGENTS Operating Manual

This document defines reusable execution workflows for AI agents working in this repository.

## Global Guardrails

- Treat `docs/design/design-system-contract.md` as mandatory UI contract.
- Follow `.cursor/rules/*.mdc` before implementation.
- Keep `app/` routing-focused and `src/` architecture boundaries strict.
- Do not introduce product features when the task is infrastructure/foundation.

## Feature Implementation Workflow

1. Read task scope and map impacted folders (`app`, `src/features`, `src/components`, `src/services`).
2. Check for reusable modules before creating new files.
3. Implement smallest viable change respecting dependency direction.
4. Add/adjust types in `src/types` only when shared.
5. Validate:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
6. Document impact in final summary (what changed and why).

## Debugging Workflow

1. Reproduce issue and isolate layer:
   - route layer (`app`)
   - feature layer (`src/features`)
   - service/util layer (`src/services`, `src/lib`)
2. Confirm failure path with logs or narrow checks.
3. Fix root cause, not symptom.
4. Add regression protection (test or explicit guard condition).
5. Re-run validation gates and report before/after behavior.

## Refactor Workflow

1. Inventory current imports and dependencies.
2. Move code in small steps; keep behavior unchanged.
3. Update aliases/exports to avoid orphan references.
4. Remove dead files immediately after replacement.
5. Validate compilation and lint after each major move.

## Code Review Workflow

1. Prioritize risk:
   - correctness regressions
   - broken boundaries
   - accessibility regressions
   - performance regressions
2. Check for duplicated logic and token violations.
3. Verify naming, file placement, and dependency direction.
4. Ensure changed code has a clear validation path.

## UI Implementation Checklist

- Uses design tokens (spacing, radius, colors, typography).
- Uses approved component patterns (search, cards, badges, CTA hierarchy).
- Supports focus-visible keyboard states.
- Meets touch target minimums where interactive.
- Honors reduced-motion expectations.
- Avoids hardcoded non-token colors.

## Performance Checklist

- Keep route-level components light; avoid unnecessary client components.
- Prevent duplicate network requests in feature trees.
- Avoid oversized dependency additions.
- Prefer memoization only for proven hotspots.
- Ensure loading/error/empty states are explicit and cheap.
