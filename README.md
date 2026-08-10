# Phoenix Astronomical Society — Website

The public website for the [Phoenix Astronomical Society](https://pasaz.org) (PAS), a 501(c)(3) astronomy club founded in 1948. Built as a fast, static, content-editable site so non-technical club officers can update newsletters, press releases, events, and membership info without touching code.

## Tech stack — and why

| Tool | Why this one |
|---|---|
| **[Astro](https://astro.build)** | The site is almost entirely static content (pages, press releases, newsletters, a gallery) with a handful of interactive widgets. Astro ships zero JS by default and only hydrates the components that need it, which keeps a content-heavy site fast without hand-rolling an SSG. Its Content Collections API also gives us schema-validated content (see below) for free. |
| **[Tailwind CSS v4](https://tailwindcss.com)** (via `@tailwindcss/vite`) | Utility-first CSS keeps one-off page styling fast to write and avoids an ever-growing custom stylesheet across 15+ pages built by different contributors over time. v4's Vite plugin removes the old PostCSS config entirely. |
| **[TypeScript](https://www.typescriptlang.org)** (`astro/tsconfigs/strict`) | Strict mode catches null/undefined bugs in content-driven pages before they ship — important when content is edited by non-developers through a CMS and a typo shouldn't be able to crash a page. |
| **[three.js](https://threejs.org)** | Powers the procedurally-generated hero scene (Saturn, Andromeda, starfield). Used sparingly and lazy/idle-loaded behind a CSS fallback so it never blocks first paint or hurts users on low-end devices. |
| **[Sveltia CMS](https://github.com/sveltia/sveltia-cms)** (mounted at `/orion`, config in `public/orion/config.yml`) | A git-backed CMS: officers edit content through a form UI, and every save is a commit to this repo — no separate database, no admin backend to secure or patch. Chosen over Netlify CMS/Decap for active maintenance and a lighter footprint. `publish_mode: simple` (direct commit, no draft/review step) matches the club's small number of low-technical-comfort editors. |
| **[astro-og-canvas](https://github.com/delucis/astro-og-canvas)** | Generates per-page Open Graph share images at build time (`src/pages/og/[...route].ts`) instead of shipping one static logo image for every shared link. |
| **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** | Auto-generates `sitemap.xml` from the routes that exist at build time, so it can't drift out of sync with the actual page list. |
| **[Plausible Analytics](https://plausible.io)** (optional, via `PLAUSIBLE_DOMAIN`) | Cookieless and doesn't collect personal data, so it needs no cookie-consent banner. The site works identically with the env var unset — analytics is opt-in infrastructure, not a dependency. |
| **NASA APOD** (`ApodOfTheDay.astro`, optional `NASA_API_KEY`) | Free public API for the "picture of the day" widget; falls back to NASA's shared `DEMO_KEY` if no key is configured, so local dev needs zero setup. |

**Why static, no server/database:** the site has no user accounts, no server-side business logic, and no data that changes outside of a CMS commit or a scheduled club event. A static build deployed to a CDN removes an entire category of attack surface (no server runtime to patch, no database to leak, no session/auth system to compromise) while being effectively free to host and trivially fast.

## Project structure

```
src/
  components/    Reusable .astro components (NavBar, Footer, Hero, PhotoGrid, ...)
  content/       CMS-managed JSON content (one collection per folder), validated by src/content.config.ts
  layouts/       BaseLayout.astro — shared <head>, nav, footer, SEO/schema.org markup
  lib/           Build-time helpers (OG image config, PDF archive listing)
  pages/         File-based routing — one .astro file per route
  scripts/       Client-side TS, hydrated selectively (search, hero interactivity, etc.)
  styles/        Tailwind entry point + self-hosted font CSS
public/
  orion/         Sveltia CMS admin app + config.yml (mounted at /orion)
docs/            Design/engineering review notes (not part of the shipped site)
```

Content lives as JSON files under `src/content/**`, one file per entry (or one "singleton" file for collections like site settings, membership tiers, and past presidents). `src/content.config.ts` defines a Zod schema per collection — this is deliberate: a bad CMS edit (a malformed date, an empty required field, a non-HTTPS link) fails the **build**, with a message describing what to fix, rather than reaching production as a broken date, a dead link, or an `<img src="">`.

## Getting started

Requires Node.js (project developed on Node 22).

```bash
npm install
npm run dev        # start the dev server
npm run build       # type-check (astro check) + production build
npm run preview     # serve the production build locally
```

Copy `.env.example` to `.env` to opt into optional integrations locally:

```bash
cp .env.example .env
```

Both variables are optional — the site builds and runs correctly with neither set.

## Content editing

Non-developers edit content at `/orion` (Sveltia CMS), authenticated via GitHub OAuth. Every save commits directly to the content JSON files in this repo — there is no separate CMS database. See `public/orion/config.yml` for the full field/collection definitions and inline comments explaining non-obvious choices (e.g. why `media_folder` paths use a leading slash).

## Best practices followed in this codebase

- **Validate at the boundary, not everywhere.** Content schemas in `src/content.config.ts` are the single validation point for CMS input; page components trust that validated shape rather than re-checking it.
- **Fail loudly at build time, not silently at runtime.** Schema errors, missing required fields, and malformed dates break `npm run build` with an actionable message instead of shipping broken output.
- **No dead code / no speculative abstraction.** Comments in the source explain *why* a non-obvious decision was made (e.g. why `officers.photo` is a plain string instead of an `image()`-typed field), not what the code does — the code should already say that.
- **Accessibility is load-bearing, not decorative.** A real skip-to-content link, a documented WCAG-contrast fix in the design tokens (`rgba(255,255,255,0.24)` bumped to `0.34` to hit 1.4.11), `prefers-reduced-motion` handling in the three.js hero, and required `alt` text enforced by the gallery content schema.
- **Progressive enhancement.** The scroll-reveal hidden state is applied via JS at runtime rather than in the stylesheet, so content is never hidden from a visitor whose JS fails to load.
- **Client JS is opt-in per component**, not a single app-wide bundle — Astro only ships the script for a component that's actually on the page and actually needs it.

## Security

This is a static site with no server runtime and no database, which removes most of the usual web attack surface by construction. What's left is handled deliberately:

- **No secrets in the client bundle.** `NASA_API_KEY` and `PLAUSIBLE_DOMAIN` are read via `import.meta.env` at **build time** only, and neither is sensitive (NASA's key is a free, low-privilege rate-limit token; Plausible's "domain" is a public identifier, not a credential). `.env` is git-ignored (`.gitignore`); `.env.example` documents the shape without real values.
- **CMS auth is delegated, not homegrown.** Sveltia CMS at `/orion` authenticates editors via GitHub OAuth through Netlify's proxy — there's no custom login system, password store, or session handling in this repo to get wrong.
- **Content-supplied URLs are protocol-restricted.** Every CMS field that becomes an `href` (external links, video URLs) is validated by `externalUrl` in `src/content.config.ts` against an `https?` allowlist, specifically to block a `javascript:` URL from a CMS text field turning into script execution — the `lecture-videos` page also assigns one of these to `a.href` client-side, which was the original reason for the allowlist.
- **User-controlled paths stay inside `public/`.** `publicPath`/`pdfPath` schemas require a leading `/` and, for PDFs, a `.pdf` extension, keeping CMS-supplied file references scoped to intended static assets rather than arbitrary paths.
- **No real payment processing in this repo.** `join.astro` / `join-paypal-test.ts` implement a simulated PayPal flow for UI testing only — no PayPal SDK, API keys, or real transactions are wired up. Treat this as a placeholder to replace before launch, not a payment integration to harden.
- **No PII collection beyond what officers already handle off-site.** The membership "join" form is a UI mockup (see above); no form on the live site currently submits personal data to a first-party backend, since there is no backend.
- **Third-party script surface is minimal and intentional.** Plausible (analytics) is the only third-party `<script>`, is cookieless, and is entirely opt-in via an unset-by-default env var.
- **Dependency footprint is small and pinned.** `package-lock.json` is committed; run `npm audit` periodically and keep `astro`, `tailwindcss`, and `three` current, since those are the packages most likely to receive security patches.

### Reporting a security issue

If you find a security issue in this site, please report it privately to a PAS officer (see `/leadership` on the live site) rather than opening a public issue.

## Deployment

The site currently builds and deploys via Netlify (see the CMS OAuth notes in `public/orion/config.yml`), which also serves the GitHub OAuth proxy Sveltia CMS uses for editor login. A future move to Cloudflare Pages is anticipated — see the comments in `public/orion/config.yml` for the corresponding auth-worker swap.

## Further reading

- `docs/IMPLEMENTATION-MASTER-PLAN.md` — the phased build plan for the 2026 rebuild.
- `docs/EXPERT-REVIEW-2026.md` — an independent design/engineering review of the site.
