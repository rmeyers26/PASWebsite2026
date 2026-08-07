# PAS Website 2026 — Engineering Refactoring Plan

**Stack:** Astro 7 + Tailwind 4 (Vite plugin) + Three.js 0.170, static output
**Host:** Cloudflare Pages (free tier) + Cloudflare ecosystem for backend services
**Constraint:** Maintained by volunteers with no engineering background — zero ongoing developer dependency after launch
**Source of truth:** This plan supersedes `docs/IMPLEMENTATION-MASTER-PLAN.md` for the engineering layer. Content strategy from `PLAN.md` and `docs/EXPERT-REVIEW-2026.md` remains valid.

> **Correction note:** The original master plan was written against an earlier, less complete version of this codebase. This plan reflects the actual current state. Many items the master plan flagged as "critical" are already implemented (skip link, focus-visible, scroll-margin-top, print fix, font subsetting+preload, Organization JSON-LD, Plausible analytics, Breadcrumbs, BackToTop, FeatureSplit, ClientRouter view transitions).

---

## 1. Current Architecture Audit

### What exists today (verified against codebase)
| Layer | Current state |
|---|---|
| Framework | Astro 7.1 with static output, TypeScript strict mode |
| Styling | Tailwind 4 via `@tailwindcss/vite`, custom `@theme` tokens in `src/styles/global.css` |
| Fonts | Self-hosted latin-only variable fonts via `src/styles/fonts.css` + `<link rel="preload">` in `BaseLayout` (2 woff2 files only) |
| 3D | Three.js 0.170, procedural Saturn/Andromeda/Moon in `SpaceHero.astro`, idle-deferred, IntersectionObserver-paused |
| Content | Hardcoded in `.astro` page components as TypeScript arrays |
| Forms | None — 16 `mailto:` links across 6 files |
| CMS | None |
| CI | None |
| Tests | None |
| Analytics | Plausible (conditional on `PLAUSIBLE_DOMAIN` env var) |
| Structured data | Organization JSON-LD site-wide in `BaseLayout`; Event JSON-LD on `/asig` only |
| OG images | 72px logo on every page |
| Accessibility | Skip link, `:focus-visible`, `scroll-margin-top: 4.5rem`, print fix, reduced-motion tiering — all present |
| Components | `SpaceHero`, `Hero`, `FeatureSplit`, `PhotoGrid`, `Timeline`, `Starfield`, `NavBar`, `Footer`, `Breadcrumbs`, `BackToTop`, `ApodOfTheDay`, `SkyConditions`, `PlaceholderNote` |
| Pages (17) | `/`, `/about`, `/events`, `/join`, `/contact`, `/history`, `/leadership`, `/star-tours`, `/telescope-workshops`, `/sky-conditions`, `/exoplanets`, `/solar-system`, `/learn`, `/gallery`, `/asig`, `/bsig`, `/press-releases`, `/404` |

### What is good (preserve)
- Design token system with documented contrast math
- Reduced-motion tiering (ambient motion preserved, input-driven motion cut)
- `<details>`-based keyboard-operable nav
- View-transition correctness (teardown on `astro:before-swap`, `pagehide`)
- APOD dimension-probe for CLS prevention
- CSS `animation-timeline: view()` parallax band (no JS)
- Procedural textures (zero network requests for Three.js scene)
- Self-hosted latin-only fonts with preload
- Skip-to-content link
- Global `:focus-visible` ring
- Global `scroll-margin-top: 4.5rem`
- Print `@media` fix for `.reveal`
- Organization JSON-LD on every page
- Plausible analytics integration (ready to activate)
- Breadcrumbs component
- BackToTop button with safe-area awareness
- FeatureSplit editorial layout component

