# Pricely

Production-ready foundation for a new Next.js application.

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

## Design Governance

- Enforced contract: `docs/design/design-system-contract.md`
- Cursor rules: `.cursor/rules/*.mdc`
- Agent operating guide: `AGENTS.md`

## Commands

- `npm run dev` - start local development server
- `npm run lint` - run lint checks
- `npx tsc --noEmit` - run type checks
- `npm run build` - build production bundle
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
