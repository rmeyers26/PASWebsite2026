import { defineCollection, z } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { readFile } from 'node:fs/promises';

// Astro's built-in `file()` loader treats a plain JSON object as a map of
// `{ [entryId]: entryData }`, which does not fit collections that are really
// "one file, one entry, with a list field inside" (past presidents, career
// FAQs, BSIG books, sky targets, site settings). This loader reads the file
// as a single entry with a fixed id, so the JSON on disk is exactly the
// fields Sveltia CMS writes back — no extra wrapper key to keep in sync.
function singleton(path: string): Loader {
  return {
    name: 'singleton-json',
    load: async ({ store, parseData, config, logger }) => {
      const fileUrl = new URL(path, config.root);
      let raw: string;
      try {
        raw = await readFile(fileUrl, 'utf-8');
      } catch {
        logger.warn(`singleton-json: no file at ${path}`);
        return;
      }
      const data = await parseData({ id: 'data', data: JSON.parse(raw) });
      store.set({ id: 'data', data });
    },
  };
}

// ---------------------------------------------------------------------------
// Shared field helpers
//
// These exist so a mistake made in the CMS fails the build with a message that
// names the problem, instead of reaching the site as an "Invalid Date", an
// empty link, or an <img src="">. Errors here are read by whoever is editing,
// so the messages say what to fix rather than quoting a regex.
//
// Note the deliberate split of responsibilities: these schemas validate the
// *shape* of a value. Whether a referenced PDF actually exists on disk is
// checked separately in src/lib/pdfArchive.ts, which warns and carries on —
// one missing file should never block a deploy of everything else.
// ---------------------------------------------------------------------------

/** Required prose. Rejects "" and whitespace-only, and trims stray padding. */
const text = z.string().trim().min(1, 'must not be empty');

/**
 * Wraps an optional field so a *blanked* value is treated as absent.
 *
 * Sveltia writes a cleared field as "" rather than dropping the key, but every
 * consuming page treats absent as the fallback case — `title ?? displayDate`
 * in the PDF archives, `photo ?? image` in the gallery. `??` does not catch
 * "", so a blanked title would render an empty link and a blanked gallery
 * photo would beat the curated image to an `<img src="">`. Normalising "" to
 * undefined makes the parsed data match what those pages already assume.
 */
// The constraint is written via `Parameters<...>` rather than `z.ZodType`, and
// wrapping uses `z.optional(schema)` rather than `schema.optional()`, because
// `z` is re-exported from astro:content as a value and not as a namespace.
const optional = <T extends Parameters<typeof z.preprocess>[1]>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.optional(schema)
  );

/**
 * ISO 'YYYY-MM-DD'. `z.iso.date()` checks the calendar as well as the shape,
 * so a typo'd 2026-13-01 or a non-existent 2026-02-31 fails here rather than
 * reaching `new Date(...)` and rendering as "Invalid Date".
 */
const isoDate = z.iso.date('must be a real calendar date in YYYY-MM-DD form');

/**
 * A path under public/, which is also the live URL of the file. The leading
 * slash is the load-bearing part: a bare "newsletters/x.pdf" is resolved
 * against the current page, so on /newsletters/ it points at
 * /newsletters/newsletters/x.pdf and 404s.
 */
const publicPath = z
  .string()
  .trim()
  .regex(/^\/[^\s]/, "must start with '/' — a path under public/, e.g. /images/uploads/photo.jpg");

/** As above, and actually a PDF. */
const pdfPath = z
  .string()
  .trim()
  .regex(
    /^\/[^\s].*\.pdf$/i,
    "must start with '/' and end in .pdf, e.g. /newsletters/PAStimes August 2026.pdf"
  );

/**
 * A full external link. The protocol allowlist matters: these values are
 * interpolated straight into `href`, and lecture-videos also assigns one to
 * `a.href` in client-side JS, so `javascript:` would be live script injection
 * from a CMS text field.
 */
const externalUrl = z.url({
  protocol: /^https?$/,
  error: 'must be a full http(s) link, e.g. https://example.org/page',
});

const pressReleases = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/press-releases' }),
  schema: z.object({
    // ISO 'YYYY-MM-DD'. Drives sort order, year grouping, displayed date, and
    // the <time datetime> attribute.
    date: isoDate,
    title: optional(text),
    summary: optional(text),
    // Path under public/, so it is also the live URL of the file.
    pdf: pdfPath,
  }),
});

const newsletterEntrySchema = z.object({
  // ISO 'YYYY-MM-DD'. Drives sort order, year grouping, displayed date, and
  // the <time datetime> attribute.
  date: isoDate,
  title: optional(text),
  summary: optional(text),
  // Free text as printed on the issue's cover, e.g. "Vol. 77, Issue 2" — not
  // every issue prints one, and older scans haven't been back-filled with it.
  volume: optional(text),
  // Path under public/, so it is also the live URL of the file.
  pdf: pdfPath,
});

