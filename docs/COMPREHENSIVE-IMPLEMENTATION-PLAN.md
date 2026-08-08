# Phoenix Astronomical Society Website — Comprehensive Implementation Plan

**Source review:** `docs/EXPERT-REVIEW-2026.md` (Overall Score 68/100, World-Class Readiness 45%)
**Companion document:** `docs/IMPLEMENTATION-MASTER-PLAN.md` (deep technical/design/content specs — this document is the execution-ready synthesis of that plan, restructured around priority, timeline, and trackability)
**Maintainer reality:** volunteers with no engineering background, on their own time, indefinitely. Every recommendation below is scored against that constraint, not against what a funded team could sustain.
**Stack:** Astro 7, Tailwind 4, static output — kept as-is throughout; no rebuild is recommended anywhere in this plan.

---

## 1. Executive Summary

### Key finding

The Phoenix Astronomical Society site has a world-class hero — a procedurally generated three.js scene (limb-darkened Saturn, an inclined Andromeda, GPU-shader star twinkle, a documented WCAG-driven contrast token system) — attached to an unfinished website. Below the fold, eight public "⚠ Placeholder content" banners are visible across seven of fourteen pages, the primary "Join PAS" conversion path dead-ends at a page admitting online signup is "coming in a future phase," membership dues are never stated, there is no address, no map, no social links, no newsletter, and not one photograph of the sky taken by a member. The engineering (Astro architecture, accessibility fundamentals, motion design, performance instrumentation) is already better than the content and art direction around it. **This is a launch-blocking content and photography problem wearing a well-built front end, not an engineering problem.**

### Overall scores from the review

| Dimension | Score | Dimension | Score |
|---|---|---|---|
| **Overall** | **68/100** | Content | 72/100 |
| Design | 78/100 | SEO | 62/100 |
| UX | 62/100 | Mobile | 65/100 |
| Branding | 55/100 | Desktop | 82/100 |
| Performance | 74/100 | Community Engagement | **35/100** |
| Accessibility | 80/100 | World-Class Readiness | **45%** |

### Overall priorities (ranked)

1. **Stop the site from telling visitors it's unfinished** — remove all 8 placeholder banners (fill or delete).
2. **Close the membership funnel** — state dues, add a real signup path.
3. **Close the events funnel** — put real dates in HTML, not just a third-party iframe.
4. **Show the club's own photography** — the single highest-leverage brand and community asset, currently entirely absent.
5. **Fix the two real WCAG 2.2 AA failures** (focus-visible, focus obscured by sticky header) and the print/PDF bug.
6. **Give volunteers a way to maintain the site without a developer** — this determines whether items 1–5 stay fixed in six months.
7. **Make the club findable** — structured data and local SEO are both currently at zero.

### Expected outcomes

| Outcome | From | To |
|---|---|---|
| Visitor can find the next event without leaving the site | No | Yes, in HTML, on the homepage |
| Visitor can become a member online | No — `mailto:` only | Yes — form or payment link |
| Club can update events/press/gallery without a developer | No | Yes — CMS-backed content collections |
| Site shows member astrophotography | No | Yes — 20+ curated images |
| Public "under construction" language | 8 banners | 0 |
| WCAG 2.2 AA conformance | Fails 2.4.11 | Passes |
| Event structured data | None | `Event` + `Organization` JSON-LD |

### Estimated total timeline and cost

**12 weeks of core work** (Phases 1–3) to move the site from "impressive demo" to genuinely competitive in its category, plus a non-blocking 6–12 month Phase 4 backlog. At 10–15 hrs/week from one part-time developer/designer plus volunteer content contribution, total direct cost ranges from **$2,000 (minimal/DIY)** to **$25,000 (recommended: full CMS + community layer)**, detailed in §10.

---

## 2. Priority Matrix

Every finding from the review, sorted into four priority tiers. "Effort" is developer/designer time only; content-gathering (dues decisions, photography, officer confirmations) runs in parallel and is tracked separately in §7.

### 🔴 Critical — blocks a credible public launch

| # | Item | Effort | Impact |
|---|---|---|---|
| C1 | Remove all 8 placeholder banners | 2.5 days (+ content) | Very High |
| C2 | Make `/join` state dues and offer a real signup path | 1 day dev (blocked on board decision) | Very High |
| C3 | Put real event dates in HTML (homepage + `/events`) | 1–2 days | Very High |
| C4 | Fix print/PDF blank-page bug | 15 min | Medium |
| C5 | Replace `/join` and `/events` hero images | 2 hrs (stopgap) | High |
| C6 | Add `:focus-visible` ring site-wide (WCAG 2.4.13) | 3 hrs | Medium |
| C7 | Fix `scroll-margin-top` under sticky header (WCAG 2.4.11, AA failure) | 1 hr | Medium |
| C8 | Fix `atinfo@pasaz.org` typo on `/press-releases` | 5 min | Low visibility / High credibility |
| C9 | Add address, meeting time, and a map embed | 3 hrs (+ content) | Very High |
| C10 | Wire up privacy-respecting analytics | 1 hr | Medium (enabling) |

### 🟠 High — next 30–60 days

| # | Item | Effort | Impact |
|---|---|---|---|
| H1 | Art-direct `Hero.astro` (per-image focal point, tone, CTA slot) | 3 days | High |
| H2 | Fix `SpaceHero` moon rendering + mobile/portrait CTA collision | 1 day | Medium |
| H3 | Build the member astrophotography gallery | 4 days + content | Very High |
| H4 | Adopt Astro Content Collections + a git-based CMS | 3–5 days | Very High (enabling) |
| H5 | Newsletter signup (footer + `/join`) | 3 hrs | High |
| H6 | Replace all `mailto:` flows with real forms | 3 days | High |
| H7 | Add social links + a donate button | 2 hrs | Medium/High |
| H8 | `Organization` + `Event` + `BreadcrumbList` JSON-LD | 1 day | High |
| H9 | Per-page Open Graph images | 1 day | Medium |
| H10 | Font preload + Latin-only subsetting | 2 hrs | Medium |

### 🟡 Medium — next 90 days

| # | Item | Effort | Impact |
|---|---|---|---|
| M1 | Member spotlights / testimonials | 3 days | Medium |
| M2 | Speaker profiles for the lecture series | 2 days | Medium |
| M3 | `FAQPage` schema on `/learn` | 1 hr | Medium |
| M4 | A second layout pattern below the fold (editorial/full-bleed) | 3 days | Medium |
| M5 | Dedicated dark-sky-sites landing page + internal links | 1 day | Medium/High |
| M6 | `.text-gradient` audit on short headings | 2 hrs | Low/Medium |
| M7 | Real `<table>` for `/leadership` (29 presidents) | 3 hrs | Low/Medium |
| M8 | Retire `/solar-system` as a standalone nav page | 1 hr | Low |
| M9 | Site search (Pagefind) | 1 day | Medium |
| M10 | Clamp/reframe the APOD card, strip NASA's promo line | 3 hrs | Medium |

