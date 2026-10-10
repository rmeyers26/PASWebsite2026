# Phoenix Astronomical Society — Implementation Master Plan

**Companion to:** `docs/EXPERT-REVIEW-2026.md` (the evaluation this plan implements)
**Stack assumed:** Astro 7, Tailwind 4, static output, deployed as-is today — every recommendation below is written against that reality, not a hypothetical rebuild.
**Constraint that shapes every decision in this document:** the site will be maintained by **volunteers with no engineering background**, on their own time, indefinitely. Anything that requires a developer to update after launch is a liability, not a feature.

---

## 1. Executive Summary

### Vision

Turn a website with a world-class hero and an unfinished body into the site a volunteer-run astronomy club can actually run its organization through: one place to learn when the next star party is, join, donate, see member photography, and read what the club has been doing since 1948 — updatable by a club officer with no code editor.

### Primary objectives

1. Close the membership and events funnels — the two things a visitor came to do.
2. Replace every placeholder and every generic stock-feeling section with real PAS content and photography.
3. Give non-technical volunteers a way to update events, press releases, and gallery content without a pull request.
4. Preserve and extend the parts of the current build that are already excellent (the `SpaceHero` component, the token system, the accessibility fundamentals, the Astro architecture).
5. Make the club findable — local SEO and event structured data, currently both at zero.

### Expected outcomes

| Outcome | From | To |
|---|---|---|
| Visitor can find the next event without leaving the site | No | Yes, in HTML, on the homepage |
| Visitor can become a member online | No — `mailto:` only | Yes — form or payment link |
| Club can update events/press/gallery without a developer | No | Yes — CMS-backed collections |
| Site shows member astrophotography | No | Yes — 20+ curated images |
| Public-facing "under construction" language | 8 banners | 0 |
| WCAG 2.2 AA conformance | Fails 2.4.11 | Passes |
| Event structured data | None | `Event` + `Organization` JSON-LD on every event |

### Estimated timeline

**12 weeks to a materially transformed site** (Phases 1–3 below), with Phase 4 as an ongoing 6–12 month backlog rather than a blocking milestone. This is calendar time assuming one part-time developer/designer (10–15 hrs/week) plus volunteer content contribution — not a full-time team.

### Major milestones

| Milestone | Target | Gate |
|---|---|---|
| M1 — Foundation shipped | End of Week 2 | Zero placeholder banners; join and events funnels functional; print bug and typo fixed |
| M2 — Premium experience shipped | End of Week 6 | Interior heroes art-directed; gallery live; design system documented |
| M3 — Community layer shipped | End of Week 10 | Newsletter, social, donate, testimonials, forms live |
| M4 — CMS handoff | End of Week 12 | A non-technical officer publishes one real event and one gallery image unassisted, on camera, as acceptance test |

### Critical success factors

1. **A volunteer must be able to publish content without this plan's author.** If M4's acceptance test fails, nothing else in this plan matters.
2. **Photography must be commissioned, not scraped.** No recommendation here is more important than getting a camera to a star party.
3. **The join and event flows must be measured**, not just shipped — analytics wired in Phase 1, or the club will not know if Phase 1 worked.
4. **Scope discipline.** Phase 4's advanced features are explicitly sequenced last because they are the ones most likely to become unmaintained. Do not let them jump the queue.

### Risks and mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Volunteer content owners never adopt the CMS | Medium | High | Pick a CMS with a UI closer to Google Docs than to GitHub (see §6); write a one-page how-to with screenshots; do the M4 acceptance test live with an actual officer, not a developer |
| Photography commissioning stalls (no photographer, no budget) | Medium | High | Start with a "bring your best shot" call to the existing membership before commissioning anything — ASIG members likely already have usable images sitting on hard drives |
| Scope creep toward Phase 4 features before Phase 1–3 land | High | High | This document's phase gates are load-bearing; Phase 4 tasks are explicitly not started until M3 |
| Payment processing for dues adds PCI/compliance overhead | Low | Medium | Use a hosted checkout (Stripe Payment Links, or a membership platform like WildApricot/MemberPlanet built for small nonprofits) rather than building custom payment handling |
| Third-party embeds (Bookwhen, Astrospheric) remain single points of failure | Medium | Medium | Keep them, but add native fallback content (see §7) so the page is never empty when they fail, as it was during this review |
| Small team burns out maintaining a bigger surface area | Medium | High | Every new feature in this plan is scored for maintenance burden (§13); Phase 4 items with high ongoing burden and low member-base justification are marked "defer" |

---

## 2. Prioritized Master Roadmap

### Phase 1 — Critical Foundation (Weeks 1–2)

Every item here was flagged **Critical** in the evaluation. Nothing in Phase 2–4 should start before these ship, because they are what makes the rest of the site trustworthy.

| Task | Description | Why it matters | Dependencies | Effort | Impact | Difficulty |
|---|---|---|---|---|---|---|
| **F1.1** Remove all 8 placeholder banners | Fill `PlaceholderNote` content with real copy or delete the section on `/`, `/join`, `/contact`, `/events`, `/learn`, `/press-releases`, `/about` (×2) | A public site cannot tell visitors it is unfinished | Content from club officers (dues, hours, address, officer roster) | 2 days content-gathering + 0.5 day dev | Very High | Easy (dev) / Moderate (content-gathering) |
| **F1.2** Fix the print/PDF blank-page bug | Add `@media print { .reveal { opacity: 1; transform: none } }` to `src/styles/global.css` | Every page currently prints as a hero followed by blank space; also affects screenshot tools and any non-scrolling renderer | None | 15 min | Medium | Easy |
| **F1.3** Fix the missing-space typo | `src/pages/press-releases.astro` — "contact us at" renders as `atinfo@pasaz.org` in the built HTML | Visible, embarrassing, three-second fix | None | 5 min | Low (visibility) / High (credibility) | Easy |
| **F1.4** Add a `:focus-visible` design token and apply it globally | Add a `.focus-ring` utility in `global.css` using `--color-nebula-teal`, apply via `@layer base *:focus-visible` | WCAG 2.2 SC 2.4.13 gap — currently only the skip link has a custom focus state | F4.1 (design system tokens) can inform styling but is not blocking | 3 hrs | Medium | Easy |
| **F1.5** Fix sticky-header focus obscuring | Add `scroll-margin-top: 4.5rem` to all focusable/anchorable elements site-wide (currently only `/sky-conditions` has it) | WCAG 2.2 SC 2.4.11 — Level AA failure on all 14 pages | None | 1 hr | Medium | Easy |
| **F1.6** Make `/join` state real information | Replace the "coming in a future phase" copy with actual dues, tiers, and what's included; at minimum, an honest paragraph plus a `mailto:` with a clear subject-line template if no payment processor is ready yet | Four CTAs across the site currently converge on a dead end | Board decision on dues/tiers (not a dev task — a decision task, see T-3.1 below) | 1 day dev once content exists | Very High | Moderate (blocked on board decision, not code) |
| **F1.7** Put real dates in `/events` and the homepage, in HTML | Pull the next 3–5 events from Bookwhen (manually at first, or via their API/export) into real markup, not just the iframe | The only place a date currently lives is inside a third-party iframe — invisible to search engines and to no-JS/failed-load visitors | Bookwhen data access (API key or manual copy process) | 1–2 days | Very High | Moderate |
| **F1.8** Replace the `/join` and `/events` hero images | Swap the `/join` conference-room photo and the near-black `/events` night shot for something that survives the `Hero.astro` opacity treatment (see F2.1) | Recruitment opens on a meeting room; events opens on a black rectangle | Needs at least a stopgap image before F2.1's full hero redesign | 2 hrs (using existing image library) | High | Easy |
| **F1.9** Add address, meeting time, and a map embed | `/about` and `/events` currently never state where or when anything happens | People must physically arrive somewhere | Confirm current facility-use agreement details with PVCC | 3 hrs dev + officer-confirmed content | Very High | Easy |
| **F1.10** Wire up basic analytics | Add a privacy-respecting analytics tool (Plausible or Fathom — no cookie banner needed, GDPR-safe by default, minimal maintenance) | Nobody currently knows if anyone reaches `/join`, or whether the Bookwhen embed fails for real visitors | None | 1 hr | Medium (enables everything downstream) | Easy |

