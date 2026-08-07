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

const pressReleases = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/press-releases' }),
  schema: z.object({
    // ISO 'YYYY-MM-DD'. Drives sort order, year grouping, displayed date, and
    // the <time datetime> attribute.
    date: z.string(),
    title: z.string().optional(),
    summary: z.string().optional(),
    // Path under public/, so it is also the live URL of the file.
    pdf: z.string(),
  }),
});

const officers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/officers' }),
  schema: z.object({
      role: z.string(),
      name: z.string(),
      email: z.string(),
      order: z.number(),
      // Astro resolves an image()-typed field for every entry, even ones
      // where the actual value is a CMS-uploaded public/ URL string — a
      // union with image() doesn't fall back gracefully per-entry, it just
      // crashes the build the moment any entry's value isn't a real local
      // asset. No officer has a curated src-asset photo today, so this is a
      // plain string (rendered as a plain <img> in about.astro).
      photo: z.string().optional(),
    }),
});

const pastPresidents = defineCollection({
  loader: singleton('src/content/past-presidents/past-presidents.json'),
  schema: z.object({
    presidents: z.array(
      z.object({
        years: z.string(),
        name: z.string(),
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
        question: z.string(),
        answer: z.string(),
      }),
    ),
  }),
});

const bsigBooks = defineCollection({
  loader: singleton('src/content/bsig-books/bsig-books.json'),
  schema: z.object({
    books: z.array(
      z.object({
        title: z.string(),
        author: z.string(),
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
        month: z.string(),
      }),
    ),
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
      photo: z.string().optional(),
      alt: z.string(),
      photographer: z.string(),
      subject: z.string(),
      note: z.string(),
      order: z.number(),
    }),
});

const specialInterestGroups = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/special-interest-groups' }),
  schema: z.object({
    title: z.string(),
    abbr: z.string(),
    accent: z.enum(['violet', 'teal', 'amber']),
    body: z.string(),
    // Internal page (e.g. '/asig') or an external URL for a group without
    // its own page yet.
    url: z.string(),
    // Lets an officer take a group off the home page / nav without
    // deleting its entry (or its page) — e.g. hiatus, or staging a new
    // group before its page is ready.
    enabled: z.boolean().default(true),
    order: z.number(),
  }),
});

const loanerScopes = defineCollection({
  loader: singleton('src/content/loaner-scopes/loaner-scopes.json'),
  schema: z.object({
    equipment: z.array(
      z.object({
        name: z.string(),
      }),
    ),
  }),
});

const siteSettings = defineCollection({
  loader: singleton('src/content/site-settings/site-settings.json'),
  schema: z.object({
    orgName: z.string(),
    alternateName: z.string(),
    foundingYear: z.string(),
    description: z.string(),
    logo: z.string(),
    email: z.string(),
    astronomyQuestionsEmail: z.string(),
    webmasterEmail: z.string(),
    socials: z.object({
      facebook: z.string(),
      instagram: z.string(),
      threads: z.string(),
      youtube: z.string(),
    }),
  }),
});

export const collections = {
  'press-releases': pressReleases,
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
