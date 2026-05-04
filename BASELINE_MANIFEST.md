# Baseline Audit Manifest

This manifest captures the repository state before cleanup and architecture setup.

## Keep

- `app/layout.tsx` - required App Router root layout, will be updated.
- `app/globals.css` - global styles entrypoint, will be redesigned to match design-system rules.
- `package.json` - Next.js runtime scripts and dependencies baseline.
- `package-lock.json` - lockfile baseline.
- `tsconfig.json` - TypeScript baseline (to be tightened for `src` architecture).
- `eslint.config.mjs` - lint baseline.
- `postcss.config.mjs` - Tailwind/PostCSS baseline.
- `.gitignore` - repository hygiene baseline.
- `next-env.d.ts` - required Next.js TypeScript declaration file.
- `CLAUDE.md` - existing workspace pointer.

## Move (Archive)

- `design/` -> `docs/design/` (reference-only design artifacts, non-production code).

## Delete

- `app/page.tsx` - create-next-app placeholder landing route.
- `README.md` - template boilerplate docs.
- `next.config.ts` - empty/no-op config.
- `public/file.svg` - template asset not needed for foundation.
- `public/globe.svg` - template asset not needed for foundation.
- `public/next.svg` - template asset not needed for foundation.
- `public/vercel.svg` - template asset not needed for foundation.
- `public/window.svg` - template asset not needed for foundation.

## Create

- `src/components`
- `src/features`
- `src/hooks`
- `src/lib`
- `src/services`
- `src/types`
- `src/constants`
- `src/styles`
- `src/config`
- `.cursor/rules/00-project-context.mdc`
- `.cursor/rules/01-architecture.mdc`
- `.cursor/rules/02-design-system.mdc`
- `.cursor/rules/03-frontend-ui.mdc`
- `.cursor/rules/04-api-patterns.mdc`
- `.cursor/rules/05-testing.mdc`
- `.cursor/rules/06-agent-behavior.mdc`

## Notes

- Dependencies are already minimal; remove only if proven stale after refactor validation.
- No product features are introduced in this pass.