### What is broken (fix)
| Issue | Location | Severity |
|---|---|---|
| 4 `PlaceholderNote` instances visible to public | `learn.astro`, `contact.astro`, `press-releases.astro`, `events.astro` | Launch-blocking |
| `/join` funnel dead-ends on "coming in a future phase" | `join.astro` | Launch-blocking |
| No real event dates in HTML — only inside Bookwhen iframe | `events.astro`, `index.astro` | Launch-blocking |
| No address or map on `/about` or `/events` (ASIG page has PVCC address, but general club pages don't) | `/about`, `/events` | Launch-blocking |
| Nav missing 6 existing pages: Learn, Gallery, Press Releases, ASIG, BSIG, Leadership | `NavBar.astro` | High |
| 16 `mailto:` links — primary flows (join, star tours booking, contact) are email-only | `join.astro`, `star-tours.astro`, `contact.astro`, `Footer.astro` | High |
| No Event JSON-LD on `/events` (only on `/asig`) | `events.astro` | High (SEO) |
| No FAQPage JSON-LD on `/learn` (5 career FAQs sitting ready) | `learn.astro` | High (SEO) |
| OG image is 72px logo on every page | `BaseLayout.astro` | High (SEO/social) |
| No CI/CD | Repo root | Medium |
| No tests | Repo root | Medium |
| No lint/format config | Repo root | Medium |
| Content hardcoded — no CMS | All pages | Long-term risk |
| APOD fetch has no timeout/retry | `ApodOfTheDay.astro` | Medium |
| Two render-blocking third-party scripts | `events.astro`, `sky-conditions.astro` | Medium |
| Three.js bundle: ~124 KB gzipped, homepage only | `SpaceHero.astro` | Medium (acceptable, but verify code-splitting) |
| No `astro:env` schema for `NASA_API_KEY` | `.env.example` | Low |

---

## 2. Technology Stack Decisions

### Keep (do not replace)
| Component | Rationale |
|---|---|
| Astro 7 static output | Correct for this traffic profile; zero-JS by default; islands only where needed |
| Tailwind 4 via Vite plugin | Already integrated; no migration needed |
| Three.js 0.170 | The hero is the site's signature differentiator; keep it |
| Cloudflare Pages | Free tier, auto-deploy from GitHub, global CDN, no server management |
| Plausible analytics | Already integrated; activate with env var — no reason to change |

### Add
| Component | Purpose | Rationale |
|---|---|---|
| Cloudflare Pages Functions | Form submissions (Star Tours request, contact, volunteer, newsletter) | Zero backend to run; free tier generous; Turnstile built in |
| Cloudflare Turnstile | Spam protection on forms | Free, privacy-friendly, no Google reCAPTCHA dependency |
| Astro Content Collections | Structured content (events, press releases, gallery, leadership, testimonials) | Replaces hardcoded arrays; type-safe; CMS-ready |
| Decap CMS (or Sveltia CMS) | Git-based visual CMS for volunteers | Zero cost, writes to same GitHub repo, OAuth auth, full audit trail |
| Pagefind | Static site search | Zero backend, indexes built HTML at deploy, WASM-based, zero maintenance |
| Vitest | Unit and integration testing | Native Astro integration, fast, same ecosystem |
| Playwright (full package, not just core) | End-to-end testing | Already in `devDependencies` as `playwright-core`; upgrade to full package |
| GitHub Actions | CI/CD | Runs `astro check`, `astro build`, `vitest`, `playwright test` on every PR |
| ESLint + Prettier | Lint/format | Enforce house style; catch regressions before merge |
| `astro-og-canvas` | Per-page OG image generation | Build-time, no runtime cost; fixes the shared-logo social card problem |
| Cloudflare KV | Dashboard data cache (Phase 3) | Key-value store for Tonight in Arizona dashboard |
| Cloudflare D1 | Gamification/leaderboard data (Phase 5) | Edge SQLite; lightweight; no separate database |
| Cloudflare R2 | Gallery photo storage (Phase 6) | S3-compatible, no egress fees; for member submissions |
| Cloudflare Workers + Cron Triggers | Scheduled rebuild / dashboard regeneration (Phase 3) | Runs 1–2x/day; writes to KV; no server |

### Defer (explicitly out of scope for this plan)
| Component | Rationale |
|---|---|
| React/Next.js/SPA migration | Would trade fast/simple for slower/complex for no benefit |
| Headless CMS with database (Sanity, Contentful) | Git-based CMS is zero-cost and sufficient for this scale |
| Member accounts / observation logs | Needs auth + database; defer until gallery proves engagement |
| Achievement badges / leaderboards | Needs accounts; defer to Phase 5 |
| Light mode | Dark-only is the brand identity; re-theme is a Phase 4/rebrand decision |

---

## 3. Phased Migration Strategy

### Phase 0 — Foundation (Week 1)
**Goal:** Zero placeholder banners. Zero WCAG 2.2 AA failures. CI green on every PR. Nav complete.

**Current status:** Most accessibility fixes are already done. Font loading, skip link, focus-visible, scroll-margin-top, print fix, Organization JSON-LD, Plausible, Breadcrumbs, BackToTop — all present.

**Remaining tasks:**
1. **Set up Cloudflare Pages project** — connect GitHub repo, configure build command (`astro build`), output directory (`dist`), auto-deploy on push to `main`.
2. **Add CI/CD (GitHub Actions)** — `.github/workflows/ci.yml`: `astro check` + `astro build` + `vitest run` on every PR. Blocks merge on failure.
3. **Add lint/format** — ESLint (`@astrojs/eslint-plugin`, `eslint-plugin-tailwindcss`), Prettier. Enforce in CI.
4. **Complete the navigation** — add missing pages to `NavBar.astro` navItems: Learn, Gallery, Press Releases, ASIG, BSIG, Leadership. Ensure mobile menu includes "Home" link.
5. **Remove or fill all 4 `PlaceholderNote` instances:**
   - `learn.astro:300` — replace with content decision (external resources disclaimer + beginner handouts note)
   - `contact.astro:45` — replace with verified email statement
   - `press-releases.astro:363` — replace once PDFs are uploaded to `public/press-releases/<year>/`
   - `events.astro:337` — replace once Star Tours form exists
6. **Add Plausible env var** to Cloudflare Pages build settings (`PLAUSIBLE_DOMAIN=pasaz.org`) so analytics activates in production
7. **Verify Three.js code-splitting** — confirm `three` is only loaded on homepage via build analysis

**Validation:**
- `grep -rc "PlaceholderNote" src/pages/*.astro` → 0
- Nav shows all 14+ pages on desktop and mobile
- Print preview on all pages shows full content
- Tab through `/history` and `/sky-conditions` — no element hidden under sticky header
- CI passes on a test PR
- `npm run build` output confirms `three.js` is not in non-homepage chunks

---

### Phase 1 — Content Migration & Forms (Weeks 2–3)
**Goal:** Content updatable by non-technical volunteers. All primary `mailto:` dead ends replaced with real forms.

**Tasks:**
1. **Set up Astro Content Collections** — `src/content/config.ts` with schemas for:
   - `events` (title, date, time, location, description, image, category, isPublic, speaker?)
   - `press-releases` (title, date, summary, pdfUrl, image)
   - `gallery` (title, image, caption, photographer, date, category)
   - `leadership` (name, role, years, photo, bio)
   - `testimonials` (name, memberSince, quote, photo, observingInterest)
2. **Migrate existing hardcoded arrays** — `leadership.astro` (presidents list), `events.astro` (manual event list), `press-releases.astro` (release array) → Content Collections
3. **Install and configure Decap CMS** — `public/admin/config.yml`, `public/admin/index.html`. Roles: Contributor (draft), Publisher (live). Connect to GitHub repo via OAuth.
4. **Build form primitives** — `.field`, `.field-error`, `.field-label`, `.btn-primary:disabled`, `.btn-primary[aria-busy]`. Inline validation. Success state.
5. **Build Cloudflare Pages Functions:**
   - `POST /api/contact` — general contact form
   - `POST /api/star-tours` — Star Tours request form
   - `POST /api/volunteer` — volunteer signup
   - `POST /api/newsletter` — email capture (stores in KV or forwards to Buttondown)
6. **Add Cloudflare Turnstile** to all forms
7. **Add address, meeting time, map embed** to `/about` and `/events` (source: ASIG page already has PVCC Building Q, 17811 N 32nd St — extract to site-wide data)
8. **Put next 3–5 events in real HTML** — new `<UpcomingEvents />` component on homepage and `/events`, populated from Content Collection. Fallback: static array if CMS not yet live.
9. **Add Event JSON-LD** — `Event` schema on `/events` (currently only on `/asig`), `Organization` site-wide already exists
10. **Add FAQPage JSON-LD** to `/learn` career FAQs
11. **Replace primary `mailto:` flows with forms:**
    - `/join` — membership inquiry form (or Stripe Payment Link if ready)
    - `/star-tours` — request form replaces `mailto:startours@pasaz.org` CTA
    - `/contact` — form replaces email card grid (keep role emails as fallback)
    - `Footer.astro` — keep info@/webmaster as secondary; primary becomes newsletter signup
12. **Fix `/join` content** — state membership dues/tiers (from officers), real benefits, real signup flow

**Validation:**
- Officer can log into CMS, create a draft event, and a Publisher can push it live
- All four forms submit successfully and arrive at the destination email
- Turnstile blocks a test spam submission
- `grep -rc "mailto:" src/pages/*.astro` returns only Footer/role-based emails, zero primary-funnel `mailto:`
- Lighthouse accessibility score ≥ 95
- `/events` shows next 3 events as real HTML above the iframe
- `/join` states dues and has a working signup CTA

---

### Phase 2 — Premium Experience (Weeks 4–6)
**Goal:** Art-directed heroes, gallery expansion, search, OG images.

**Tasks:**
1. **Audit and expand `/gallery`** — currently 5 images. Add 10–15 more from ASIG members. Ensure all have descriptive alt text, photographer credit, and responsive `srcset`.
2. **Add homepage gallery strip** — 3–4 featured images linking to `/gallery`
3. **Build `<UpcomingEvents />`** — compact (homepage, 3 items) and full (`/events`, all upcoming) variants. Empty state: "No events scheduled — check back soon."
4. **Add Pagefind search** — `pagefind` CLI in build step; embed search UI in nav
5. **Generate per-page OG images** — build-time via `astro-og-canvas`. At minimum: Home, About, Events, Star Tours, Join, Gallery, Learn.
6. **Rebuild `Hero.astro`** — add `tone` (`dark`/`bright`), `focalPoint`, `align` props. Per-page assignment from EXPERT REVIEW. Guaranteed CTA slot. (Note: current `Hero.astro` doesn't have these props — this is a rebuild.)
7. **Replace interior heroes** with real photography or art-directed treatment. Priority: `/join` (currently placeholder), `/events` (currently too dark).
8. **Clamp APOD caption** — line-clamp to ~3 lines, strip NASA promotional line, add "Read the full description on APOD ↗" link
9. **Fix `.text-gradient` overuse** — restrict to headings ≥3 words / major page titles
10. **Rebuild `/leadership` as a semantic `<table>`** — 29 bordered card rows → actual table
11. **Add add-to-calendar buttons** — ICS download + Google/Outlook links on each event

**Validation:**
- All 14 pages render without placeholder content
- OG image preview changes per page (test with Facebook Sharing Debugger)
- Search returns results for "star party," "telescope," "history"
- Gallery page loads with 15+ member images
- APOD card has bounded height and clean framing
- `/leadership` renders as a semantic table
- "Add to Calendar" generates valid ICS file

---

### Phase 3 — Community & Automation (Weeks 7–10)
**Goal:** Newsletter, member spotlights, scheduled rebuild, dashboard foundation.

**Tasks:**
1. **Newsletter signup** — footer + `/join` embed. Provider: Buttondown (free tier, zero maintenance). Wire to `POST /api/newsletter` or direct embed.
2. **Social links + donate button** — footer additions. Donate via Stripe Payment Link (hosted checkout, no PCI burden).
3. **Member spotlights** — `TestimonialCard.astro` component, 4–6 short interviews. Content from officers. Homepage section or `/community` page.
4. **Speaker profiles** — add to events Content Collection schema; link from event listings.
5. **Scheduled rebuild (Cloudflare Worker + Cron Trigger)** — daily rebuild at 02:00 UTC to refresh APOD and any Bookwhen-API-sourced event data.
6. **Cloudflare KV** — cache dashboard data (Phase 3 groundwork for "Tonight in Arizona")
7. **NWS weather integration** — first zero-API piece for the sky dashboard (moon phase, planet visibility via Astronomy Engine; cloud cover from NWS)
8. **Local SEO** — NAP block in footer (already partially there), `LocalBusiness`-adjacent schema, Google Business Profile registration (out-of-band task for officers)

**Validation:**
- Newsletter signup succeeds and appears in Buttondown dashboard
- Donate button opens Stripe-hosted checkout
- Site rebuilds automatically every 24 hours without manual deploy
- NWS data renders on `/sky-conditions` or homepage dashboard

---

### Phase 4 — Advanced Features (Month 4+, backlog)
**Goal:** Gamification, gallery submissions, youth section.

**Tasks:**
1. **Observing Awards program** — themed challenges, certificate/badge graphics, verification flow
2. **PAS Academy youth section** — Kids, Teens, Teachers, Parents, STEM Resources, Scout Badges, School Outreach
3. **Gallery submission flow** — member upload form → R2 storage → curator review → publish via CMS
4. **Cloudflare D1** — participant progress storage for awards/leaderboards
5. **Lightweight account system** — email-based, parental consent for minors (COPPA)
6. **Leaderboards** — opt-in, privacy-conscious (first name + last initial)
7. **Astrophotography Contest** — quarterly judged contest with submission form, public voting

**Validation:**
- A youth participant can complete a challenge and receive a digital certificate
- A member can submit a gallery photo via the form
- Leaderboard displays opt-in participants without full names

---

## 4. Testing Protocols

### Unit Tests (Vitest)
- **Scope:** Pure functions, utilities, data transformations
- **Examples:** date formatting for events, Bortle scale lookup, newsletter email validation, ICS generation, APOD dimension-probe logic
- **Command:** `vitest run`
- **CI gate:** Must pass on every PR

### Integration Tests (Vitest + Astro Test)
- **Scope:** Component rendering with Content Collection data
- **Examples:** `UpcomingEvents` renders correct number of items, `GalleryGrid` handles empty state, `Hero` applies correct `tone` class, forms render validation errors, `NavBar` includes all nav items
- **Command:** `vitest run --reporter=dot`
- **CI gate:** Must pass on every PR

### End-to-End Tests (Playwright)
- **Scope:** Critical user journeys across all pages
- **Examples:**
  1. Homepage loads, hero visible, "Join the Club" CTA navigates to `/join`
  2. `/events` shows next 3 events as real HTML (not just iframe)
  3. Contact form submits and shows success state
  4. Star Tours request form submits with all required fields
  5. Mobile menu opens/closes, all nav items reachable (including newly added Learn, Gallery, etc.)
  6. Search returns results for "telescope"
  7. Print preview shows all page content (no blank sections)
  8. Tab navigation: no element obscured by sticky header
  9. `/join` displays dues information and working signup CTA
  10. OG image meta tags present on all pages
- **Command:** `npx playwright test`
- **CI gate:** Must pass on every PR to `main`

### Accessibility Checks
- **Automated:** `@axe-core/playwright` in E2E suite; catch WCAG violations on every page
- **Manual:** `prefers-reduced-motion` test (motion cuts, ambient preserved), keyboard-only navigation, screen-reader spot-check on nav and forms
- **Target:** WCAG 2.2 AA conformance; zero Level AA failures

### Performance Budgets
| Metric | Target | Measurement |
|---|---|---|
| LCP (mobile) | < 2.5s | Cloudflare Web Analytics / Playwright |
| CLS | < 0.1 | Playwright |
| INP | < 200ms | Cloudflare Web Analytics |
| JS bundle (homepage) | < 200 KB gzipped | `astro build` output |
| CSS bundle | < 50 KB | `astro build` output |
| Font files | ≤ 2 woff2 files | Verify in Network tab |

### Content QA
- `grep -rc "PlaceholderNote" src/pages/ src/content/` → 0 (never ships another placeholder)
- `grep -rc "mailto:" src/pages/` → only Footer role-based emails, zero primary-funnel `mailto:`
- Every gallery image has descriptive `alt` text
- Every event has `Event` JSON-LD
- Every page has unique `<title>` and meta description
- Nav includes all 14+ pages on desktop and mobile

---

## 5. Deployment Roadmap

### Pre-launch (Phase 0)
1. Create Cloudflare Pages project, connect GitHub repo
2. Configure build settings: build command `astro build`, output `dist`, node version 20+
3. Set custom domain `pasaz.org` (DNS migration from current host)
4. Enable auto-deploy on push to `main`
5. Enable preview deployments on PRs (automatic with Cloudflare Pages)
6. Set `PLAUSIBLE_DOMAIN` env var in Cloudflare Pages dashboard
7. Verify Cloudflare Web Analytics is active for production domain

### Phase 1 Launch
1. Merge Phase 1 PR (Content Collections + CMS + forms + nav completion)
2. Verify Cloudflare Pages auto-deploy succeeds
3. Run E2E test suite against production URL
4. Have two officers complete CMS acceptance test: create event, publish, verify on site
5. Switch Bookwhen embed to native event list as primary (iframe as fallback)

### Phase 2 Launch
1. Merge Phase 2 PR (Hero rebuild, gallery expansion, search, OG images)
2. Verify OG images with Facebook/Twitter debuggers
3. Run full accessibility audit
4. Performance regression check against Phase 1 baselines

### Phase 3 Launch
1. Merge Phase 3 PR (newsletter, spotlights, scheduled rebuild)
2. Verify daily scheduled rebuild runs (check Cloudflare Workers dashboard)
3. Verify NWS weather data populates correctly
4. Newsletter signup flows to Buttondown

### Ongoing Operations
| Task | Frequency | Owner |
|---|---|---|
| Content updates (events, press, gallery) | As needed | CMS Contributors |
| Event publishing | As needed | CMS Publishers |
| Newsletter sends | Monthly | Officer |
| CI/CD health check | Weekly | Developer |
| Bundle size check | Per deploy | CI |
| Scheduled rebuild verification | Weekly | Developer (first month), then trust Cloudflare |

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CMS adoption fails — officers won't use it | Medium | High | Pick Decap/Sveltia (Google Docs UI, not GitHub); write one-page screenshot guide; do acceptance test live with actual officer |
| Photography stalls — no member images | Medium | High | Open call to ASIG members before commissioning; use existing best shots as stopgap |
| Scope creep — Phase 4 features jump queue | High | High | Phase gates are load-bearing; Phase 4 explicitly deferred until Phase 1–3 prove engagement |
| Cloudflare free tier limits hit | Low | Medium | A 100-member club site will never approach Pages bandwidth limits; monitor in dashboard |
| Three.js breaks on browser update | Low | Medium | Pinning version 0.170; IntersectionObserver pause reduces runtime exposure |
| Volunteer burn-out maintaining larger site | Medium | High | Every new feature scored for maintenance burden; high-burden/low-justification items deferred |
| Nav expansion causes confusion | Low | Medium | Group nav items logically; test mobile menu with officers before launch |

---

## 7. Open Decisions

| Decision | Status | Notes |
|---|---|---|
| CMS choice: Decap vs Sveltia | **Recommended: Sveltia** (modern UI, actively maintained, smaller bundle). Decap is fallback if Sveltia has issues with Cloudflare Pages auth. | Verify Cloudflare Pages OAuth compatibility before committing |
| Newsletter provider: Buttondown vs MailerLite | **Recommended: Buttondown** (simpler, free for < 2,500 subscribers, no branding). MailerLite if richer automation is needed later. | |
| OG image library: `astro-og-canvas` | **Confirmed: `astro-og-canvas`** (works with static output, no Vercel dependency). | |
| Analytics: Plausible already integrated | **Confirmed: Activate existing Plausible integration** via `PLAUSIBLE_DOMAIN` env var. No change needed. | |
| Membership dues/tiers | **Needs board decision** — not a dev task. `/join` cannot ship a real signup until this is resolved. | Officer task, parallel track |
| Star Tours pricing | **Needs officer decision** — affects the Star Tours request form fields and confirmation flow. | Officer task, parallel track |
| `/solar-system` page | **Does not exist in current codebase** — was already removed. No action needed. | |
| `press-releases.astro` typo | **Does not exist in current codebase** — old master plan referenced an earlier version. Current code correctly uses `{' '}` spacing. | No action needed |
| Navigation grouping | **Decision needed:** Keep current flat list, or group into sections (e.g., "Observe" = Events, Star Tours, Sky Conditions; "Learn" = Learn, Gallery, ASIG, BSIG; "About" = About, History, Leadership, Press Releases)? | Current flat list works; grouping is a Phase 2 polish item if the list grows further |

---

## 8. Concrete File Changes (Phase 0 Only — Implementation Detail)

These are the only file-level changes needed to complete Phase 0, listed explicitly so an implementer has zero ambiguity:

### `src/components/NavBar.astro`
- Add 6 items to `navItems` array: `{ href: '/learn', label: 'Learn' }`, `{ href: '/gallery', label: 'Gallery' }`, `{ href: '/press-releases', label: 'Press' }`, `{ href: '/asig', label: 'ASIG' }`, `{ href: '/bsig', label: 'Book Club' }`, `{ href: '/leadership', label: 'Leadership' }`
- Add "Home" link to mobile `<details>` menu (currently only reachable via logo)
- Add `aria-haspopup="true"` to the mobile `<summary>` (already has `aria-label`)

### `src/pages/learn.astro`
- Replace `PlaceholderNote` at line 300 with a brief disclaimer: "Resource links are curated starting points, not PAS endorsements. Career answers are general guidance — consult a professional astronomer or counselor for specific advice."

### `src/pages/contact.astro`
- Replace `PlaceholderNote` at line 45 with: "Contact addresses are current as of [date]. Verify before launch — see [officer name] for confirmation."

### `src/pages/press-releases.astro`
- Replace `PlaceholderNote` at line 363 with: "PDFs for releases before 2026 are pending upload to `public/press-releases/`. Headlines and summaries for entries without them will be filled in once available."

### `src/pages/events.astro`
- Replace `PlaceholderNote` at line 337 with: "Star Tours bookings are handled by email at startours@pasaz.org. An online request form is planned for a future phase."

### `.github/workflows/ci.yml` (new file)
```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm astro check
      - run: pnpm astro build
```

### `eslint.config.js` (new file)
- Use `@astrojs/eslint-plugin` + `eslint-plugin-tailwindcss` + `eslint-plugin-jsx-a11y`
- Enforce: no unused imports, consistent quote style, a11y rules for aria attributes, alt text presence

### `.prettierrc` (new file)
- `{ "semi": true, "singleQuote": true, "printWidth": 100, "trailingComma": "es5" }`
