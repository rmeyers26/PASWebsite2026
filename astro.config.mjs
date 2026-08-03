import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pasaz.org',
  integrations: [sitemap()],
  // The old site kept a page per year, each one linking out to a Google Drive
  // folder. Those URLs have live inbound links, so point them at the single
  // archive rather than letting them 404. A static build emits a small
  // meta-refresh page for each of these.
  redirects: {
    '/press-releases/press-releases-2025': '/press-releases',
    '/press-releases/press-releases-2024': '/press-releases',
    '/press-releases/press-releases-2023': '/press-releases',
    '/press-releases/press-releases-2022': '/press-releases',
    '/press-releases/press-releases-2021': '/press-releases',
  },
  image: {
    // Lets <Image> pull the NASA picture of the day through the build-time
    // pipeline, so it is served from our own origin as WebP instead of being
    // hotlinked off apod.nasa.gov at full size on every visit.
    domains: ['apod.nasa.gov'],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