### 🟢 Low / Future — 6–12 months, backlog

| # | Item | Effort | Impact |
|---|---|---|---|
| L1 | Lunar phase widget | 1–2 days | Medium |
| L2 | Meteor shower tracker | 1–2 days | Medium |
| L3 | Commissioned photo shoot (night + day) | External vendor | Very High |
| L4 | Distinctive brand system (Sonoran-night palette, typography) | Large | Medium |
| L5 | "What's Up Over Phoenix" monthly publication | Large, ongoing | Very High |
| L6 | Member accounts + observation logs | Large | Medium (defer) |
| L7 | "The Observatory That Was Never Built" scroll narrative | Large | Medium |
| L8 | Youth/educator program hub | Large | Medium |

**Explicitly rejected** (scored, not silently dropped): equipment database, interactive star charts/planet explorer, live satellite tracking, live observatory feeds, AI astronomy assistant, achievement badges, push notifications, personalized dashboards — all "do not build," each with a linked-to alternative already in place (NASA Eyes, Stellarium Web, Heavens-Above). See §7 Item 32 for the full rationale table.

---

## 3. Quick Wins (< 1 week total, no content dependencies)

These ship first because none of them require a board decision, a photo shoot, or new copy — they are pure developer time and can start today.

| Item | Effort | Fix |
|---|---|---|
| Print/PDF blank-page bug | 15 min | `@media print { .reveal { opacity: 1; transform: none } }` in `global.css` |
| `atinfo@pasaz.org` typo | 5 min | Add missing space/`{' '}` before the mailto anchor in `press-releases.astro` |
| `:focus-visible` ring | 3 hrs | Global `outline: 2px solid var(--color-nebula-teal)` in `@layer base` |
| `scroll-margin-top` under sticky header | 1 hr | `scroll-margin-top: 4.5rem` on all focusable/anchorable elements |
| Analytics wired up | 1 hr | Add Plausible or Fathom (cookieless, no consent banner) |
| Font preload + Latin subsetting | 2 hrs | Swap bare `@fontsource-variable/*` imports for `/latin.css`; add `<link rel="preload">` |
| `.text-gradient` audit | 2 hrs | Restrict gradient to headlines ≥3 words/one line; solid color for short headings |
| `/leadership` real table | 3 hrs | Replace 29 bordered card rows with one `<table>` |
| `aria-haspopup` + mobile "Home" link | 30 min | Two small `NavBar.astro` additions flagged in the review's Navigation section |
| Retire `/solar-system` as standalone page | 1 hr | Fold into a `/learn` resource card, keep URL as redirect |
| FAQ schema on `/learn` | 1 hr | Wrap the 5 existing career FAQs in `FAQPage` JSON-LD |
| Hero image stopgap swap on `/join` and `/events` | 2 hrs | Use existing image library to replace the conference-room and near-black photos |

**Total: ~3–4 developer-days.** All ten items in §2's Critical tier that don't require content or a board decision (C4, C6, C7, C8, C10) are in this list — meaning roughly half of the "launch-blocking" tier can ship in the first week while dues/content decisions are still in flight.

---

## 4. Phase 1 (0–30 Days) — Critical Foundation

**Goal (Milestone M1):** zero placeholder banners; join and events funnels functional; both real WCAG failures and the print bug fixed.

| Task | Owner | Effort | Dependency |
|---|---|---|---|
| F1.1 Remove all 8 placeholder banners | Content + Dev | 2.5 days | Officer roster, dues, address, press PDFs |
| F1.2–F1.5 Quick-win bug/accessibility fixes | Dev | (see §3) | None — start Day 1 |
| F1.6 `/join` funnel — state dues, add signup | Board → Content → Dev | 1 day dev | **Board decision on dues/tiers** (not a dev task) |
| F1.7 Real event dates in HTML | Dev + calendar admin | 1–2 days | Bookwhen data access |
| F1.8 Replace `/join`/`/events` hero images (stopgap) | Dev | 2 hrs | Existing image library |
| F1.9 Address, meeting time, map embed | Dev + officer | 3 hrs + content | Facility-use agreement confirmation |
| F1.10 Analytics | Dev | 1 hr | None |

**Sequencing:** Days 1–10 ship everything content-independent (bug fixes, accessibility, analytics) in parallel with a content-gathering sprint (dues decision, officer roster, meeting details, press PDFs). Days 6–20 ship the content-dependent items as content lands. Days 21–30 are a full 14-page QA pass against the M1 gate.

**Phase 1 total effort:** ~10–12 developer-days across 2 calendar weeks, gated primarily by content/decision turnaround, not code.

---

## 5. Phase 2 (30–90 Days) — Feature Enhancement & Optimization

**Goal (Milestone M2):** interior heroes art-directed; gallery live; CMS content model in place for the two highest-churn content types; design system documented.

| Task | Effort | Notes |
|---|---|---|
| P2.1 Art-direct `Hero.astro` (per-image focal point/tone/CTA slot) | 3 days | Full component spec in §7 Item H1 |
| P2.2 Fix `SpaceHero` moon + portrait CTA collision | 1 day | |
| P2.3 Member astrophotography gallery (`/gallery` + homepage strip) | 4 days | Start with a member call, not a commissioned shoot |
| P2.4 Second layout pattern below the fold | 3 days | Editorial/full-bleed pattern for `/about`, `/history`, `/learn` |
| P2.5 Clamp/reframe APOD card | 3 hrs | |
| P2.6–P2.9 `.text-gradient` audit, `/leadership` table, `/solar-system` retirement, font fix | (Quick Wins, if not already shipped in Phase 1) | |
| H4 Adopt Astro Content Collections + git-based CMS (Decap/Sveltia) | 3–5 days | Begin with events + press releases |

**Phase 2 total effort:** ~4 weeks including content review cycles.

---

## 6. Phase 3 (3–12 Months) — Long-Term Strategic Initiatives

Covers both the review's "Medium Priority — 90 days" tier and its "Future Vision — 6–12 months" tier, since both are non-blocking relative to Phases 1–2.

**3–6 months (Milestone M3 — Community Layer):**
- Newsletter signup, social links, donate button (C3.1/C3.2)
- Replace all `mailto:` flows with real forms (C3.3)
- Member spotlights/testimonials, speaker profiles (C3.4/C3.5)
- `Organization` + `Event` + `BreadcrumbList` JSON-LD, per-page OG images (C3.7/C3.8)
- Pagefind site search
- Dark-sky-sites landing page

**6–12 months (Milestone M4 — CMS Handoff, then backlog):**
- CMS migration extended to gallery, leadership, testimonials collections
- M4 acceptance test: a non-technical officer publishes one event and one gallery image unassisted
- Lunar phase widget, meteor shower tracker (only low-maintenance-burden Phase 4 items approved to build now)
- Commissioned photography program (night + day shoots)
- Revisit brand refresh, "What's Up Over Phoenix" publication, and any Visionary-tier item **only with a named, funded, ongoing owner** — see §9 Risk Assessment

