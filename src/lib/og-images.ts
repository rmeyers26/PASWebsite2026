// Shared by src/pages/og/[...route].ts (generates the images at build time)
// and src/layouts/BaseLayout.astro (points each page's og:image /
// twitter:image meta tags at its generated PNG). Keeping one map means the
// two can't drift out of sync with each other or with a page's real
// <BaseLayout title/description> copy.
//
// Keys are route slugs — Astro.url.pathname with slashes trimmed, and the
// homepage ('/') mapped to 'index' — and match the generated path
// /og/<slug>.png. Pages without an existing hero photo omit `bgImage`; the
// route's shared default options fall back to a branded gradient for those,
// so every page still gets a distinct title/description card.
export interface OgPageEntry {
  title: string;
  description: string;
  bgImage?: string;
}

export const ogPages: Record<string, OgPageEntry> = {
  index: {
    title: 'Phoenix Astronomical Society',
    description:
      'A 501(c)(3) nonprofit astronomy club serving Phoenix, Arizona since 1948.',
    bgImage: './src/assets/images/gallery/kris-mlak-milky-way.jpg',
  },
  about: {
    title: 'About',
    description: 'The history, mission, and people behind the Phoenix Astronomical Society.',
    // A bright, busy photo (news feature, awards ceremony) leaves no dark
    // region for the title/description text to sit on — astro-og-canvas has
    // no scrim/overlay option, so the background has to be dark on its own.
    // Member astrophotography reads as on-brand and stays legible everywhere.
    bgImage: './src/assets/images/gallery/tom-fleming-cta-1.jpg',
  },
  gallery: {
    title: 'Member Gallery',
    description:
      'Astrophotography from Phoenix Astronomical Society members — the Milky Way, nebulae, and the Sun, captured from Arizona skies.',
    bgImage: './src/assets/images/gallery/richard-sauerbrun-soul-nebula.jpg',
  },
  events: {
    title: 'Events',
    description: 'Upcoming PAS meetings, public star parties, and observing nights in the Phoenix area.',
    bgImage: './src/assets/images/star-tours-corporate-event.jpg',
  },
  learn: {
    title: 'Learn Astronomy',
    description:
      "Beginner-friendly astronomy resources from the Phoenix Astronomical Society — a kids' corner, answers about astronomy careers, and a curated set of links for observers of every level.",
    // Dark on the left where the text sits, unlike the daytime eyepiece shot.
    bgImage: './src/assets/images/star-tours-eaa-orion-monitor.jpg',
  },
  join: {
    title: 'Join',
    description: 'Become a member of the Phoenix Astronomical Society.',
    bgImage: './src/assets/images/star-tours-event-crowd.jpg',
  },
  'star-tours': {
    title: 'Star Tours',
    description:
      'Book a PAS Star Tours event: telescopes, presenters, and hands-on astronomy for schools, scout troops, businesses, and celebrations.',
    bgImage: './src/assets/images/star-tours-presentation-night.jpg',
  },
  'telescope-workshops': {
    title: 'Telescope Workshops',
    description:
      'Free, public telescope workshops from the Phoenix Astronomical Society — get help finding objects in the sky or choosing a telescope to buy.',
    bgImage: './src/assets/images/workshops/desert-eyepiece-sunset.jpg',
  },
  'sky-conditions': {
    title: 'Sky Conditions & Observing Sites',
    description:
      "Check tonight's astronomical forecast for the Phoenix area, plus Bortle-rated dark-sky observing sites and seasonal targets for telescopes and binoculars from the Phoenix Astronomical Society.",
    bgImage: './src/assets/images/star-tours-eaa-night.jpg',
  },
  scholarship: {
    title: 'Sam Insana Scholarship Fund',
    description:
      'Contribute to the PAS Sam Insana Scholarship Fund, awarding scholarships to Paradise Valley Community College students studying astronomy and related fields.',
    // Same legibility issue as /about — swapped the bright indoor award
    // photo for member astrophotography.
    bgImage: './src/assets/images/gallery/caleb-sexton-ldn-541.png',
  },
  history: {
    title: 'History',
    description:
      "The history of the Phoenix Astronomical Society, from its 1948 founding as the Phoenix Observatory Association to today.",
    bgImage: './src/assets/images/history/hoff-24in-telescope-1957.jpg',
  },
  'loaner-scopes': {
    title: 'Telescope Loan Program',
    description:
      'Active PAS members can borrow telescopes and accessories from the PAS Telescope Loan Program, from beginner-friendly setups to higher-value imaging systems.',
  },
  leadership: {
    title: 'Club Leadership',
    description: 'The current officers and past presidents of the Phoenix Astronomical Society.',
  },
  asig: {
    title: 'Astro Imaging Special Interest Group',
    description:
      'PAS ASIG: a members-only group for learning, practicing, and mastering astronomical imaging, meeting monthly at PVCC.',
  },
  bsig: {
    title: 'Astronomy Book Club',
    description:
      'PAS BSIG: the Astronomy Book Club, exploring the best books on space, cosmology, and planetary science together.',
  },
  'lecture-videos': {
    title: 'Previous Lectures',
    description: "Recordings of past guest lecturer talks from the Phoenix Astronomical Society's Monthly Lecture Series.",
  },
  'press-releases': {
    title: 'Press Releases',
    description: 'Official press releases from the Phoenix Astronomical Society, available to read and download as PDFs.',
  },
  newsletters: {
    title: 'Newsletters',
    description: "Read the Phoenix Astronomical Society's monthly newsletter and browse the historical archive of past issues.",
  },
  exoplanets: {
    title: 'Exoplanets',
    description:
      'An introduction to exoplanets — worlds beyond our solar system — how astronomers find them, and how PAS members observe exoplanet-hosting stars.',
  },
  contact: {
    title: 'Contact',
    description: 'Get in touch with the Phoenix Astronomical Society.',
  },
};