const newsletters = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/newsletters' }),
  schema: newsletterEntrySchema,
});

// Split from `newsletters` so the CMS's small, frequently-touched collection
// (this month's issue) isn't buried under 100+ historical scans that are
// edited essentially never — see src/pages/newsletters.astro, which reads
// both collections and merges them for display.
const newsletterArchive = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/newsletter-archive' }),
  schema: newsletterEntrySchema,
});

const officers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/officers' }),
  schema: z.object({
    role: text,
    name: text,
    // Rendered as a mailto: link on the leadership page.
    email: z.email('must be a valid email address, e.g. president@pasaz.org'),
    // Sorts the officer cards; the CMS field is value_type: int.
    order: z.number().int('must be a whole number').nonnegative('must not be negative'),
    bio: optional(text),
    // Astro resolves an image()-typed field for every entry, even ones
    // where the actual value is a CMS-uploaded public/ URL string — a
    // union with image() doesn't fall back gracefully per-entry, it just
    // crashes the build the moment any entry's value isn't a real local
    // asset. No officer has a curated src-asset photo today, so this is a
    // plain string (rendered as a plain <img> in about.astro).
    photo: optional(publicPath),
  }),
});

const pastPresidents = defineCollection({
  loader: singleton('src/content/past-presidents/past-presidents.json'),
  schema: z.object({
    presidents: z
      .array(
        z.object({
          // A single year, a range, or an open range: "1948",
          // "1950 - 1959", "2021 - Present".
          years: z
            .string()
            .trim()
            .regex(
              /^\d{4}( ?[-–] ?(\d{4}|[Pp]resent))?$/,
              "must be a year, a range, or an open range — e.g. '1948', '1950 - 1959', '2021 - Present'"
            ),
          name: text,
          current: z.boolean().optional(),
          org: z.enum(['POA', 'PAS']),
        })
      )
      // The leadership page highlights the sitting president off this flag, so
      // two of them (or none) is a content error the page cannot show.
      .refine((presidents) => presidents.filter((president) => president.current).length === 1, {
        message: "exactly one president must have 'Currently in Office?' checked",
      }),
  }),
});

const timeline = defineCollection({
  loader: singleton('src/content/timeline/timeline.json'),
  schema: z.object({
    entries: z.array(
      z.object({
        // Free text rather than isoDate — most entries are a bare year
        // ("1948"), some are "Month YYYY" ("August 2022").
        date: text,
        organization: optional(text),
        location: optional(text),
        notes: text,
      })
    ),
  }),
});

const careerFaqs = defineCollection({
  loader: singleton('src/content/career-faqs/career-faqs.json'),
  schema: z.object({
    faqs: z.array(
      z.object({
        question: text,
        answer: text,
      })
    ),
  }),
});

const bsigBooks = defineCollection({
  loader: singleton('src/content/bsig-books/bsig-books.json'),
  schema: z.object({
    books: z.array(
      z.object({
        title: text,
        author: text,
      })
    ),
  }),
});

const skyTargets = defineCollection({
  loader: singleton('src/content/sky-targets/sky-targets.json'),
  schema: z.object({
    targets: z.array(
      z.object({
        name: text,
        type: text,
        constellation: text,
        // Free text — some entries list two values, e.g. "6.9 & 8.4".
        magnitude: text,
        size: text,
        rise: text,
        set: text,
        // Groups the table by month, so it has to match one of the twelve
        // names exactly — "Sept" would silently create a thirteenth group.
        month: z.enum([
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]),
      })
    ),
  }),
});

const lectureVideos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/lecture-videos' }),
  schema: z.object({
    // ISO 'YYYY-MM-DD'. Drives sort order, year (season) grouping, and the
    // displayed date — same convention as press-releases/newsletters.
    date: isoDate,
    title: text,
    speaker: text,
    // e.g. "PAS member", "Lowell Observatory", "ASU" — shown alongside the
    // speaker's name.
    affiliation: optional(text),
    summary: optional(text),
    // Full URL to the recording (Google Drive, YouTube, etc). Optional so a
    // lecture can be listed before its video is uploaded/linked.
    videoUrl: optional(externalUrl),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z
      .object({
        // Two distinct fields, not a union — see the officers.photo comment
        // for why: Astro resolves an image()-typed field for every entry, so
        // a value that's actually a CMS-uploaded public/ URL string crashes
        // the build the moment it's declared under the same image()-bearing
        // field as a real curated asset. `image` is developer-curated only
        // (not exposed in the CMS config); `photo` is what Sveltia writes to
        // when an editor uploads a new gallery photo. gallery.astro prefers
        // `photo` when present, falling back to `image`.
        image: image().optional(),
        photo: optional(publicPath),
        // Required: this is the only description a screen reader gets.
        alt: text,
        photographer: text,
        subject: text,
        note: text,
        order: z.number().int('must be a whole number').nonnegative('must not be negative'),
      })
      // gallery.astro renders `photo ?? image`, so an entry carrying neither
      // is an <img> with no source at all.
      .refine((entry) => Boolean(entry.photo ?? entry.image), {
        message: 'needs an uploaded Image, or a curated `image` asset path',
        path: ['photo'],
      }),
});