---

## 7. Detailed Action Items

Every finding from the review, fully specified. Items are grouped by theme; each carries why it matters, the recommended solution and alternatives, step-by-step instructions, effort/cost/skills, dependencies/risks, and success criteria/KPIs.

### Group A — Credibility & Trust

#### A1. Remove all 8 placeholder banners

- **Why it matters / impact:** `⚠ Placeholder content — needs real info from PAS before launch` is visible to every public visitor on `/`, `/join`, `/contact`, `/events`, `/learn`, `/press-releases`, and twice on `/about`. One instance tells the public that contact emails "were found via web research and should be verified." This is internal project management leaking onto a production site and, per the review, "destroys credibility more thoroughly than anything else here." Very High impact.
- **Recommended solution:** Fill each section with real, board-reviewed content. Where content genuinely isn't ready, hide the section rather than leaving an apology visible.
- **Alternative considered:** Leave a softer "content in progress" note. **Rejected** — any public admission of incompleteness undermines trust regardless of tone; a missing section reads as intentional, a banner reads as unfinished.
- **Steps:**
  1. Inventory every `<PlaceholderNote>` usage: `grep -rn "PlaceholderNote" src/pages/`.
  2. For each, list the specific fact(s) needed (dues, officer names, meeting time, etc.) and assign an owner (board member/officer) to confirm it.
  3. Replace with real copy once confirmed; remove the component import if no longer used on that page.
  4. If a section truly cannot be filled before launch, delete the section and its heading rather than leaving a warning.
- **Effort/cost:** 0.5 day dev per banner once content exists (≈2.5 days total); content-gathering is the actual bottleneck, not code.
- **Skills:** Front-end dev (Astro/Tailwind), content editor, board sign-off.
- **Dependencies/risks:** Blocked on officer roster, confirmed dues/benefits, observing-site details, press PDFs, confirmed contact-email ownership. Risk: content-gathering stalls if no single owner is assigned — mitigate with a dated content-gathering sprint (Days 1–5 of Phase 1).
- **Success criteria / KPI:** `grep -rc "<PlaceholderNote" src/pages/*.astro` returns 0. Each replaced section is board-reviewed. Zero placeholder banners visible to a manual click-through of all 14 pages.

#### A2. Fix the print/PDF blank-page bug

- **Why it matters:** Under print-media emulation, the homepage's hero renders at full opacity and all seven sections below it render at `opacity: 0` — printing or saving any page as PDF produces a hero followed by blank pages. Also affects screenshot/renderer tools that don't scroll. Medium impact, but a verified, zero-ambiguity defect.
- **Solution:** Add a `@media print` override for `.reveal`.
- **Steps:**
  1. Open `src/styles/global.css`.
  2. Below the existing `@media (prefers-reduced-motion: reduce) { .reveal { ... } }` block, add:
     ```css
     @media print {
       .reveal { opacity: 1; transform: none; }
     }
     ```
  3. Verify with `Ctrl/Cmd+P` print preview on `/` — all seven sections should now be visible.
- **Effort/cost:** 15 minutes. **Skills:** CSS.
- **Dependencies/risks:** None.
- **Success criteria:** Print preview on every page shows full content, not blank space below the hero.

#### A3. Fix the `atinfo@pasaz.org` typo

- **Why it matters:** `/press-releases` renders "Members of the media are welcome to contact us at**info@pasaz.org**" with no space — a visible, embarrassing text bug on a page aimed at journalists.
- **Solution:** Add the missing space/`{' '}` before the `<a href="mailto:...">` tag in `src/pages/press-releases.astro`.
- **Effort/cost:** 5 minutes. **Skills:** Basic HTML/Astro templating.
- **Success criteria:** Built HTML reads "contact us at info@pasaz.org" with a visible space.

### Group B — Conversion Funnels

#### B1. Make `/join` actually work

- **Why it matters:** Four CTAs across 14 pages (header "Join PAS," homepage hero, "Why Join" section, SIG section) converge on a page that admits it cannot process a signup and hands the visitor to `mailto:info@pasaz.org`. Dues are never stated anywhere on the site. Three of the four listed benefits ("access to star parties," "monthly meetings," "a community of mentors") are things the site elsewhere says are free and public — so the page cannot answer "why would I pay for this?" **This is the review's single most important finding.** Very High impact — this is the site's stated purpose.
- **Recommended solution:** State dues and tiers explicitly; add either a hosted checkout (Stripe Payment Links) or a membership platform built for small nonprofits (WildApricot, MemberPlanet); rewrite the benefits list to only include things that are actually membership-exclusive.
- **Alternatives considered:**
  - *Custom payment handling* — rejected; adds PCI-compliance surface a volunteer club shouldn't own.
  - *Interim honest `mailto:` with a subject-line template* ("Email membership@pasaz.org with your name and we'll invoice you") — acceptable **only** as a stopgap while a payment processor is set up, never as the permanent state, and must be paired with stated dues so the visitor at least knows the price before emailing.
- **Steps:**
  1. **Board decision (not a dev task, and the actual bottleneck):** dues amount(s), tiers if any, what's included, whether a payment processor already exists.
  2. Update `src/pages/join.astro` benefits array to concrete, non-duplicated items.
  3. Add a dues/tiers table to the page.
  4. Wire up the chosen payment path (Stripe Payment Link embed, or the interim `mailto:` with template, clearly labeled as such — not apologetic).
  5. Replace the hero image (see B3).
- **Effort/cost:** 1 day dev once the decision is made; Stripe Payment Links are free to set up (2.9%+30¢ per transaction, no monthly fee) — cheapest viable payment path for a small nonprofit. WildApricot/MemberPlanet run ~$40–60/month if a fuller membership platform is wanted later.
- **Skills:** Board decision-making, front-end dev, basic Stripe/payment-platform setup.
- **Dependencies/risks:** Entirely blocked on the board's dues decision — this is a governance bottleneck, not a technical one. Risk: if the board stalls, the whole funnel stays broken. Mitigate by scheduling this as the first agenda item of Phase 1's content-gathering sprint, not something deferred to "when there's time."
- **Success criteria / KPI:** A visitor can state, in one sentence after reading the page, what membership costs and what they get. KPI: membership signups tracked from launch (baseline today is unmeasurable — no form, no analytics).

#### B2. Put real event dates in HTML