**Phase 1 total estimated effort:** ~10–12 working days, spread across ~2 calendar weeks with content-gathering running in parallel with development.

---

### Phase 2 — Premium Experience (Weeks 3–6)

| Task | Description | Difficulty | Effort |
|---|---|---|---|
| **P2.1** Art-direct `Hero.astro` | Rebuild with per-image focal point (`object-position` prop), configurable scrim direction (top/left/radial), and a guaranteed CTA slot. See §8 for the full spec. | Moderate | 3 days |
| **P2.2** Fix the `SpaceHero` moon and portrait composition | Light the moon so its crater texture is visible; adjust the `composition.portrait` object in `SpaceHero.astro` so the CTA row at `mt-10` never sits inside Saturn's ring geometry | Moderate | 1 day |
| **P2.3** Build the member astrophotography gallery | New `/gallery` page + homepage strip; see §9 Gallery component spec | Moderate | 4 days |
| **P2.4** Second layout pattern below the fold | Break the card-grid monotony with one editorial/full-bleed pattern reused across `/about`, `/history`, `/learn` | Moderate | 3 days |
| **P2.5** Clamp and reframe the APOD card | Line-clamp to ~3 lines with "Read the full description on APOD," strip NASA's own promotional sentence, add a small "Courtesy of NASA" treatment that reads as curation rather than an embed | Easy | 3 hrs |
| **P2.6** `.text-gradient` audit | Restrict the gradient treatment to headlines ≥3 words / one line of `text-d1`/`text-d2`; short headings (`/press-releases`, `/history`, `/leadership`, `/contact`, `/404`) get solid `text-ink-primary` | Easy | 2 hrs |
| **P2.7** Real table for `/leadership` | Replace 29 bordered card rows with an actual `<table>` — sortable by year optional, not required | Easy | 3 hrs |
| **P2.8** Retire `/solar-system` as a standalone nav page | Fold its content into a `/learn` resource card; keep the URL alive as a redirect | Easy | 1 hr |
| **P2.9** Font loading fix | `@fontsource-variable/space-grotesk/latin.css` and `.../inter/latin.css` instead of the bare imports (drops 10 woff2 → 2); add `<link rel="preload">` for both in `BaseLayout.astro` | Easy | 2 hrs |

**Phase 2 total estimated effort:** ~4 weeks including content review cycles.

---

### Phase 3 — Community Growth (Weeks 7–10)

| Task | Description | Difficulty | Effort |
|---|---|---|---|
| **C3.1** Newsletter signup | Footer + `/join` embed, using a zero-maintenance provider (Buttondown or MailerLite free tier) | Easy | 3 hrs |
| **C3.2** Social links + donate button | Footer additions; donate via Stripe Payment Link or existing 501(c)(3) processor if one exists | Easy | 2 hrs |
| **C3.3** Replace remaining `mailto:` flows with real forms | Contact, Star Tours booking, volunteer signup, telescope loaner request — via a forms provider with a free/cheap tier and zero server maintenance (Formspree, or Netlify/Cloudflare Forms if hosting migrates there). `/join` is already excluded from this — it uses the production Paperform embed (see T-1.6) | Moderate | 3 days |
| **C3.4** Member spotlights / testimonials | New component + 4–6 short interviews with existing members (President, ASIG lead, a newer member, a Star Tours volunteer) | Moderate | 3 days (mostly content, not code) |
| **C3.5** Speaker profiles for the lecture series | Small content model addition to the events/press collections; retroactively tag past speakers where known | Easy | 2 days |
| **C3.6** FAQ schema on `/learn` | Wrap the existing 5 career FAQs in `FAQPage` JSON-LD | Easy | 1 hr |
| **C3.7** Organization + Event + BreadcrumbList JSON-LD | Site-wide structured data pass, see §12 | Moderate | 1 day |
| **C3.8** Per-page Open Graph images | Generate at build time from each page's hero image rather than sharing the 72px logo | Moderate | 1 day |

**Phase 3 total estimated effort:** ~4 weeks.

---

### Phase 4 — Advanced Features (Month 4 onward, backlog, not blocking)

Every item here was scored against maintenance burden versus current audience size. None are recommended before Phase 1–3 ship and prove out engagement.

| Feature | Verdict | Rationale |
|---|---|---|
| Lunar phase widget | **Build** — cheap, static-computable, no backend | Low burden, real utility |
| Meteor shower tracker | **Build** — same rationale, seasonal traffic driver | Low burden |
| Observation logs (member accounts) | **Defer** until membership platform (F1.6) is live and gallery (P2.3) proves people submit content | Requires auth + database — real ongoing maintenance |
| Live astronomy weather | **Keep existing embed** — already present via Astrospheric | No new work justified |
| Interactive star charts | **Do not build** — link Stellarium Web, already done on `/learn` | Rebuilding this is pure maintenance liability with no differentiation |
| Equipment database | **Do not build** — Sky & Telescope and vendor sites do this better | Out of scope for a club site |
| AI astronomy assistant | **Do not build** — solves no problem this club currently has | High maintenance, no demonstrated demand |
| Achievement badges | **Defer indefinitely** — needs a member base and accounts system neither of which exist yet | Revisit only if observation logs ship and see real usage |
| Push notifications | **Do not build** — the club doesn't have an email list yet (see C3.1); build that first | Sequencing issue, not a rejection |
| Personalized dashboards | **Do not build** at this stage | No user base to personalize for |
| Citizen science hub | **Keep as links** — Exoplanet Watch and Zooniverse already linked from `/exoplanets` and `/learn` | Sufficient as-is |

---

## 3. Task Breakdown (Sample — Phase 1, fully specified)

The following are written to the level of detail an AI coding assistant or junior developer needs to start without follow-up questions. Phase 2–4 tasks in §2 should be expanded to this level immediately before each phase begins, using this format as the template.

### T-1.1 — Remove placeholder banners

- **Owner:** Content (club officers) + Developer
- **Goal:** Zero instances of `<PlaceholderNote` remain in `src/pages/*.astro` with public-facing "needs real info" language.
- **Dependencies:** Officer roster, confirmed dues/benefits, confirmed observing-site details, press-release PDFs uploaded, confirmed contact-email ownership.
- **Acceptance criteria:**
  1. `grep -rc "<PlaceholderNote" src/pages/*.astro` returns 0 matches (or only internal, non-rendered dev comments).
  2. Each replaced section renders real content reviewed by a board member.
  3. No section is deleted without a board sign-off that the content genuinely isn't ready yet — a section that can't be filled should be hidden, not left as a public apology.
- **Priority:** Critical
- **Estimated effort:** 0.5 day dev per banner once content exists; content-gathering is the true bottleneck (see the content strategy in §5 for exactly which facts to chase from whom).
- **Expected user impact:** Removes the single biggest credibility hit on the site.

### T-1.2 — Fix the print/PDF blank-page bug

- **Owner:** Developer
- **File:** `src/styles/global.css`
- **Change:**
  ```css
  @media print {
    .reveal {
      opacity: 1;
      transform: none;
    }
  }
  ```
  Add directly below the existing `@media (prefers-reduced-motion: reduce) { .reveal { ... } }` block.
- **Acceptance criteria:** `Ctrl/Cmd+P` print preview on `/` shows all seven sections below the hero, not a blank page.
- **Priority:** Critical
- **Estimated effort:** 15 minutes
- **Expected user impact:** Low frequency, high severity when it happens (anyone trying to print event details or share a page as PDF).

### T-1.3 — Fix the missing-space typo

