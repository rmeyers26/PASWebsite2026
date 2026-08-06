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
  schema: ({ image }) =>
    z.object({
      role: z.string(),
      name: z.string(),
      email: z.string(),
      order: z.number(),
      // Sveltia uploads new photos to the public/ media folder (a plain URL
      // string, not an asset Vite can process), so image() alone would
      // reject every CMS-uploaded photo. Accept either: a processed
      // src-asset for anything curated directly in the repo, or a public
      // URL string for anything uploaded through the CMS.
      photo: z.union([image(), z.string()]).optional(),
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
      // See the officers.photo comment above — same reason for the union:
      // curated photos stay as processed src-assets, CMS uploads land in
      // public/ as a plain URL string. gallery.astro renders each variant
      // differently (<Image> vs a plain <img>).
      image: z.union([image(), z.string()]),
      alt: z.string(),
      photographer: z.string(),
      subject: z.string(),
      note: z.string(),
      order: z.number(),
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
  'site-settings': siteSettings,
};