- **Why it matters:** The homepage's "Upcoming Events" section contains three cards describing event *types* with no dates. The only place any date lives is inside a third-party Bookwhen `<iframe>` — invisible to search engines, not indexable, and it failed to load entirely during the review, leaving the page with zero date information. For an events-driven organization, this is, per the review, "the highest-leverage defect on the site." Very High impact.
- **Recommended solution:** Pull the next 3–5 events into real markup as a new `<UpcomingEvents />` component on the homepage and at the top of `/events`, above the iframe (which stays as the full-calendar/registration surface).
- **Alternatives considered:** Replace Bookwhen entirely with a custom calendar — **rejected**, unnecessary rebuild cost for a solved problem; keep Bookwhen for registration, just stop depending on it for the one piece of information (dates) that must be crawlable and always-available.
- **Steps:**
  1. Short-term: maintain `src/data/events.ts` (or a Content Collection, see H4) manually — same person who updates Bookwhen adds the same event here, same effort, different destination.
  2. Build `<UpcomingEvents />`: compact 3-item variant for the homepage, full list for `/events`.
  3. Use real `<time datetime="...">` elements, not formatted strings.
  4. Add a loading/empty ("no events scheduled — check back soon")/error state.
  5. Medium-term: script a build-time fetch from Bookwhen's API to auto-populate the array, removing the manual step.
- **Effort/cost:** 1–2 days for the manual version; +1 day later for API automation.
- **Skills:** Astro component dev, basic API integration (for the automation step).
- **Dependencies/risks:** Requires Bookwhen data access (API key or a manual weekly copy process). Risk: manual process lapses if the owner changes — mitigate by prioritizing the API automation once F1.7 proves the display format works.
- **Success criteria / KPI:** View-source on `/` shows actual dates, titles, and locations for the next 3 events with no JavaScript required. KPI: event page → Bookwhen conversion rate, tracked from month 1.

#### B3. Replace `/join` and `/events` hero images

- **Why it matters:** `/join`'s hero is a fluorescent-lit community-college classroom of people at folding tables — "nobody has ever joined an astronomy club because they wanted to attend a meeting" (review). `/events` uses a night shot at 60% opacity under a 70% scrim that renders functionally black — the fireworks, telescope, and fence are all unidentifiable. High impact — first impression on the two highest-intent pages.
- **Solution:** Stopgap now (existing image library), full art direction later (see H1).
- **Steps:** Audit `src/assets/images/` for the least-bad available night/observing/engaged-member shots; swap in `join.astro` and `events.astro` immediately, without waiting for the `Hero.astro` rebuild.
- **Effort/cost:** 2 hours. **Skills:** Basic image selection, Astro `<Image>` usage.
- **Dependencies/risks:** None for the stopgap; full fix depends on H1.
- **Success criteria:** Neither hero image reads as "a photo of a meeting" or "a black rectangle" in a 5-second glance test.

### Group C — Accessibility (WCAG 2.2 AA)

#### C1. Global `:focus-visible` ring

- **Why it matters:** The only custom focus style anywhere in the codebase is on the skip link. Every button, card link, nav summary, and dropdown falls back to the browser default ring, which is inconsistent-to-invisible on the site's near-black, translucent-glass surfaces. This is a **WCAG 2.2 SC 2.4.13 (Focus Appearance)** risk. Medium impact, real accessibility/legal exposure.
- **Solution:**
  ```css
  :focus-visible {
    outline: 2px solid var(--color-nebula-teal);
    outline-offset: 3px;
    border-radius: 2px;
  }
  ```
  Add in `@layer base` in `global.css`; verify it doesn't conflict with the existing skip-link focus style (it should reinforce it).
- **Effort/cost:** 3 hours including cross-browser check. **Skills:** CSS, basic accessibility testing (keyboard-only navigation).
- **Success criteria:** Tabbing through any page shows a visible teal ring on every link, button, and `<summary>`.

#### C2. Fix sticky-header focus obscuring

- **Why it matters:** The header is `sticky top-0 z-50`, ~69px tall. Tabbing scrolls focused elements to the viewport top, directly under it. Only `/sky-conditions` currently sets `scroll-margin-top`. This is **WCAG 2.2 SC 2.4.11 (Focus Not Obscured)** — a **Level AA failure on all 14 pages**.
- **Solution:**
  ```css
  :target, [tabindex], a, button, input, select, textarea, summary {
    scroll-margin-top: 4.5rem;
  }
  ```
  in `@layer base`. (4.5rem clears the measured 69px header; adjust if header height changes.)
- **Effort/cost:** 1 hour. **Skills:** CSS.
- **Success criteria:** Tab through `/sky-conditions` or `/history` end-to-end; no focused element is hidden under the header.

#### C3. Remaining minor accessibility items

- Replace typed `•` bullet characters inside `<li>` on `/events` (screen readers announce the literal character) — 15 min.
- `aria-haspopup="true"` on nav dropdown summaries — 15 min.
- Add a "Home" entry to the mobile nav array (currently only reachable via the logo) — 15 min.
- **Effort/cost:** ~1 hour combined. **Success criteria:** axe/Lighthouse manual-check items resolved; screen-reader spot-check confirms no literal bullet characters announced.

### Group D — Community & Brand (the review's lowest-scoring dimension, 35/100)

#### D1. Build the member astrophotography gallery