- **Owner:** Developer
- **File:** `src/pages/press-releases.astro`
- **Change:** Locate the line rendering "Members of the media are welcome to contact us at" immediately followed by the `<a href="mailto:...">` — add a literal space or `{' '}` JSX-style expression before the anchor.
- **Acceptance criteria:** Built HTML reads "contact us at info@pasaz.org" with a visible space.
- **Priority:** Critical
- **Estimated effort:** 5 minutes

### T-1.4 — Global focus-visible ring

- **Owner:** Developer
- **File:** `src/styles/global.css`
- **Change:** In `@layer base`, add:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-nebula-teal);
    outline-offset: 3px;
    border-radius: 2px;
  }
  ```
  Verify it does not conflict with the existing skip-link's own focus styling (it should simply reinforce it).
- **Acceptance criteria:** Tabbing through any page shows a visible teal ring on every link, button, and `<summary>`.
- **Priority:** Critical (WCAG 2.2 AA)
- **Estimated effort:** 3 hours including cross-browser check

### T-1.5 — scroll-margin-top site-wide

- **Owner:** Developer
- **File:** `src/styles/global.css`
- **Change:** Add to `@layer base`:
  ```css
  :target,
  [tabindex] {
    scroll-margin-top: 4.5rem;
  }
  a,
  button,
  input,
  select,
  textarea,
  summary {
    scroll-margin-top: 4.5rem;
  }
  ```
  (4.5rem clears the ~69px sticky header measured in the review; adjust if the header height changes.)
- **Acceptance criteria:** Tab through a long page (e.g. `/sky-conditions` or `/history`) and confirm no focused element is hidden under the header.
- **Priority:** Critical (WCAG 2.2 AA)
- **Estimated effort:** 1 hour

### T-1.6 — `/join` funnel

- **Status: Done.** The production site (`pasaz.org`, currently on Google Sites) already runs real membership signup through a live Paperform form (`data-paperform-id="pasazmembership"`), handling tiers, add-ons, and payment. `src/pages/join.astro` now embeds that same form directly, replacing the old placeholder mock (a fake "PayPal" modal that never submitted anywhere). Dues table stays as a static, CMS-driven info display (`src/content/membership/membership.json`) above the embed.
- No further decision needed here — the payment processor question (Stripe Payment Link vs. WildApricot vs. Paperform's own) is already settled in production.
- **Acceptance criteria:** A visitor can state, in one sentence after reading the page, what membership costs and what they get, and can complete signup without leaving the page.
- **Priority:** Critical — resolved.

### T-1.7 — Real event dates in HTML

- **Owner:** Developer + whoever manages the Bookwhen calendar
- **Approach:**
  1. Short-term: manually maintain a `src/data/events.ts` (or Content Collection, see §6) array of the next 3–5 events, updated weekly by whoever already updates Bookwhen — same effort, different destination.
  2. Medium-term: script a build-time fetch from Bookwhen's API (they have one) to auto-populate this array, removing the manual step entirely.
- **Render:** A new `<UpcomingEvents />` component on the homepage replacing the current type-only cards, plus real entries at the top of `/events` above the iframe.
- **Acceptance criteria:** View source on `/` shows actual dates, titles, and locations for the next 3 events, with no JavaScript required to see them.
- **Priority:** Critical
- **Estimated effort:** 1–2 days for the manual version; add 1 day later for the API automation.

---

## 4. Design System Plan

The current token system (`src/styles/global.css`) is genuinely strong — extend it, don't replace it.

### Typography

| Role | Current | Recommendation |
|---|---|---|
| Display | Space Grotesk Variable | **Keep for Phase 1–2** (low risk, already well-integrated). For Phase 4/rebrand: consider a display face with more character — see the Branding section of the review for the "Sonoran night" direction. Not urgent. |
| Body | Inter Variable | Keep. Inter's legibility at small sizes is a real asset for a content-heavy site. |
| Type scale | `--text-d1`…`--text-d7`, fluid `clamp()` | Keep as-is; it's better infrastructure than most sites this size have. Add two more steps if the gallery/editorial layout (P2.4) needs a pull-quote size between `d3` and `d4`. |

### Color palette

Keep the existing tokens for Phase 1–3 (`--color-space-*`, `--color-nebula-*`, `--color-ink-*`) — a palette swap is a Phase 4/rebrand decision, not a foundation task, and re-tokenizing mid-implementation risks regressions across 14 pages built on the current names.

**Do add now:**

```css
@theme {
  /* Semantic status colors, distinct from the decorative nebula accents */
  --color-success: #4ade80;   /* already exists as nebula-green — alias it semantically */
  --color-warning: #f5b942;   /* already exists as nebula-amber — alias it semantically */
  --color-danger: #f26d6d;    /* already exists as nebula-red — alias it semantically */
}
```

This lets components (form validation states, event-status pills) use `--color-success`/`--color-warning`/`--color-danger` semantically without overloading the decorative accent tokens, which stay free for card theming.

### Spacing & grid

Already consistent (`py-20` section rhythm, `max-w-{3xl…7xl}` per content type). Document it as a rule rather than a convention:

| Content type | Container |
|---|---|
| Long-form manifesto/quote | `max-w-3xl` |
| Standard prose page | `max-w-4xl` |
| Resource/link grids | `max-w-5xl` |
| Card grids | `max-w-6xl` |
| Full-width nav/gallery | `max-w-7xl` |

### Components needing new states (beyond what §9 specifies)

- **Buttons:** add a `.btn-primary:disabled` and `.btn-primary[aria-busy]` state for form submissions (C3.3).
- **Cards:** add a `.card-testimonial` variant (quote mark, attribution line) for C3.4.
- **Forms:** no form components exist yet — build `.field`, `.field-error`, `.field-label` as part of C3.3, following the same token system (`--color-strong` border, `--color-danger` for error state).

### Dark mode / light mode

The site is currently **dark-only by design** (`color-scheme: dark` is declared deliberately in `global.css`, with a comment explaining the starfield/WebGL hero are inherently dark surfaces). **Recommendation: keep it dark-only through Phase 3.** A light mode is a substantial design and QA effort (every card, gradient, and shadow would need a second pass) for a site whose entire visual identity — starfield, nebula glows, WebGL hero — is built around a dark canvas. Revisit only as a Phase 4/rebrand-scale decision, not before.

### Accessibility guidelines (add to CLAUDE.md or a `docs/DESIGN-SYSTEM.md`)

1. All interactive elements get `:focus-visible` (T-1.4) — no exceptions.
2. Minimum contrast: body text 7:1 against its surface (already achieved — preserve it), UI chrome 3:1 (already achieved via `--color-strong`).
3. Any new animation must respect `prefers-reduced-motion` following the existing tiered pattern in `SpaceHero.astro` (ambient motion preserved, input-driven motion cut).
4. Any new sticky/fixed element must be accounted for in `scroll-margin-top` calculations.

### Brand guidelines

Formalize what already exists implicitly:
- Logo: never below 48px in any live placement (currently violated at 36px in the header — bump `NavBar.astro`'s `Image` to `width={96} height={96}` rendered at `h-12 w-12`).
- Voice: the homepage manifesto copy ("Most people meet us holding a rock older than the Earth") is the reference standard — plainspoken, specific, unafraid of a long sentence, never corporate. Any new copy (testimonials, event descriptions, gallery captions) should be edited against that bar.

---

## 5. Content Strategy

### Pages needing rewriting

| Page | Problem | Action |
|---|---|---|
| `/join` | Generic benefits, no dues, no signup | Full rewrite once T-1.6 decision lands |
| `/exoplanets` | Generic encyclopedia content, minimal PAS relevance | Add a PAS-specific section: which members observe exoplanet transits, ASIG involvement, a local observing challenge |
| `/solar-system` | A single outbound link wearing a page costume | Fold into `/learn` as a resource card (P2.8); do not maintain as a standalone page |
| Homepage "Upcoming Events" | No actual events | Replace with real data (T-1.7) |

### Missing content (content that does not exist anywhere on the site today)

- Dues and membership tiers
- Meeting time and location (recurring cadence, not just "PVCC Black Mountain")
- Full current officer roster and contact roles beyond the president
- Speaker bios/topics for the lecture series (forward-looking, not just past press releases)
- Member testimonials/spotlights
- A "what to expect at your first star party" beginner-facing page
- Youth/family-specific content (currently four outbound links only)

### SEO improvements
See §12 in full; content-specific items:
- Rewrite `/exoplanets` and `/sky-conditions` meta descriptions to target "exoplanet observing phoenix" and "dark sky sites arizona" respectively — both currently generic.
- Add a dedicated, linkable page for the Bortle-rated observing site list (currently a section of `/sky-conditions`) — it's the strongest content asset on the site and deserves its own URL and internal links pointing at it with descriptive anchor text.

### Photography needs (see also P2.3, §9 Gallery)

1. **Immediate (Phase 1 stopgap):** audit existing `src/assets/images/` for the least-bad night/observing shots to replace the `/join` and `/events` heroes without waiting for a new shoot.
2. **Commissioned (Phase 2):** one evening shoot at a public star party — members at eyepieces, red-light-lit faces, wide shot of the PVCC pad with telescopes silhouetted against a darkening sky. One daytime shoot for `/join`, `/learn`, `/about` — natural light, members actually engaged in conversation, not posed.
3. **Sourced from membership (Phase 2, cheapest option, start here first):** an open call to ASIG members for their best 20–30 astrophotography images, with a simple submission + license-to-use agreement (see §9 Gallery for the intake process).

### Illustration needs

Minimal — this site should stay photography-led, not illustration-led, given its subject matter. The one exception: simple line-art icons (replacing the emoji in `SkyConditions.astro`) for a more considered, on-brand feel. Low priority.

### Educational opportunities

- Turn the 5-question `/learn` career FAQ into an `FAQPage` (C3.6) — it's the most substantive content on the site and currently gets zero SEO credit for it.
- A genuine "Start Here" sequenced beginner path (P4 in the roadmap table, §2) rather than the current flat resource-link list.

### Calls-to-action audit

| Page | Current CTA | Problem | Fix |
|---|---|---|---|
| `/events` hero | None | Asks a question, answers nothing | Add "See This Month's Events ↓" anchor CTA |
| `/join` hero | None | States a headline, offers nothing to click | Add primary CTA once T-1.6 ships |
| Homepage APOD section | None | Dead-ends into NASA's own promotional line | Replace with "See More on APOD ↗" + internal "Share Your Own Photo" link to the new gallery |

### Member success stories
Format each as: name, how long a member, what they observe, one specific memorable moment, one photo (if available). Four to six is enough for launch (C3.4) — do not over-scope this into a full interview program before the core funnel is fixed.

### Beginner resources
Already reasonably good (`/learn` Kids Corner, career FAQ, resource groups). Add: a single "first star party" page answering exactly what a nervous first-timer needs to know (what to wear, what happens, is it okay to just watch, is it really free). This is cheap to write and directly supports the site's stated mission.

---

## 6. Technical Implementation Plan

### Architecture — keep, don't replace

Astro 7 + Tailwind 4 + static output remains the right call. Do not migrate to Next.js/React or a headless-CMS-driven SPA — that would trade a fast, simple, mostly-JS-free site for a slower, harder-to-maintain one, for no benefit this club needs.

### The one architectural gap: content is hardcoded

**Recommendation: adopt Astro Content Collections**, backed by a **git-based visual CMS**, not a database-backed headless CMS. This is the single highest-leverage technical decision in this plan, because it's what makes Phase 1–3's content changes maintainable by volunteers afterward, not just achievable once by a developer.

**Specific recommendation: [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) or [Sveltia CMS](https://github.com/sveltia/sveltia-cms)**, configured against the same GitHub repo, editing Markdown/JSON files that Astro Content Collections already consume as its data source. Why this over a hosted headless CMS (Sanity, Contentful):

- **Zero recurring cost** — it reads and writes directly to the GitHub repo via OAuth, no separate hosted database.
- **No new infrastructure to maintain** — the "backend" is the same git repo the site already deploys from.
- **A volunteer edits through a form-based UI** (title, date, image upload, rich text) — never sees YAML or Markdown syntax directly, never touches a terminal.
- **Every edit is a git commit**, so there's a full audit trail and instant rollback if a volunteer makes a mistake — critical when you can't rely on the same person always being available to fix it.

**Migrate to Content Collections first, for:**
1. Events (`src/content/events/`) — replaces the T-1.7 array once F1.7 proves the format works
2. Press releases (`src/content/press-releases/`) — replaces the hardcoded logic in `press-releases.astro`
3. Gallery images (`src/content/gallery/`) — new, for P2.3
4. Officer roster (`src/content/leadership/`) — replaces the array in `leadership.astro` and the placeholder on `/about`
5. Testimonials (`src/content/testimonials/`) — new, for C3.4

**Do not migrate** the mostly-static informational pages (`/history`, `/exoplanets`, learning resource lists) — their content changes rarely enough that a developer-mediated PR is fine, and over-migrating adds CMS surface area for no real benefit.

### Hosting

The site is hosted on Cloudflare Pages (migrated from Netlify), connected to the `EditorPAS/PASAZ2026` GitHub repo. Since Cloudflare Pages has no built-in git-based CMS auth equivalent to Netlify's identity/Git Gateway, Sveltia's GitHub OAuth backend is used with a self-hosted `sveltia-cms-auth` Cloudflare Worker (see `workers/sveltia-cms-auth/`).

### Search

Add **[Pagefind](https://pagefind.app/)** — a static-search library purpose-built for exactly this kind of site (Astro/Eleventy/Hugo static builds). It indexes the built HTML at deploy time and ships a small WASM search index with zero backend, zero ongoing cost, and zero maintenance burden. This directly answers the "no search" gap flagged in the review without introducing a service to run.

### Analytics

Plausible or Fathom (see F1.10) — cookieless, no consent banner needed, minimal dashboard complexity appropriate for volunteer review.

### Forms

Formspree (or the hosting provider's native forms if migrating to Netlify/Cloudflare) — no backend to run, generous free tier for a club's traffic volume, email notification built in.

### Performance optimization
Already covered in depth in the evaluation (§13 there) — carried into this plan as P2.9 and the general Phase 1–2 hygiene pass. No new tooling needed; these are configuration fixes to the existing Astro/Vite build.

### Image optimization
Already well-handled by Astro's built-in `<Image>` pipeline — extend the same pattern to every new image added in Phase 2–3 (gallery, testimonials, new heroes). No new tooling needed.

### Security
- Add `Content-Security-Policy` headers at the hosting layer restricting script sources to self + the legitimate third parties (Bookwhen, Astrospheric, and now Paperform for the `/join` embed) — currently all load with no CSP or SRI at all.
- No user-generated content is accepted anywhere yet (forms go to Formspree, not the site's own storage) — keep it that way until there's a real reason to accept uploads directly (e.g., a future gallery submission flow), which would need its own moderation and storage review at that time.

### CI/CD
Add a minimal GitHub Actions workflow: `astro check` + `astro build` on every PR (already runs locally via `npm run build`; just needs to run in CI so a broken PR can't merge). This is the cheapest possible guardrail given there are currently zero tests and zero CI.

### Monitoring
Uptime check (e.g. a free tier of UptimeRobot or the hosting provider's built-in monitoring) pointed at the homepage and `/events` — enough to know if the site or the Bookwhen embed goes down, without building custom infrastructure.

### Backups
If migrating to a CMS, the git history *is* the backup — no additional backup system needed as long as GitHub remains the source of truth.

### Scalability / future-proofing
Static output on any of the recommended hosts scales trivially for this traffic profile — not a real risk. The actual future-proofing question is content ownership (git + CMS, addressed above), not infrastructure.

### Recommended folder structure additions

```
src/
  content/
    config.ts          # Content Collection schemas (events, press-releases, gallery, leadership, testimonials)
    events/
    press-releases/
    gallery/
    leadership/
    testimonials/
  components/
    UpcomingEvents.astro
    GalleryGrid.astro
    TestimonialCard.astro
    SpeakerProfile.astro
