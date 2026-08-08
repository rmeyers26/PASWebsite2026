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

// Editors enter dates via the CMS's YYYY-MM-DD datetime widget; catch both
// malformed strings and impossible calendar dates (e.g. 2026-02-30, which
// JS Date silently rolls forward into March).
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((val) => new Date(`${val}T00:00:00Z`).toISOString().slice(0, 10) === val, {
    message: 'Date must be a real calendar date',
  });

// A public/-relative path the CMS file/image widget writes back (and that
// scripts/check-content-files.mjs checks actually exists on disk).
const publicPath = (message: string) => z.string().startsWith('/', message);

const pdfPath = publicPath('Must be a path under public/, e.g. /press-releases/2026/foo.pdf').regex(
  /\.pdf$/i,
  'Must end in .pdf',
);

const SKY_TARGET_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const pressReleases = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/press-releases' }),
  schema: z.object({
    // ISO 'YYYY-MM-DD'. Drives sort order, year grouping, displayed date, and
    // the <time datetime> attribute.
    date: isoDate,
    title: z.string().optional(),
    summary: z.string().optional(),
    // Path under public/, so it is also the live URL of the file.
    pdf: pdfPath,
  }),
});

const newsletters = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/newsletters' }),
  schema: z.object({
    // ISO 'YYYY-MM-DD'. Drives sort order, year grouping, displayed date, and
    // the <time datetime> attribute.
    date: isoDate,
    title: z.string().optional(),
    summary: z.string().optional(),
    // Path under public/, so it is also the live URL of the file.
    pdf: pdfPath,
  }),
});

const officers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/officers' }),
  schema: z.object({
      role: z.string().min(1),
      name: z.string().min(1),
      email: z.string().email(),
      order: z.number().int(),
      // Astro resolves an image()-typed field for every entry, even ones
      // where the actual value is a CMS-uploaded public/ URL string — a
      // union with image() doesn't fall back gracefully per-entry, it just
      // crashes the build the moment any entry's value isn't a real local
      // asset. No officer has a curated src-asset photo today, so this is a
      // plain string (rendered as a plain <img> in about.astro).
      photo: publicPath('Must be a path under public/, e.g. /images/uploads/foo.jpg').optional(),
    }),
});

const pastPresidents = defineCollection({
  loader: singleton('src/content/past-presidents/past-presidents.json'),
  schema: z.object({
    presidents: z.array(
      z.object({
        years: z.string().min(1),
        name: z.string().min(1),
        current: z.boolean().optional(),
        org: z.enum(['POA', 'PAS']),
      }),
    ),
  }),
});

const careerFaqs = defineCollection({
  loader: singleton('src/content/career-faqs/career-faqs.json'),
  schema: z.object({
    faqs: z.array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    ),
  }),
});

const bsigBooks = defineCollection({
  loader: singleton('src/content/bsig-books/bsig-books.json'),
  schema: z.object({
    books: z.array(
      z.object({
        title: z.string().min(1),
        author: z.string().min(1),
      }),
    ),
  }),
});

const skyTargets = defineCollection({
  loader: singleton('src/content/sky-targets/sky-targets.json'),
  schema: z.object({
    targets: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        constellation: z.string(),
        magnitude: z.string(),
        size: z.string(),
        rise: z.string(),
        set: z.string(),
        month: z.enum(SKY_TARGET_MONTHS),
      }),
    ),
  }),
});

const lectureVideos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/lecture-videos' }),
  schema: z.object({
    // ISO 'YYYY-MM-DD'. Drives sort order, year (season) grouping, and the
    // displayed date — same convention as press-releases/newsletters.
    date: isoDate,
    title: z.string().min(1),
    speaker: z.string().min(1),
    // e.g. "PAS member", "Lowell Observatory", "ASU" — shown alongside the
    // speaker's name.
    affiliation: z.string().optional(),
    summary: z.string().optional(),
    // Full URL to the recording (Google Drive, YouTube, etc). Optional so a
    // lecture can be listed before its video is uploaded/linked.
    videoUrl: z.string().url().optional(),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      // Two distinct fields, not a union — see the officers.photo comment
      // for why: Astro resolves an image()-typed field for every entry, so
      // a value that's actually a CMS-uploaded public/ URL string crashes
      // the build the moment it's declared under the same image()-bearing
      // field as a real curated asset. `image` is developer-curated only
      // (not exposed in the CMS config); `photo` is what Sveltia writes to
      // when an editor uploads a new gallery photo. gallery.astro prefers
      // `photo` when present, falling back to `image`.
      image: image().optional(),
      photo: publicPath('Must be a path under public/, e.g. /images/uploads/foo.jpg').optional(),
      alt: z.string().min(1),
      photographer: z.string().min(1),
      subject: z.string().min(1),
      note: z.string(),
      order: z.number().int(),
    }),
});

const specialInterestGroups = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/special-interest-groups' }),
  schema: z.object({
    title: z.string().min(1),
    abbr: z.string().min(1),
    accent: z.enum(['violet', 'teal', 'amber']),
    body: z.string().min(1),
    // Internal page (e.g. '/asig') or an external URL for a group without
    // its own page yet.
    url: z
      .string()
      .refine((v) => v.startsWith('/') || /^https?:\/\//.test(v), {
        message: 'Must be an internal path (/foo) or a full URL',
      }),
    // Lets an officer take a group off the home page / nav without
    // deleting its entry (or its page) — e.g. hiatus, or staging a new
    // group before its page is ready.
    enabled: z.boolean().default(true),
    order: z.number().int(),
  }),
});

const loanerScopes = defineCollection({
  loader: singleton('src/content/loaner-scopes/loaner-scopes.json'),
  schema: z.object({
    equipment: z.array(
      z.object({
        name: z.string().min(1),
      }),
    ),
  }),
});

const siteSettings = defineCollection({
  loader: singleton('src/content/site-settings/site-settings.json'),
  schema: z.object({
    orgName: z.string().min(1),
    alternateName: z.string().min(1),
    foundingYear: z.string().min(1),
    description: z.string().min(1),
    // Path under public/ — not a file upload, must match an existing file.
    logo: publicPath('Must be a path under public/, e.g. /images/pas-logo.png'),
    // CMS-uploaded photos of the physical membership add-ons, shown next to
    // their line items on the join page. Plain string paths, not image() —
    // see the officers.photo comment above for why.
    nameBadgePhoto: publicPath('Must be a path under public/, e.g. /images/uploads/foo.jpg').optional(),
    patchPhoto: publicPath('Must be a path under public/, e.g. /images/uploads/foo.jpg').optional(),
    email: z.string().email(),
    astronomyQuestionsEmail: z.string().email(),
    webmasterEmail: z.string().email(),
    socials: z.object({
      facebook: z.string().url(),
      instagram: z.string().url(),
      threads: z.string().url(),
      youtube: z.string().url(),
    }),
  }),
});

export const collections = {
  'press-releases': pressReleases,
  newsletters,
  'lecture-videos': lectureVideos,
  officers,
  'past-presidents': pastPresidents,
  'career-faqs': careerFaqs,
  'bsig-books': bsigBooks,
  'sky-targets': skyTargets,
  gallery,
  'special-interest-groups': specialInterestGroups,
  'loaner-scopes': loanerScopes,
  'site-settings': siteSettings,
};