- **Why it matters:** "The single highest-value asset this organization owns is member astrophotography, and there is none on the site." The homepage instead runs NASA's unedited APOD caption, and the only club-sourced images (`/star-tours`) are 500px-wide, 7–23KB thumbnails captioned as a "product demo." Very High impact — this is the review's #4 highest-impact change overall and the thing that most differentiates PAS from every competitor in its comparison set.
- **Recommended solution:** New `/gallery` page + a 3–4 image homepage strip, sourced first from an open call to existing ASIG members (cheapest, fastest, and the review's explicit recommendation to "start here first"), supplemented later by a commissioned shoot (see L3).
- **Alternatives considered:** Commission a shoot first — **rejected as the starting move**; membership almost certainly already has usable images sitting on hard drives, and proving the gallery concept with free content de-risks the later paid shoot.
- **Steps:**
  1. Draft a simple submission + license-to-use agreement (member retains copyright, grants PAS a non-exclusive right to display/credit).
  2. Put out a call to ASIG members for their best 20–30 images.
  3. Curate: a "gallery curator" volunteer role reviews submissions.
  4. Build `GalleryGrid` component: homepage strip (compact) + full `/gallery` masonry; every image gets a real, descriptive alt (object name, date/location if known) — an accessibility requirement as well as SEO.
  5. Feature the best 6 as page heroes and Open Graph images (ties into H1/H9).
- **Effort/cost:** 4 developer-days for the component/page; content curation is volunteer time, not a line item, if sourced from membership. A commissioned shoot (Phase 3+) runs roughly $500–1,500 for one evening session with a local photographer.
- **Skills:** Astro component dev, basic image curation/licensing process, a volunteer "curator" role.
- **Dependencies/risks:** Needs a named curator (see §9 risk table) or submissions pile up unmoderated. Depends on H4 (CMS) to stay sustainable long-term without a developer bottleneck.
- **Success criteria / KPI:** 20+ gallery images live by end of Phase 2; ongoing trickle after. KPI tracked via CMS content count.

#### D2. Newsletter, social links, donate button

- **Why it matters:** Zero owned retention channel, zero social presence, and a 501(c)(3) status stated four times on the site with never an actionable donate path. Three of the cheapest, highest-ROI items remaining in the plan.
- **Solution:** Footer additions using free/cheap-tier tools — Buttondown or MailerLite (newsletter), existing social handles (links), Stripe Payment Link or existing processor (donate).
- **Steps:** Add newsletter embed to footer + `/join`; add social icon links with proper `aria-label`s; add a donate button linking to a hosted checkout.
- **Effort/cost:** ~5 hours combined. Newsletter providers are free under ~1,000 subscribers.
- **Skills:** Front-end dev, provider account setup (non-technical, board/officer can own this).
- **Success criteria / KPI:** 100+ newsletter subscribers by month 6 (baseline: 0, doesn't exist today).

#### D3. Member spotlights / testimonials and speaker profiles

- **Why it matters:** Social proof is entirely absent — no testimonials, no member spotlights, no named speakers for a "Monthly Lecture Series" that has guest speakers. Medium impact, cheap to produce.
- **Solution:** 4–6 short interviews (President, ASIG lead, a newer member, a Star Tours volunteer) formatted as name / tenure / what they observe / one memorable moment / one photo. Retroactively tag known past speakers in the events/press content model.
- **Effort/cost:** ~3 days each, mostly content time (interviews), not code.
- **Skills:** Interviewing/content writing, small component build (`TestimonialCard`, `SpeakerProfile`).
- **Success criteria:** 4–6 testimonials live; speaker names appear on at least the next 3 upcoming lecture events.

### Group E — Technical Foundation

#### E1. Adopt Astro Content Collections + a git-based CMS

- **Why it matters:** Every officer name, press release, observing site, and past president is a hardcoded TypeScript array inside a page component. A volunteer officer cannot update the events page or add a press release without editing source and redeploying. The review calls this **"the single greatest threat to the site's long-term survival"** — clubs abandon sites they cannot update. Very High impact, purely enabling (it doesn't change what visitors see directly, but determines whether every other fix in this plan stays true in six months).
- **Recommended solution:** Astro Content Collections as the data layer, backed by **Decap CMS** or **Sveltia CMS** (both git-based, editing the same Markdown/JSON files Content Collections consume) rather than a hosted headless CMS (Sanity, Contentful).
- **Why this over a hosted headless CMS:**
  - Zero recurring cost — reads/writes directly to the GitHub repo via OAuth, no separate database.
  - No new infrastructure to maintain — the "backend" is the repo the site already deploys from.
  - A volunteer edits through a form-based UI (title, date, image upload, rich text) and never sees YAML/Markdown syntax or a terminal.
  - Every edit is a git commit — full audit trail and instant rollback if a volunteer makes a mistake.
- **Steps:**
  1. Define schemas in `src/content/config.ts` for events, press releases, gallery, leadership, testimonials.
  2. Migrate events and press releases first (highest-churn content types).
  3. Add `public/admin/config.yml` + `index.html` for Decap/Sveltia.
  4. Set up GitHub OAuth for CMS login.
  5. Define two roles: **Contributor** (draft/edit) and **Publisher** (push live) — maps to "any officer can draft" but "only the webmaster or a designated second officer publishes."
  6. Migrate gallery, leadership, testimonials collections in Phase 3.
  7. Write `docs/VOLUNTEER-GUIDE.md` with real screenshots, after the CMS is live.
  8. **Acceptance test (M4):** a real, non-technical officer publishes one event and one gallery image unassisted, on camera.
- **Effort/cost:** 3–5 days initial setup; free (no hosted CMS fees).
- **Skills:** Astro Content Collections, git/GitHub OAuth configuration, technical documentation writing.
- **Dependencies/risks:** The single biggest adoption risk in this plan — see §9. Mitigate with a UI closer to Google Docs than to GitHub, a one-page how-to with screenshots, and a live acceptance test with an actual officer, not a developer.
- **Success criteria / KPI:** M4 acceptance test passes. KPI: "volunteer self-sufficiency," tracked as a one-time gate then spot-checked quarterly.

#### E2. Art-direct `Hero.astro`

- **Why it matters:** One `opacity-60` + one scrim gradient is applied uniformly to all 8 interior-page heroes regardless of source image brightness or subject placement. Night photos (`/events`) go unreadably dark; daytime photos (`/learn`) survive but headlines land directly on faces with no focal-point control. None of the 8 interior heroes except `/star-tours` contains a call to action. High impact — this is the review's #5 highest-impact visual change.
- **Solution:** Rebuild the component with a typed API:
  ```astro
  interface Props {
    image: ImageMetadata | string;
    alt: string;
    eyebrow?: string;
    title: string;
    subtitle?: string;
    tone?: 'dark' | 'bright';   // scrim intensity by source-image brightness
    focalPoint?: string;         // e.g. '80% 30%' — keeps subjects out of the text column
    align?: 'center' | 'left';   // scrim direction follows text position
  }
  ```
- **Steps:** Assign `tone`/`focalPoint`/`align` per page (full table in `IMPLEMENTATION-MASTER-PLAN.md` §8); ensure every hero has a guaranteed CTA slot; replace `/events`'s night shot with a genuinely bright image if no scrim treatment can save it.
- **Effort/cost:** 3 days. **Skills:** Astro component API design, basic art direction/photo selection.
- **Dependencies/risks:** Best done after B3's stopgap images are in place, so the final art direction has decent source material to work with.
- **Success criteria:** No headline overlaps a face; no night photo renders unreadably dark; every interior hero has a visible CTA.

#### E3. Structured data pass (Organization, Event, BreadcrumbList, FAQPage)

- **Why it matters:** Zero `application/ld+json` anywhere on the site. For a local nonprofit running public events, this is "the largest single SEO opportunity being left on the table" — specifically, **no rich results for "star party phoenix,"** the exact query this club needs to win. High impact.
- **Solution:** Site-wide JSON-LD in `BaseLayout.astro` for `Organization`/`NGO`; per-event JSON-LD generated from the same Content Collection data powering `UpcomingEvents`; `BreadcrumbList` alongside the existing `Breadcrumbs.astro` component; `FAQPage` wrapping the 5 `/learn` career FAQs.
- **Effort/cost:** ~2 days combined (1 day Event/Organization, 1 hr FAQ, rest Breadcrumb). **Skills:** JSON-LD/schema.org, basic SEO.
- **Dependencies:** Event schema depends on E1 (Content Collections) being live for event data; Organization schema depends on C9 (address) and D2 (social links) for complete `sameAs`/`address` fields.
- **Success criteria / KPI:** Google Rich Results Test passes for `Event` and `Organization` types. KPI: organic search impressions for "star party phoenix" / "astronomy club phoenix," tracked via Search Console from month 1 (baseline: unmeasured, presumed minimal).

#### E4. Per-page Open Graph images

- **Why it matters:** Every one of the 14 pages shares one Open Graph image — a 72px logo PNG. Every social share of any page, including the homepage and press releases, renders as a tiny logo on a `summary_large_image` card. For an organization whose subject matter is literally pictures of space, the review calls this "the most wasteful line in the codebase." Medium impact, cheap fix.
- **Solution:** Generate per-page OG images at build time from each page's actual hero photo, using `astro-og-canvas` or `@vercel/og` (both static-output compatible).
- **Effort/cost:** 1 day. **Skills:** Astro build-time image generation.
- **Success criteria:** Sharing any of the 14 URLs on Slack/Twitter/Facebook renders that page's actual photo, not the logo.

#### E5. Performance: font loading and third-party script hygiene

- **Why it matters:** Ten woff2 font files ship for an English-only site (Cyrillic, Greek, Vietnamese subsets all included via bare `@fontsource-variable` imports) with no preload — a visible FOUT on the largest text on the page, which is also the LCP element. Two render-blocking third-party scripts (Bookwhen, Astrospheric) have no `defer`/`preconnect`. Medium impact on mobile Core Web Vitals.
- **Solution:** Import `/latin.css` variants only (10 files → 2); add `<link rel="preload">` for the two files actually used; add `defer` + `preconnect` to the Bookwhen script; add `preconnect` for Astrospheric.
- **Effort/cost:** ~4 hours combined. **Skills:** Astro/Vite build config, basic performance profiling.
- **Success criteria / KPI:** Mobile LCP moves from "borderline" to consistently "good" per Core Web Vitals thresholds (Lighthouse CI or real-user monitoring).

### Group F — Content Quality

#### F1. Clamp and reframe the APOD card

- **Why it matters:** The NASA APOD caption ships unclamped — 250+ unedited words in an unbounded paragraph, ending with NASA's own promotional line ("Sky Surprise: What picture did APOD feature on your birthday?") printed on the PAS homepage. Medium impact, cheap fix.
- **Solution:** Line-clamp to ~3 lines with a "Read the full description on APOD ↗" link; strip the promotional sentence; add a "Courtesy of NASA" treatment that reads as curation.
- **Effort/cost:** 3 hours. **Success criteria:** Card no longer unbalances the two-column layout; no outbound-promotion sentence for a different site appears on the PAS homepage.

#### F2. `.text-gradient` audit

- **Why it matters:** The gradient heading treatment splits short headings ("Press Releases," "History," "Leadership," "Contact") into two visually distinct colors ("Press" near-white, "Releases" violet-to-teal) — it was designed for the hero's long headline and doesn't survive reuse on short ones.
- **Solution:** Restrict `.text-gradient` to headlines ≥3 words on one `text-d1`/`text-d2` line; short headings get solid `text-ink-primary`.
- **Effort/cost:** 2 hours. **Success criteria:** No heading under 3 words renders with a mid-word color split.

#### F3. `/leadership` real table; retire `/solar-system`

- **Why it matters:** 29 bordered card rows convey 29 name/date pairs — "a table pretending to be a card list" (review). `/solar-system` is 57 lines whose entire purpose is one outbound link to NASA Eyes, yet occupies a primary nav slot.
- **Solution:** Replace with an actual `<table>` (sortable by year optional); fold `/solar-system` into a `/learn` resource card, keep the URL alive as a redirect.
- **Effort/cost:** 4 hours combined. **Success criteria:** `/leadership` uses semantic table markup; `/solar-system` no longer appears as a standalone primary-nav destination.

### Group G — Explicitly Rejected Features (scored, not silently dropped)

Per the review's Feature Audit (Part 17), the following were evaluated and are **not recommended**, each with a linked alternative already in place:

| Feature | Verdict | Why |
|---|---|---|
| Equipment database | Do not build | Sky & Telescope does this better |
| Interactive star charts | Do not build | Stellarium Web already linked from `/learn` |
| Interactive planet explorer | Do not build | NASA Eyes already linked |
| Live satellite tracking | Do not build | Heavens-Above already linked |
| Live observatory feeds | Do not build | Operational burden a volunteer club cannot carry |
| Personalized dashboards | Do not build (yet) | No user base to personalize for |
| Achievement badges | Defer indefinitely | Needs an accounts system that doesn't exist |
| AI astronomy assistant | Do not build | Solves no problem this club has |
| Push notifications | Do not build | No email list yet — build that first (D2) |
| Observation logs / member accounts | Defer | Needs auth + database; real ongoing maintenance; revisit only after gallery (D1) and CMS (E1) prove adoption |

**Rationale, generalized:** every rejected item here trades a real, recurring maintenance burden for a capability a third-party service already provides for free, or for a capability with no demonstrated demand from the current audience. This is not a scope-limitation apology — it is the same discipline applied consistently that makes the "build" list trustworthy.

---

## 8. Additional Recommendations (beyond the review)

Items not explicitly flagged in the source review but that materially improve the outcome, identified from cross-referencing the review's own findings and current best practice:

1. **Add a `Content-Security-Policy` header** at the hosting layer restricting script sources to self + Bookwhen + Astrospheric. The review flags that both third-party scripts load with no CSP/SRI, but doesn't propose the specific header — this closes that gap cheaply at the hosting config layer (no app code change).
2. **Add a minimal CI workflow** (`astro check` + `astro build` on every PR). The review notes zero CI exists; this is the cheapest possible guardrail against a broken PR merging, especially once a CMS starts producing git commits from non-developers.
3. **Add an uptime monitor** (free tier of UptimeRobot or the host's built-in monitoring) on the homepage and `/events`, so a Bookwhen-embed failure or a hosting outage is caught before a member reports it.
4. **A "first star party" beginner page** answering exactly what a nervous first-timer needs to know (what to wear, what happens, is it okay to just watch, is it really free). Directly supports the site's stated mission and is nearly free to write once the core team is already producing content for Phase 1.
5. **A native fallback for both third-party embeds** (Bookwhen, Astrospheric): when either fails to load, render the same static data already being maintained for B2/structured data, with a "reserve by email" fallback link — this happened for real during the review (the Bookwhen embed failed to load) and currently leaves the page empty.
6. **Formalize a `docs/DESIGN-SYSTEM.md`** documenting the token system, spacing scale, and accessibility guidelines that currently exist only as implicit convention across the codebase — makes future contributions (developer or AI-assisted) consistent without tribal knowledge.
7. **A lightweight `robots.txt`/sitemap audit** to exclude `/404` and confirm `/solar-system`'s redirect doesn't create a soft-404 signal once it's folded into `/learn` (F3).
8. **Track "time to first real fact"** as an informal internal metric during QA — the review's mobile section found a phone visitor's first screen currently contains zero facts; this is a good regression check to run manually after every hero-related change (E2, H2).
9. **Register/verify a Google Business Profile** for the club (outside the codebase, but track as a task) — pairs directly with C9's address/map work and materially improves "astronomy club near me" local discovery, which the review flags as entirely absent.
10. **A designated "gallery curator" and "CMS publisher" role**, named to real people before D1/E1 ship — the review's own maintenance section stresses this, but it's easy to let slip as an implementation detail rather than a named prerequisite. Treat it as a blocking dependency, not a nice-to-have.

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Volunteer content owners never adopt the CMS | Medium | High | Pick a CMS with a Google-Docs-like UI (Decap/Sveltia), write a one-page how-to with screenshots, run the M4 acceptance test live with an actual officer |
| Board stalls on the dues/tiers decision, blocking B1 | Medium | High | Put it first on the Phase 1 content-gathering sprint agenda; ship the honest interim `mailto:`-with-template only as a dated stopgap, not a permanent state |
| Photography commissioning stalls (no photographer, no budget) | Medium | High | Start with a "bring your best shot" call to existing membership (D1) before commissioning anything |
| Scope creep toward Phase 4/backlog features before Phase 1–3 land | High | High | Phase gates in this document are load-bearing; nothing in §6/§2's Low tier starts before M3 |
| Payment processing for dues adds compliance overhead | Low | Medium | Use hosted checkout (Stripe Payment Links) rather than custom payment handling |
| Third-party embeds (Bookwhen, Astrospheric) remain single points of failure | Medium | Medium | Keep them for registration/live data, but add native fallback content (§8 item 5) |
| Small volunteer team burns out maintaining a bigger surface area | Medium | High | Every Phase 4 feature requires a named, funded owner before it's greenlit (§7 Group G, §6) |
| A CMS content edit ships a broken build | Low | Medium | Minimal CI (`astro check` + `astro build` on every PR, §8 item 2) |
| Gallery submissions raise licensing/consent questions | Low | Medium | Simple submission + license-to-use agreement before the gallery opens (D1) |
| Accessibility fixes regress on a future redesign | Low | Medium | Document the accessibility guidelines (§8 item 6) so future contributors, human or AI-assisted, inherit the bar automatically |

---

## 10. Resource Plan

### People

| Role | Time commitment | Where needed |
|---|---|---|
| Part-time developer/designer | 10–15 hrs/week for 12 weeks | Phases 1–3 |
| Board member(s) | One decision session (dues/tiers) + periodic content review | Phase 1 kickoff |
| Content-owning officer(s) | Ongoing, few hrs/week once CMS is live | All phases |
| Gallery curator (named volunteer role) | ~2 hrs/month ongoing | Phase 2 onward |
| CMS "Publisher" (named volunteer, not the developer) | Ongoing | Phase 2 onward, so the site doesn't revert to developer-dependent |
| Photographer (contracted, one evening + one day session) | External, Phase 3 | Commissioned shoot (L3) |

### Tools & software (all free or low-cost, matching the volunteer-maintained constraint)

| Purpose | Tool | Cost |
|---|---|---|
| CMS | Decap CMS or Sveltia CMS | Free (git-based) |
| Analytics | Plausible or Fathom | ~$9–14/month |
| Forms | Formspree | Free tier sufficient at this traffic volume |
| Newsletter | Buttondown or MailerLite | Free under ~1,000 subscribers |
| Search | Pagefind | Free (static, zero backend) |
| Payments | Stripe Payment Links | Free setup, transaction fee only |
| Uptime monitoring | UptimeRobot free tier | Free |

### Budget summary (full detail in the companion master plan §15)

| Tier | Range | Covers |
|---|---|---|
| Minimal | $2,000–$5,000 | All of Phase 1 + cheapest Phase 2/3 items; no CMS, no commissioned shoot |
| **Recommended** | **$10,000–$25,000** | Adds full CMS, `Hero.astro` redesign with a small commissioned shoot, all of Phase 3 |
| Premium | $50,000–$100,000 | Adds brand refresh, larger photography program, third-party accessibility audit |
| Visionary | $250,000+ | Member accounts platform, scroll-driven history narrative — **only with named, funded owners**, not before Phase 1–3 prove out |

---

## 11. Success Metrics

| KPI | Baseline (today) | Target | Measured via |
|---|---|---|---|
| Membership signups via the site | Unmeasurable (no form, no analytics) | Tracked from B1 launch | Form submissions / payment-link conversions |
| Event page → Bookwhen conversion | Unmeasurable | Baseline month 1, +20% by month 6 | Analytics goal tracking |
| Volunteer signups (Star Tours + general) | Unmeasurable (`mailto:` only) | Baseline at C3.3/H6 launch | Form submissions |
| Newsletter subscriptions | 0 | 100+ by month 6 | Provider dashboard |
| Gallery submissions | 0 | 20+ images by end of Phase 2 | CMS content count |
| Placeholder banners visible | 8 | 0 | Manual audit / grep |
| WCAG 2.2 AA conformance | Fails 2.4.11, borderline 2.4.13 | Passes both | axe/Lighthouse + manual keyboard audit |
| Mobile LCP | Borderline | Consistently "good" | Lighthouse CI |
| Organic search impressions ("star party phoenix" etc.) | Unmeasured, presumed minimal | Tracked from month 1 | Google Search Console |
| Volunteer self-sufficiency | 0% (fully developer-dependent) | M4 acceptance test passed | Direct observation, then quarterly spot-check |
| Time on site / bounce rate on `/join` | Unmeasured / presumed high | Baseline, then improve post-B1 | Analytics |

---

## 12. Project Timeline

```
Week 1–2   ██████████ Phase 1: Critical Foundation           → M1: Foundation shipped
Week 3–6   ████████████████ Phase 2: Premium Experience       → M2: Premium experience shipped
Week 7–10  ████████████████ Phase 3a: Community Growth        → M3: Community layer shipped
Week 11–12 ████████ CMS migration completion + handoff         → M4: CMS handoff (acceptance test)
Month 4–6  ░░░░░░░░░░░░░░░░ Low-burden Phase 4 backlog begins (lunar/meteor widgets)
Month 6–12 ░░░░░░░░░░░░░░░░ Photography program, brand/publication decisions revisited with real data
```

| Milestone | Target | Gate |
|---|---|---|
| M1 — Foundation shipped | End of Week 2 | Zero placeholder banners; join/events funnels functional; print bug + typo fixed |
| M2 — Premium experience shipped | End of Week 6 | Interior heroes art-directed; gallery live; design system documented |
| M3 — Community layer shipped | End of Week 10 | Newsletter, social, donate, testimonials, forms live |
| M4 — CMS handoff | End of Week 12 | A non-technical officer publishes one real event and one gallery image unassisted, on camera |
| 6-month review | Month 6 | Success Metrics (§11) baselines vs. actuals; decide whether Premium-tier spend is justified |
| 12-month review | Month 12 | Full year of usage data; any Visionary-tier item only enters planning here, with a named owner |

**Critical path:** the board's dues/tiers decision (B1) and content-gathering (A1) gate roughly half of Phase 1. Everything else in Phase 1 (bug fixes, accessibility, analytics) is content-independent and should start Day 1 regardless of that decision's timeline.

---

## 13. Implementation Checklist

### Phase 1 — Critical Foundation
- [ ] Content-gathering sprint kicked off: dues/tiers decision, officer roster, meeting time/address, press PDFs
- [ ] Fix print/PDF blank-page bug (`@media print` rule)
- [ ] Fix `atinfo@pasaz.org` typo
- [ ] Global `:focus-visible` ring implemented
- [ ] `scroll-margin-top` applied site-wide under sticky header
- [ ] Analytics (Plausible/Fathom) wired up
- [ ] All 8 placeholder banners removed (filled or deleted)
- [ ] `/join` states dues/tiers and offers a real signup or clearly-labeled interim path
- [ ] Real event dates live in HTML on homepage and `/events`
- [ ] `/join` and `/events` hero images replaced (stopgap)
- [ ] Address, meeting time, and map embed added to `/about`/`/events`
- [ ] Full 14-page QA pass against M1 gate complete

### Phase 2 — Premium Experience
- [ ] `Hero.astro` rebuilt with per-image focal point/tone/CTA slot
- [ ] Per-page hero assignments completed for all 8 interior pages
- [ ] `SpaceHero` moon lighting fixed; portrait CTA collision resolved
- [ ] Member call for astrophotography submissions sent
- [ ] Submission/license agreement drafted; gallery curator named
- [ ] `GalleryGrid` component + `/gallery` page + homepage strip live
- [ ] Second below-the-fold layout pattern shipped on ≥1 page
- [ ] APOD card clamped and reframed
- [ ] `.text-gradient` audited on all short headings
- [ ] `/leadership` converted to a real table
- [ ] `/solar-system` retired to a `/learn` resource card with redirect
- [ ] Font imports switched to Latin-only subsets; preload added
- [ ] Astro Content Collections schema defined
- [ ] Decap/Sveltia CMS configured against GitHub OAuth
- [ ] Events and press-releases migrated to Content Collections
- [ ] Contributor/Publisher roles assigned to named people

### Phase 3 — Community Growth
- [ ] Newsletter signup live in footer + `/join`
- [ ] Social links + donate button added to footer
- [ ] All `mailto:` flows (contact, Star Tours, volunteer) replaced with real forms
- [ ] 4–6 member testimonials/spotlights published
- [ ] Speaker profiles added for upcoming lecture-series events
- [ ] `FAQPage` JSON-LD added to `/learn`
- [ ] `Organization` + `Event` + `BreadcrumbList` JSON-LD live site-wide
- [ ] Per-page Open Graph images generated
- [ ] Pagefind search live
- [ ] Dark-sky-sites landing page published with internal links
- [ ] CMS extended to gallery, leadership, testimonials collections
- [ ] `docs/VOLUNTEER-GUIDE.md` written with real screenshots
- [ ] M4 acceptance test performed: officer publishes unassisted, on camera

### Ongoing / Phase 4 backlog (only after M3)
- [ ] Lunar phase widget shipped
- [ ] Meteor shower tracker shipped
- [ ] Commissioned photo shoot scheduled and completed
- [ ] CSP header added at hosting layer
- [ ] Minimal CI workflow (`astro check` + `astro build` on PR) added
- [ ] Uptime monitoring configured
- [ ] "First star party" beginner page published
- [ ] Native fallback content for Bookwhen/Astrospheric embeds shipped
- [ ] `docs/DESIGN-SYSTEM.md` written
- [ ] Google Business Profile registered/verified
- [ ] 6-month Success Metrics review conducted
- [ ] 12-month Success Metrics review conducted; Visionary-tier items (re-)evaluated only with named, funded owners

---

## Evaluation Against World-Class Standards & Remaining Gaps

Scoring this plan itself, not just the site, against what separates a good implementation plan from a 9.5–10/10 one across usability, performance, maintainability, accessibility, scalability, and overall experience:

**What this plan already gets right:** it is sequenced by dependency rather than by category (board decisions surfaced as the true bottleneck, not buried in a task list); every "build" recommendation is paired with rejected alternatives and a stated reason (§7 Group G); the CMS decision is treated as the load-bearing item it is, with an actual acceptance test rather than a "ship and hope" assumption; and low-maintenance-burden framing is applied consistently rather than selectively.

**Remaining gaps, and what would close them:**

1. **No explicit rollback/staging plan.** This document assumes every phase ships to production directly. A 9.5/10 plan would specify a staging environment (trivial with Astro's static output — a second Netlify/Vercel preview deploy) so the board can review dues/tiers copy and hero-image swaps before they go live, catching content errors before, not after, publication.
2. **No defined content-review SLA.** "Board reviews content" appears throughout but with no turnaround target. Add: officer content reviews are returned within 5 business days, or the item ships with a dated placeholder for that specific fact only (never a generic "placeholder" banner) and a follow-up date.
3. **No post-launch content-freshness owner.** The CMS solves *who can edit*, but not *who checks that events stay current*. Recommend a recurring (monthly) 15-minute "content health check" — is the next event dated correctly, is the gallery still being fed, is the newsletter still going out — owned by the same Publisher role, formalized in `docs/VOLUNTEER-GUIDE.md`.
4. **Accessibility is treated as a Phase 1 checklist item, not an ongoing practice.** A 9.5/10 plan pairs the WCAG fixes with a lightweight recurring audit (e.g., an annual automated axe/Lighthouse scan plus a manual keyboard pass on any new page template) rather than a one-time fix-and-forget — already partially addressed by §8 item 6's design-system documentation, but should be scheduled, not just documented.
5. **No explicit plan for measuring the photography program's actual ROI** before committing Premium-tier budget to it. Add a lightweight before/after comparison (engagement on pages with member photography vs. stock/NASA imagery, using the analytics already wired up in Phase 1) as a named checkpoint at the 6-month review, so the Premium-tier photography spend (§10) is evidence-based rather than aspirational.
6. **Scalability is under-specified for the one part of the site that could genuinely spike:** an event going viral (e.g., a notable astronomical event driving traffic to `/events` or the gallery). Static hosting on Netlify/Vercel/Cloudflare Pages already handles this trivially, but the plan should say so explicitly rather than leave it implicit, so it's not mistaken for an unaddressed risk during the 12-month review.
7. **No explicit accessibility statement/conformance page**, which the review's Premium budget tier mentions only as a paid third-party audit deliverable. A public, dated WCAG 2.2 AA conformance statement (even self-attested, ahead of any paid audit) is a near-zero-cost addition that most nonprofit sites at this maturity level skip, and it's the kind of detail that visibly separates a "world-class" nonprofit site from a merely good one.

None of these gaps are launch-blocking — they are the difference between a plan that gets the site to "very good, sustainably" (which this document already achieves) and one that is unambiguously best-in-class for its category over a multi-year horizon. Recommend folding items 1–3 into Phase 1 documentation work (near-zero incremental cost, since `docs/VOLUNTEER-GUIDE.md` is already being written in Phase 2/3), and treating items 4–7 as standing agenda items for the 6- and 12-month reviews already defined in §12.
