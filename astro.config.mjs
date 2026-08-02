import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pasaz.org',
  integrations: [sitemap()],
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