const specialInterestGroups = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/special-interest-groups' }),
  schema: z.object({
    title: text,
    // Also the entry's filename via the CMS `slug` setting, so keep it to
    // characters that are safe in a path.
    abbr: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9-]+$/, "must be letters, numbers, or hyphens only — e.g. 'ASIG'"),
    accent: z.enum(['violet', 'teal', 'amber']),
    body: text,
    // Internal page (e.g. '/asig') or an external URL for a group without
    // its own page yet. Goes straight into an href on the home page.
    url: z.union([
      z
        .string()
        .trim()
        .regex(/^\/[^\s]*$/, "internal link must start with '/'"),
      externalUrl,
    ]),
    // Lets an officer take a group off the home page / nav without
    // deleting its entry (or its page) — e.g. hiatus, or staging a new
    // group before its page is ready.
    enabled: z.boolean().default(true),
    order: z.number().int('must be a whole number').nonnegative('must not be negative'),
  }),
});

const loanerScopes = defineCollection({
  loader: singleton('src/content/loaner-scopes/loaner-scopes.json'),
  schema: z.object({
    equipment: z.array(
      z.object({
        name: text,
        // CMS uploads land in public/ as a plain URL string — see the
        // officers.photo comment above for why this isn't image()-typed.
        photo: optional(publicPath),
        // Link back to the manufacturer's product page for this item.
        manufacturerUrl: optional(externalUrl),
        // When this item joined the loaner inventory.
        dateAdded: optional(isoDate),
      })
    ),
  }),
});

const scholarshipWinners = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/scholarship-winners' }),
  schema: z.object({
    // Groups winners for the scholarship page and drives sort order (most
    // recent year first) — one file per year, not one per winner.
    year: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'must be a four-digit year, e.g. 2026'),
    winners: z
      .array(
        z.object({
          name: text,
          school: text,
          amount: optional(text),
          description: optional(text),
          photo: optional(publicPath),
        })
      )
      .min(1, 'needs at least one winner')
      .max(3, 'at most 3 winners per year'),
  }),
});

const siteSettings = defineCollection({
  loader: singleton('src/content/site-settings/site-settings.json'),
  schema: z.object({
    orgName: text,
    alternateName: text,
    // Published as schema.org foundingDate in the page head.
    foundingYear: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'must be a four-digit year, e.g. 1948'),
    description: text,
    logo: publicPath,
    email: z.email('must be a valid email address'),
    astronomyQuestionsEmail: z.email('must be a valid email address'),
    webmasterEmail: z.email('must be a valid email address'),
    // Rendered as footer links and as schema.org sameAs entries.
    socials: z.object({
      facebook: externalUrl,
      instagram: externalUrl,
      threads: externalUrl,
      youtube: externalUrl,
    }),
    // Hides the homepage Donate CTA and the PayPal button on the
    // scholarship page without touching either page's code — e.g. while the
    // PayPal account is being set up, or if it ever needs to be paused.
    donationsEnabled: z.boolean().default(true),
  }),
});

const membership = defineCollection({
  loader: singleton('src/content/membership/membership.json'),
  schema: z.object({
    tiers: z.array(
      z.object({
        name: text,
        // Annual dues in whole dollars — the join page formats this with a
        // leading '$' rather than storing the symbol in content.
        price: z.number().nonnegative('must not be negative'),
        // Highlights this tier with a "Most Common" badge. Should be true on
        // at most one tier; the join page just highlights whichever it finds
        // first if more than one is checked.
        featured: z.boolean().optional(),
      })
    ),
    addOns: z.array(
      z.object({
        name: text,
        price: z.number().nonnegative('must not be negative'),
        // CMS-uploaded photo of the physical add-on, shown next to its line
        // item on the join page. Plain string path, not image() — see the
        // officers.photo comment above for why.
        photo: optional(publicPath),
      })
    ),
  }),
});

export const collections = {
  'press-releases': pressReleases,
  newsletters,
  'newsletter-archive': newsletterArchive,
  'lecture-videos': lectureVideos,
  officers,
  'past-presidents': pastPresidents,
  timeline,
  'career-faqs': careerFaqs,
  'bsig-books': bsigBooks,
  'sky-targets': skyTargets,
  gallery,
  'special-interest-groups': specialInterestGroups,
  'loaner-scopes': loanerScopes,
  'scholarship-winners': scholarshipWinners,
  'site-settings': siteSettings,
  membership,
};
