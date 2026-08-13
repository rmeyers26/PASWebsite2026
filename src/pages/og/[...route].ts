import { OGImageRoute } from 'astro-og-canvas';
import { ogPages } from '../../lib/og-images';

// Static, build-time only (getStaticPaths below prerenders one PNG per
// entry in ogPages) — no server adapter required.
export const { getStaticPaths, GET } = await OGImageRoute({
  pages: ogPages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: './src/assets/images/pas-logo.png',
      size: [140],
    },
    bgImage: page.bgImage ? { path: page.bgImage, fit: 'cover' } : undefined,
    // Matches --color-space-base / --color-space-modal in global.css, for
    // pages with no hero photo to composite over.
    bgGradient: page.bgImage
      ? undefined
      : [
          [10, 14, 23],
          [24, 35, 61],
        ],
    border: { color: [45, 212, 191], width: 6 }, // --color-nebula-teal
    padding: 64,
    font: {
      title: { families: ['Space Grotesk'], weight: 'Bold', color: [255, 255, 255], size: 64 },
      description: { families: ['Inter'], weight: 'Normal', color: [200, 205, 217], size: 34 },
    },
    fonts: [
      './src/assets/fonts/og/SpaceGrotesk-Bold.ttf',
      './src/assets/fonts/og/Inter-Regular.ttf',
    ],
  }),
});
