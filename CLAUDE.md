# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# ILMA OGA website — conventions

This is the marketing website + Sanity Studio for the ILMA International Old Girls' Association, built on Next.js 16 (App Router, Cache Components) and Sanity.

> **Note:** the previous version of this file pointed to `plans/plan.md` and `Docs/figma/` for the full build plan and Figma call budget. Neither path exists in the working tree right now — if you're picking up a phased build plan, confirm where it actually lives (it may not have been committed yet) before relying on conventions like "Figma calls are budget-logged" or "each build phase ends in a commit" below.

## Commands

```bash
pnpm dev              # next dev (Turbopack, Cache Components enabled)
pnpm build            # production build
pnpm start            # serve the production build
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm format           # prettier --write .
pnpm format:check     # prettier --check .

pnpm typegen          # sanity schemas extract --enforce-required-fields && sanity typegen generate
                       # run after ANY change to src/sanity/schemaTypes/** or src/sanity/queries.ts —
                       # regenerates schema.json and sanity.types.ts (both committed)

pnpm seed                       # tsx --env-file=.env.local scripts/seed.ts (one-time content seed)
pnpm order-chapters              # tsx --env-file=.env.local scripts/order-chapters.ts
pnpm order-existing-content      # tsx --env-file=.env.local scripts/order-existing-content.ts
```

There is no test runner configured in this repo. `pnpm lint` and `pnpm typecheck` are the correctness gates; run both before considering a change done.

The Studio is served in-app at `/studio` (see `sanity.config.ts`, mounted via `src/app/studio/[[...tool]]/`), not as a separate process — `pnpm dev` serves both the site and the Studio.

## Architecture

**Two content systems live in one Next.js app:** the public site under `src/app/(site)/`, and the embedded Sanity Studio under `src/app/studio/`. Schema definitions live in `src/sanity/schemaTypes/` (documents, objects, singletons); `pnpm typegen` extracts them to `schema.json` and generates `sanity.types.ts`, which `src/sanity/lib/content.ts` imports for fully-typed query results.

**Data flow, top to bottom:**

- `src/sanity/queries.ts` — every GROQ query, written with `defineQuery` (required so `sanity typegen generate` can see it and produce typed results). This is the _only_ place GROQ strings are allowed to live.
- `src/sanity/lib/content.ts` — one fetcher function per query (`getHomePage`, `getOngoingProjects`, etc.), each going through a shared `cachedFetch` helper. Components and pages call these, never `queries.ts` or `sanityFetch` directly.
- `src/sanity/lib/live.ts` — wraps `next-sanity/live`'s `defineLive` to produce `sanityFetch`/`SanityLive`. `<SanityLive />` is mounted once in `src/app/layout.tsx`.
- `src/sanity/lib/client.ts` — the underlying Sanity client (`useCdn: true`).

**Caching model:** this repo has `cacheComponents: true` in `next.config.ts` — Next 16's Cache Components model, not the older `fetch`-tags-only approach. `cachedFetch` in `content.ts` is the app's _single_ `'use cache'` boundary; individual fetchers do not add their own `'use cache'` (see the comment above `cachedFetch` — layering `'use cache'` around multiple call sites that can dedupe the same in-flight `sanityFetch` request trips Cache Components' "shared state from the outer render scope" check). `cacheLife('days')` is opted into per-query via the fetcher's `profile` argument (used for events queries). Read `node_modules/next/dist/docs/` before changing this pattern — training data on Next.js caching predates Cache Components.

**Two route groups under `src/app/`:**

- `(site)/` — the public site, wrapped by `src/app/(site)/layout.tsx` (Header/Footer chrome around `<main>`). Each page fetches its own Sanity data via `content.ts` fetchers and most have a matching `loading.tsx`.
- `studio/[[...tool]]/` — the Sanity Studio, mounted via a client component (`StudioClient.tsx`).

**Singletons vs. collections:** `homePage`, `aboutPage`, `projectsPage`, `membershipPage`, `loyaltyPage`, `siteSettings` are singletons (one document each — see `singletonTypes` in `src/sanity/schemaTypes/index.ts`, enforced in `sanity.config.ts` by stripping delete/duplicate actions and hiding them from "create new"). `project`, `event`, `chapter`, `post` are ordered collections using `@sanity/orderable-document-list` (`orderRank`), surfaced in the custom desk `structure.ts` grouped by status (e.g. projects split into Ongoing/Completed, events into Upcoming/Past).

**Component layout under `src/components/`:**

- `layout/` — Header, Footer, nav (includes the one legitimately-client mobile nav)
- `motion/` — animation wrapper components (`Enter`, `Reveal`, `*Stagger`) built on `motion`; these are the other sanctioned `'use client'` boundary besides mobile nav and Visual Editing
- `ui/` — shared primitives: `Button`, `Container`, `SanityImage` (via `@sanity/image-url`), `PortableTextBody` (via `@portabletext/react`), `PagedGrid`, `Skeleton`, etc.
- `home/` — page-specific sections for the homepage

**Path alias:** `@/*` → `./src/*` (see `tsconfig.json`).

**Env vars:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` are the only public ones. `SANITY_API_READ_TOKEN` (draft-mode reads), `SANITY_REVALIDATE_SECRET` (webhook signature check), and `SANITY_API_WRITE_TOKEN` (local-only, for `scripts/seed.ts`) are server-only — read `.env.example` for the up-to-date list and keep it in sync with any new var.

## Conventions

- **Server Components by default.** Client components are limited to the mobile nav, motion wrappers (`src/components/motion/`), and Visual Editing — nothing else gets `'use client'` unless it genuinely needs interactivity or browser APIs.
- **GROQ lives only in `src/sanity/queries.ts`**, written with `defineQuery`. No inline GROQ strings in components or route files.
- **No hardcoded copy in Sanity-driven sections.** If content is in the CMS schema, the component reads it from Sanity — never a fallback string baked into the component. Header/footer and (per the original build plan) the Active Volunteer and Sports pages are the intentional exceptions.
- **Every CMS-driven section needs an empty state.** No upcoming events / no ongoing projects must render a short message or hide the section — never a broken-looking gap.
- **Version drift is real, not hypothetical.** Next.js is pinned to 16.3.x with Cache Components as the caching model, and TypeScript is pinned to 6.0.x rather than the `latest` 7.x tag. Before implementing a data-fetching or caching pattern, check `node_modules/next/dist/docs/` and the installed `next-sanity` package (`next-sanity/live` for `defineLive`/`sanityFetch`, `next-sanity/webhook` for the draft-mode-aware webhook helper, `next-sanity/visual-editing`) rather than relying on training-data patterns.
- **Secrets stay server-only** — see env vars above. `.env.local` is gitignored; `.env.example` is the committed template.
- Formatting is Prettier-enforced (`singleQuote`, no semicolons, `prettier-plugin-tailwindcss` for class sorting) — run `pnpm format` rather than hand-formatting.