public/
  admin/
    config.yml          # Decap/Sveltia CMS configuration
    index.html
```

### Coding standards
Formalize what's already implicitly followed: comments explain *why*, not *what* (already the house style — preserve it); Tailwind utility-first, component-scoped `<style>` blocks only for things utilities can't express (keyframes, `@supports` gates); every new interactive component gets a reduced-motion and keyboard-operability check before merge, matching the existing bar set by `NavBar.astro` and `SpaceHero.astro`.

---

## 7. UX Improvement Plan

| Flow | Current friction | Fix |
|---|---|---|
| **Navigation** | Good; minor gaps (no Home in mobile menu, no `aria-haspopup`) | Add both — trivial |
| **Search** | None | Pagefind (§6) |
| **Membership flow** | Dead-ends at `mailto:` | T-1.6 |
| **Event registration** | Entirely inside a third-party iframe, no fallback if it fails | Add native fallback: when the Bookwhen embed fails to load (already has failure-handling logic in `sky-conditions.astro`'s Astrospheric pattern — reuse it here), show the T-1.7 static event list with a "reserve by email" fallback link |
| **Newsletter signup** | Doesn't exist | C3.1 |
| **Volunteer signup** | `mailto:` only | C3.3 |
| **Contact forms** | `mailto:` only, ×4 addresses | C3.3 |
| **Mobile navigation** | Solid; only real gap is no Home link | Minor fix, bundle with nav polish |
| **User onboarding** | No "first star party" guidance | New page, see §5 |

### Friction-reduction principles for every new flow
1. Never require an account to view public information (events, gallery, press releases).
2. Every form gets inline validation and a clear success state — no "your message has been sent" that leaves the user wondering if it worked (currently untestable since no forms exist; set the bar now for C3.3).
3. Every third-party embed gets a native fallback rendered from the same data, so a failed script never means an empty page (this already happened during the review with the Bookwhen embed).

---

## 8. Visual Redesign Plan (Hero component spec — `Hero.astro`)

This is the single highest-value visual change in Phase 2 (P2.1), specified in full because it touches eight pages.

### Current problem
One `opacity-60` + one scrim gradient applied uniformly regardless of source image brightness, subject placement, or headline length. Night photos go unreadably dark; daytime photos survive but headlines land on faces with no control over where.

### Recommended component API

```astro
---
interface Props {
  image: ImageMetadata | string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** 'dark' for night/high-contrast source photos (lighter scrim, less darkening);
   *  'bright' for daytime photos (current opacity-60 treatment is fine here) */
  tone?: 'dark' | 'bright';
  /** CSS object-position value — lets each page keep faces/subjects out of the text column */
  focalPoint?: string; // e.g. '80% 30%'
  /** Where the text column sits, so the scrim direction can follow it */
  align?: 'center' | 'left';
}
---
```

### Per-page assignment (fill in during P2.1)

| Page | `tone` | `focalPoint` | Notes |
|---|---|---|---|
| `/events` | `dark` | subject-dependent | Needs a brighter treatment or a genuinely bright replacement image — the current fireworks shot cannot survive any dark scrim |
| `/join` | `bright` | face out of center column | Replace image entirely per F1.8/P2.3 |
| `/learn` | `bright` | shift right so the man's face clears the headline | Immediate fix even before a new photo is sourced |
| `/star-tours` | `dark` (already works reasonably) | keep current | Lowest priority in this pass |
| `/about`, `/history`, `/leadership`, `/press-releases`, `/contact` | n/a | n/a | These currently use the centered-text-only variant; §3 Visual Design flagged the inconsistency — either give them a photographic hero too (preferred, for consistency) or formally keep the text-only treatment as a deliberate "reference" page type and document it as such |

### Per-page notes for the remaining pages (from the evaluation's page-by-page findings)

- **Homepage:** `SpaceHero` only — no change needed here, covered by P2.2.
- **`/exoplanets`, `/solar-system`:** currently use placeholder SVG heroes (`placeholder-hero-exoplanets.svg`, etc.) — lowest priority for real photography since P2.8 folds `/solar-system` into `/learn` anyway; `/exoplanets` can keep an illustrative/diagrammatic hero rather than needing a photo (this is the one page category where illustration is more honest than forcing a photo that doesn't exist).
- **`/sky-conditions`:** already uses a strong, specific EAA-rig night photo — keep as reference example for what "dark tone" should look like once other pages are rebuilt.

---

## 9. Component Inventory

| Component | Purpose | Variants | States | Responsive behavior | Accessibility requirements |
|---|---|---|---|---|---|
| `SpaceHero` (exists) | Homepage WebGL hero | n/a (homepage only) | loading → ready; reduced-motion tier | Frustum-relative recomposition, already handled | Already strong — preserve reduced-motion tiering when editing (P2.2) |
| `Hero` (rebuild, P2.1) | Interior page hero | `tone: dark/bright`, `align: center/left` | n/a | `object-position` per instance | Alt text required prop, no default fallback string |
| `UpcomingEvents` (new) | Homepage + `/events` real event list | Compact (homepage, 3 items) / full (`/events`, all upcoming) | loading, empty ("no events scheduled — check back soon"), error (Bookwhen fetch fails) | Stacks to 1-col under `sm` | Dates in real `<time datetime>`, list semantics, not divs |
| `GalleryGrid` (new) | Member astrophotography | Homepage strip (3–4 images) / full `/gallery` masonry | n/a | CSS grid, `auto-fill`, `minmax` | Every image needs a real alt describing the object photographed, not just "astrophotography image" |
| `TestimonialCard` (new) | Member spotlights | Quote-only / quote + photo | n/a | Single column mobile, 2–3 col desktop | Attribution as `<cite>`, not styled `<span>` |
| `SpeakerProfile` (new) | Lecture series speaker bios | Compact (event list) / full (dedicated bio) | n/a | n/a | n/a |
| `Timeline` (exists) | History page | n/a | n/a | Already responsive | Already fine |
| `PhotoGrid` (exists) | Generic photo grid | color / grayscale | n/a | Already responsive | Verify all captions remain descriptive when reused for gallery-adjacent content |
| `Breadcrumbs` (exists) | Wayfinding | n/a | n/a | Already fine | Already fine — add `BreadcrumbList` JSON-LD (C3.7) alongside, don't change the visible component |
| `NavBar` (exists) | Primary nav | n/a | open/closed per dropdown | Already strong | Add `aria-haspopup="true"` to dropdown summaries; add Home to mobile menu |
| `Footer` (rebuild, C3.1/C3.2) | Site footer | n/a | n/a | Already responsive | Add newsletter form + social links with proper `aria-label`s per icon link |
| `SearchBar` (new, via Pagefind) | Site search | Header-embedded / dedicated `/search` page | empty, results, no-results | Modal on mobile, inline on desktop | Full keyboard operability, results announced via `aria-live` |
| `EventCard` (new, part of `UpcomingEvents`) | Single event display | With/without image | past (grayed, if shown in an archive) / upcoming | n/a | Structured `<time>`, not a formatted string |
| `Form` primitives (new, C3.3) | Contact/volunteer/Star-tours request | n/a | default, focus, error, submitting, success | Full-width mobile, constrained desktop | Labels always visible (no placeholder-as-label anti-pattern), errors announced via `aria-describedby` |

---

## 10. Animation & Motion Plan

The current motion system (documented in the evaluation's Part 15) is already restrained and well-built — the plan here is **extend the existing patterns, don't add new categories of motion.**

| Opportunity | Recommendation | Rationale |
|---|---|---|
| Page transitions | Keep Astro's default `ClientRouter` cross-fade; do not add a custom transition | The existing one is unobtrusive and correctly torn down; a custom one adds risk for no clear benefit |
| Micro-interactions | Extend `.card:hover` pattern to the new `TestimonialCard` and `EventCard` — same lift + glow, don't invent a new hover language | Consistency > novelty |
| Hover effects | Add a subtle underline-reveal on inline text links (currently plain `hover:text-nebula-teal` with no motion) | Small, cheap, matches the site's existing restraint |
| Parallax | Keep the one existing signature moment (the homepage photo band); do not add parallax elsewhere — one is a signature, three is a gimmick | Explicitly stated in the evaluation as a strength precisely because it's singular |
| 3D planet animations | Already exists in `SpaceHero` — do not duplicate elsewhere on the site (e.g., don't add a second WebGL scene to `/solar-system`, which is being folded into a link anyway per P2.8) | One WebGL scene per site is the right budget for a volunteer-maintained project |
| Constellation animations | Not recommended as a new build — `/learn` already links to Stellarium Web, which does this better than a custom build could | Avoid maintenance liability for a solved problem |
| Loading animations | Add a simple skeleton state for `UpcomingEvents` and `GalleryGrid` while their data loads | Prevents layout shift and communicates "working," not "broken" |
| Scroll animations | Keep the existing `.reveal` pattern; fix the print bug (T-1.2) as part of this, don't rebuild the mechanism | It already works correctly for real users — the only bug is print-context |
| Interactive backgrounds | Keep `Starfield.astro` as-is; do not add a second ambient background system | The evaluation flagged four simultaneous background systems (orbs + CSS starfield + WebGL starfield + nebula sprites) as already at the edge of "overdesigned" — do not add a fifth |

### Guardrails for any new motion (apply to every item above)
1. Every new animation must have a `prefers-reduced-motion: reduce` fallback, following the tiered pattern already established in `SpaceHero.astro` (ambient motion can stay; input-driven or attention-grabbing motion must be cut).
2. No new animation should introduce a scroll or mousemove listener if a CSS-only solution (as the existing parallax band demonstrates) can achieve the same effect.
3. Budget check: if a proposed animation requires new JavaScript, ask whether it can instead be CSS `animation-timeline`/`@starting-style` first — both are already proven patterns in this codebase.

---

## 11. Performance Optimization Plan

Directly actionable versions of the evaluation's Part 13 findings:

| Fix | File(s) | Change |
|---|---|---|
| Font subsetting | `src/layouts/BaseLayout.astro` | Import `@fontsource-variable/space-grotesk/latin.css` and `@fontsource-variable/inter/latin.css` instead of the bare package imports |
| Font preload | `src/layouts/BaseLayout.astro` `<head>` | Add `<link rel="preload" as="font" type="font/woff2" href="..." crossorigin>` for the two latin woff2 files actually used |
| Third-party script loading | `src/pages/events.astro` | Add `defer` to the Bookwhen `iframe_resizer.js` script tag; add `<link rel="preconnect" href="https://cdn.bookwhen.com">` |
| Third-party script loading | `src/pages/sky-conditions.astro` | Add `<link rel="preconnect" href="https://s-v1-galaxy-direct.astrospheric.com">`; cap the polling loop's total wait more conservatively if real-world testing shows it rarely needs the full 5 seconds |
| Image budget for new content | Gallery, testimonials, new heroes | Use Astro's `<Image>` with the same `widths`/`sizes` pattern already established in `Hero.astro`/`PhotoGrid.astro` — no new tooling, just consistent application |
| CSS bundle | n/a | No action needed yet — 46KB single bundle is reasonable at this scale; revisit only if Phase 2–3 additions push it meaningfully higher |
| JS budget | n/a | three.js's idle-deferred loading pattern is correct and should be the template for any future heavy client-side feature (e.g., if Pagefind's WASM bundle needs similar deferral — verify at implementation time) |

**Core Web Vitals target:** maintain current "good" desktop LCP/CLS/INP; close the mobile LCP gap specifically via the font-loading fix above, which is the one concrete regression identified.

---

## 12. SEO & Discoverability Plan

| Area | Action |
|---|---|
| **Structured data — Organization** | Add site-wide JSON-LD in `BaseLayout.astro`: `@type: NGO` (or `Organization`), name, url, logo, `sameAs` (once social links exist per C3.2), and `address` (once F1.9 confirms the physical meeting location) |
| **Structured data — Event** | Generate per-event JSON-LD from the same Content Collection data powering `UpcomingEvents` (T-1.7/§6) — `@type: Event`, `startDate`, `location`, `organizer`, `isAccessibleForFree: true` for public star parties |
| **Structured data — BreadcrumbList** | Wrap the existing `Breadcrumbs.astro` output in matching JSON-LD — the visible component doesn't need to change, just add the schema alongside it |
| **Structured data — FAQPage** | Wrap the five `/learn` career FAQs (C3.6) |
| **Open Graph images** | Move off the shared 72px logo (C3.8) — generate per-page OG images at build time from each page's actual hero photo using Astro's image pipeline or a build-time OG-image library (e.g. `@vercel/og` or `astro-og-canvas`, either compatible with static output) |
| **Local SEO** | Add `LocalBusiness`-adjacent NAP (name/address/phone-or-email) block to the footer once F1.9 lands; register/verify a Google Business Profile (outside the codebase, but should be tracked as a task) |
| **Content clusters** | Build the dedicated dark-sky-sites landing page (flagged in §5) and interlink it from `/events`, `/sky-conditions`, and `/learn` with descriptive anchor text — currently zero internal links point at this content with meaningful anchors |
| **Metadata** | Already strong (unique titles/descriptions per page) — extend the same discipline to every new page created in this plan (`/gallery`, speaker profiles, dark-sky landing page) |
| **Image SEO** | Ensure every new gallery image has a genuinely descriptive `alt` (object name, date/location if known) — this is also an accessibility requirement, not just SEO |
| **Backlink opportunities** | Outside the codebase: submit the club to the Astronomical League's affiliate club directory, Night Sky Network's club finder (PAS is already a member per `/about` — confirm the listing links back), and local Phoenix-area event directories. Track as a content/marketing task, not a dev task. |

---

## 13. Maintenance & Sustainability Plan

This section is the difference between a plan that works for three months and one that works for ten years.

### Automation
- CMS-driven content (events, press releases, gallery, leadership, testimonials) removes the need for a developer in the loop for routine updates.
- CI (`astro check` + `astro build` on every PR, §6) catches broken changes before they reach production, even ones made through the CMS's git-backed commits.
- Consider a scheduled rebuild (daily) so the APOD integration and any Bookwhen-API-sourced event data stay fresh without a human remembering to redeploy.

### Content workflows
1. **Events:** whoever already manages the Bookwhen calendar adds the same event to the CMS (or, once F1.7's API automation ships, this step disappears entirely).
2. **Press releases:** upload PDF + fill in a CMS form (headline, date, summary) — replaces manually editing `press-releases.astro`.
3. **Gallery submissions:** members submit via the new contact form (C3.3) with a simple release-to-use statement; a designated "gallery curator" volunteer role reviews and adds approved images via the CMS.

### Approval process
Recommend a lightweight two-role model in the CMS: **Contributor** (can create/edit drafts) and **Publisher** (can push live) — maps naturally to "any officer can draft an event" but "only the webmaster or a designated second officer publishes," preventing accidental live-site errors without creating a bottleneck.

### Documentation
Produce a single `docs/VOLUNTEER-GUIDE.md` (or a CMS-embedded help page) with screenshots covering:
- How to add an event
- How to add a press release
- How to submit/approve a gallery image
- How to update the officer roster
- Who to contact (i.e., which developer/agency) if something breaks

This should be written *after* the CMS is live, using real screenshots, and tested by having an actual non-technical officer follow it cold (this is M4's acceptance test from §1).

### Role permissions
Match the CMS roles above to real people: at minimum, one "Publisher" who is not the developer, so the site does not silently revert to being developer-dependent the moment this project ends.

### Templates & reusable components
Every new content type (event, press release, gallery image, testimonial, speaker) should be a CMS-driven template with required fields (title, date, image, alt text) rather than free-form Markdown — this is what makes volunteer contributions consistent without a style guide being read every time.

### AI-assisted content updates
Once the CMS and Content Collections are in place, a tool like Claude Code (or any AI coding assistant) can be pointed at the repo to make small copy edits, add a new FAQ entry, or draft a testimonial write-up from raw notes — but this should be treated as an accelerant for the *developer/webmaster* role, not a replacement for the CMS workflow above. Volunteers should never need to touch source code, AI-assisted or not; that's the entire point of the CMS investment.

### Low-maintenance architecture — summary of what this plan explicitly avoids
- No custom backend/database (Content Collections + git-based CMS instead).
- No self-hosted services to patch (Pagefind, Plausible/Fathom, Formspree, Decap/Sveltia are all either fully static or hosted SaaS with generous free tiers).
- No Phase 4 feature ships before it has a named, ongoing owner — if nobody volunteers to maintain observation logs, they don't get built, regardless of how compelling they sound in isolation.

---

## 14. Success Metrics

| KPI | Baseline (today) | Target (6 months post-Phase 3) | How measured |
|---|---|---|---|
| Membership signups via the site | Unmeasurable (no form, no analytics) | Track from launch of T-1.6 | Form submissions / payment link conversions |
| Event page → Bookwhen conversion | Unmeasurable | Establish baseline in month 1, improve 20%+ by month 6 | Analytics goal/event tracking |
| Volunteer signups (Star Tours + general) | Unmeasurable (mailto only) | Establish baseline at C3.3 launch | Form submissions |
| Newsletter subscriptions | 0 (doesn't exist) | 100+ by month 6 | Provider dashboard (Buttondown/MailerLite) |
| Gallery submissions from members | 0 | 20+ images by end of Phase 2, ongoing trickle after | CMS content count |
| Time on site | Unmeasured | Track baseline, watch for increase once real content (dates, gallery) replaces placeholders | Analytics |
| Bounce rate on `/join` | Unmeasured, presumed high given dead-end | Meaningful decrease post T-1.6 | Analytics |
| Mobile LCP | ~borderline per review estimate | Consistently "good" per Core Web Vitals thresholds | Lighthouse CI / real-user monitoring if available |
| Accessibility (automated) | ~92–96 estimated | 100 on automated scans; manual AA pass on 2.4.11/2.4.13 | axe/Lighthouse + manual keyboard audit |
| Organic search impressions for "star party phoenix" / "astronomy club phoenix" | Unmeasured, presumed minimal (no structured data, no local SEO) | Track via Search Console from month 1 | Google Search Console |
| Volunteer self-sufficiency | 0% (100% developer-dependent) | M4 acceptance test passed: an officer publishes independently | Direct observation, one-time gate, then spot-checked quarterly |

---

## 15. Budget Estimates

### Minimal Budget — $2,000–$5,000

**Priority:** Phase 1 only, plus the cheapest parts of Phase 2/3.

- All of Phase 1 (F1.1–F1.10): placeholder removal, both bug fixes, focus/scroll-margin fixes, real event dates (manual), `/join` content fix, hero image swap using existing assets, address/map, analytics.
- Font-loading fix (P2.9).
- `.text-gradient` audit (P2.6) and `/leadership` table (P2.7) — cheap, high visual-polish return.
- Newsletter signup (C3.1) and social links/donate button (C3.2) using free-tier tools.
- Membership call for existing member astrophotography (the cheapest possible version of P2.3 — no commissioned shoot, just curation of what members already have).

**Expected ROI:** the highest-ROI tier in this entire plan. This budget closes the join/events funnels, removes every credibility-damaging element, and gets real member photography on the site — the three things the evaluation identified as most damaging — without touching the CMS or a professional photo shoot.

### Moderate Budget — $10,000–$25,000

**Adds to Minimal:**
- Full CMS implementation (Content Collections + Decap/Sveltia) — the single highest-leverage technical investment, making everything above sustainable long-term instead of a one-time fix.
- `Hero.astro` redesign (P2.1) with a small commissioned photo shoot (one evening, one daytime session).
- All of Phase 3's community-growth items (forms replacing `mailto:`, testimonials, speaker profiles, structured data, per-page OG images).
- Pagefind search.

**Expected ROI:** High. This is the tier where the site stops being a one-time project and starts being a system the club can run itself — the CMS alone justifies this budget by removing permanent developer dependency.

### Premium Budget — $50,000–$100,000

**Adds to Moderate:**
- A full brand refresh (new palette derived from Arizona/Sonoran night rather than generic space-violet, possibly a licensed or custom display typeface) — a genuine differentiation move, not a foundational necessity.
- A larger, art-directed photography program: multiple star-party shoots across seasons, a dedicated youth/family shoot, professional editing/color grading of the resulting library.
- Full gallery platform with member submission workflow, moderation, and curation tooling beyond the CMS basics.
- A "What's Up Over Phoenix" recurring content program (editorial infrastructure + a committed content cadence, not just a one-time build).
- Third-party WCAG 2.2 AA accessibility audit and remediation.

**Expected ROI:** Medium-High. Strong differentiation and long-term brand value, but with real diminishing returns relative to the Moderate tier unless the club has genuine capacity (staff or highly committed volunteers) to sustain the increased content cadence this tier assumes.

### Visionary Budget — $250,000+

**Adds to Premium:**
- Member accounts platform: observation logs, achievement badges tied to Astronomical League programs, a moderated photo-submission pipeline beyond what a CMS handles.
- "The Observatory That Was Never Built" — a fully produced scroll-driven narrative experience built from the club's archival history.
- Custom-built live sky utility (replacing the Astrospheric/embed dependency with an owned, branded experience).
- Full educator/youth program hub with downloadable, standards-aligned curriculum materials.

**Expected ROI:** Lower per dollar than every tier below it, and — critically — **the highest ongoing maintenance burden of any tier in this plan.** Recommend pursuing only after Phase 1–3 have shipped, the CMS has proven volunteer adoption, and there is a credible, funded plan (not just aspiration) for who maintains member accounts and the observatory narrative long-term. This tier is where the "maximize impact while minimizing ongoing maintenance by volunteers" principle from the brief is most at risk of being violated — treat every item here as requiring an explicit, named, funded owner before it's greenlit, not just a budget line.

---

## 16. Final Implementation Timeline

### First 30 days
- **Days 1–5:** Content-gathering sprint — dues/tiers decision from the board, officer roster confirmation, meeting time/address confirmation, press-release PDF backlog cleared.
- **Days 1–10 (parallel):** Ship F1.2–F1.5 (bug fixes, focus/scroll-margin, analytics) — none of these block on content.
- **Days 6–15:** Ship F1.1, F1.6, F1.7, F1.9 once content lands.
- **Days 16–20:** Ship F1.8 (hero image swap using existing assets) and F1.10 verification (confirm analytics is actually capturing events).
- **Days 21–30:** QA pass across all 14 pages against the M1 gate (§1); fix anything the review's original findings missed.
- **Milestone:** M1 — Foundation shipped.

### 60 days
- CMS selection, setup, and Content Collections migration for events + press releases (the two highest-value, most frequently updated content types).
- `Hero.astro` rebuild (P2.1) begins; stopgap photography sourced from existing library where a commissioned shoot isn't ready yet.
- P2.5–P2.9 polish items (APOD clamp, gradient audit, leadership table, `/solar-system` retirement, font loading) — all independent, ship as completed.

### 90 days
- **Milestone:** M2 — Premium experience shipped. Gallery live (even if seeded only with member-submitted images, not yet a commissioned shoot). Design system documented (§4) as `docs/DESIGN-SYSTEM.md`.
- Phase 3 begins: newsletter, social/donate, forms replacing `mailto:`, structured data pass, per-page OG images.

### 6 months
- **Milestone:** M3 — Community layer shipped. Testimonials, speaker profiles, FAQ schema all live.
- CMS migration extended to gallery, leadership, testimonials collections.
- **Milestone:** M4 — CMS handoff and acceptance test (a real officer publishes unassisted).
- Begin Phase 4 backlog triage: lunar phase widget and meteor tracker (both low-burden, approved to build) can start here if capacity allows; everything else in Phase 4 stays deferred pending the criteria in §2.

### 12 months
- Full year of real usage data available — revisit the Success Metrics table (§14) against actual baselines.
- Decide, with real evidence, whether Premium-tier investments (photography program, brand refresh, editorial cadence) are justified by the engagement Phase 1–3 produced.
- Any Visionary-tier item only enters serious planning here, and only with a named, funded, ongoing owner — not before.

---

## Master Action Plan

| Priority | Recommendation | Why It Matters | Estimated Effort | Expected Impact | Dependencies | Status |
|---|---|---|---|---|---|---|
| Critical | Remove all 8 placeholder banners | Public site currently admits it's unfinished | 2.5 days | Very High | Officer content | Not started |
| Critical | Fix print/PDF blank-page bug | Every page prints as hero + blank space | 15 min | Medium | None | Not started |
| Critical | Fix `atinfo@pasaz.org` typo | Visible, embarrassing | 5 min | Low/High credibility | None | Not started |
| Critical | Global `:focus-visible` ring | WCAG 2.2 SC 2.4.13 gap | 3 hrs | Medium | None | Not started |
| Critical | Site-wide `scroll-margin-top` | WCAG 2.2 SC 2.4.11 AA failure, all 14 pages | 1 hr | Medium | None | Not started |
| Critical | Make `/join` state dues and offer signup | Four CTAs dead-end today | 1 day dev | Very High | Board dues decision | Not started |
| Critical | Real event dates in HTML | Only date on the site lives in a 3rd-party iframe | 1–2 days | Very High | Bookwhen data access | Not started |
| Critical | Replace `/join` and `/events` hero images | Recruitment opens on a meeting room; events on a black rectangle | 2 hrs (stopgap) | High | Existing image library | Not started |
| Critical | Add address, meeting time, map | Nobody can find where to go | 3 hrs + content | Very High | Officer confirmation | Not started |
| Critical | Wire up analytics | Nothing is currently measurable | 1 hr | Medium (enabling) | None | Not started |
| High | Art-direct `Hero.astro` (per-image focal point, tone, CTA slot) | One treatment serves none of 8 pages well | 3 days | High | F1.8 stopgap first | Not started |
| High | Fix `SpaceHero` moon + portrait composition | Moon reads as a smudge; CTA collides with rings on mobile | 1 day | Medium | None | Not started |
| High | Build member astrophotography gallery | Club's best asset is entirely absent | 4 days + content | Very High | Member submissions or shoot | Not started |
| High | Adopt Astro Content Collections + git-based CMS | Volunteers cannot update the site today | 3–5 days setup | Very High (enabling) | None | Not started |
| High | Newsletter signup | Zero owned retention channel | 3 hrs | High | Provider account | Not started |
| High | Replace all `mailto:` flows with forms | Star Tours revenue currently booked by email | 3 days | High | Forms provider | Not started |
| High | Social links + donate button | 501(c)(3) stated 4×, never actionable | 2 hrs | Medium/High | None | Not started |
| High | Organization + Event + BreadcrumbList JSON-LD | Zero structured data; no event rich results | 1 day | High | Content Collections (events) | Not started |
| High | Per-page Open Graph images | Every share renders a 72px logo | 1 day | Medium | None | Not started |
| High | Preload fonts, subset to Latin | Visible FOUT on LCP element | 2 hrs | Medium | None | Not started |
| Medium | Member spotlights/testimonials | Zero social proof anywhere | 3 days | Medium | Member interviews | Not started |
| Medium | Speaker profiles | Lecture series has no named speakers | 2 days | Medium | Content Collections | Not started |
| Medium | FAQ schema on `/learn` | Free SEO win on existing strong content | 1 hr | Medium | None | Not started |
| Medium | Second layout pattern below the fold | Card grid is the only compositional idea site-wide | 3 days | Medium | None | Not started |
| Medium | Dark-sky sites landing page + internal links | Best content asset on the site, currently buried | 1 day | Medium/High | None | Not started |
| Medium | `.text-gradient` audit | Short headings render awkwardly split | 2 hrs | Low/Medium | None | Not started |
| Medium | `/leadership` real table | 29 cards for 29 rows of tabular data | 3 hrs | Low/Medium | None | Not started |
| Medium | Retire `/solar-system` as standalone page | One outbound link wearing a page costume | 1 hr | Low | P2.8 dependency on `/learn` update | Not started |
| Medium | Pagefind search | No search across 14+ pages of real content | 1 day | Medium | None | Not started |
| Low | Lunar phase + meteor shower widgets | Cheap, on-brand, low maintenance | 1–2 days each | Medium | None | Deferred to Phase 4 |
| Deferred | Observation logs, member accounts | Needs auth/database, real ongoing maintenance | Large | Medium | CMS + proven engagement first | Deferred |
| Deferred | AI assistant, dashboards, badges, push notifications | No demonstrated demand, high maintenance | Large | Low–Medium | — | Not recommended at this stage |

---

## Top 10 Highest-Impact Changes

Ranked for maximum transformation relative to cost, weighted toward changes a volunteer team can sustain without ongoing developer involvement.

1. **Remove every placeholder banner and make `/join` actually work.** These two together are what currently make the site feel unfinished and untrustworthy at the exact moment a visitor is deciding whether to trust this organization with their time or money. Nothing else on this list matters as much.

2. **Put real event dates in HTML, on the homepage and `/events`.** The single highest-leverage content fix — it's free (no design, minimal dev), and it's the one piece of information every visitor to an events-driven organization's site is actually looking for.

3. **Adopt Astro Content Collections + a git-based CMS.** Not the flashiest item on this list, but the one that determines whether everything else stays true in six months. Every other content fix inherits its durability from this decision.

4. **Publish 20+ pieces of real member astrophotography.** The single most differentiating, most emotionally resonant, cheapest-to-source (start with a call to existing members before commissioning anything) change available. No other astronomy club website competitor analyzed in the evaluation is beaten on engineering — all of them, and PAS itself, are beaten on failing to show what their members actually see through the eyepiece.

5. **Replace the `/join` and `/events` hero images and fix the `Hero.astro` opacity treatment.** The cheapest possible fix (F1.8) ships in an afternoon using existing assets; the full art-directed version (P2.1) is the highest-leverage visual-design change in the plan.

6. **Fix the two accessibility gaps (`:focus-visible`, `scroll-margin-top`) and the print bug.** All three are measured in minutes to hours, all three are real WCAG failures or verified defects, and all three are the kind of thing that costs nothing to fix now and costs credibility (or a legal exposure, in the accessibility case) to leave.

7. **Replace every `mailto:` flow with a real form.** Star Tours is a revenue line currently run on email. Contact, volunteering, and Star Tours booking all convert better, track better, and feel more professional as forms — for a cost measured in days, not weeks.

8. **Add structured data (`Organization`, `Event`, `FAQPage`, `BreadcrumbList`).** The single highest-ROI SEO investment available — it's mechanical to implement once the event data exists (item 2), and it's the difference between being invisible and being the answer when someone searches "star party phoenix."

9. **Newsletter signup, social links, and a donate button.** Three of the cheapest items in this entire plan, and currently all three are completely absent from a 14-page nonprofit website. This is the lowest-hanging fruit remaining after the funnel and content fixes.

10. **Add real testimonials, speaker profiles, and a genuine "why join" case built on facts instead of generic bullets.** Social proof is the last mile between "this looks like a well-built website" and "I want to be part of this." It's also the cheapest kind of content to produce — it just requires asking four or five existing members for twenty minutes of their time.

**The pattern across all ten:** eight of them are content, data, and information-architecture decisions rather than visual redesign or new engineering. The site's design and technical foundation are already strong enough to carry a transformation of this magnitude — what's been missing is the content, the funnel, and the maintainability to sustain it. That is also, not coincidentally, the cheapest and fastest category of change available, which is why Phase 1 of this plan can plausibly ship in two weeks and already move the needle more than any single visual redesign would.
