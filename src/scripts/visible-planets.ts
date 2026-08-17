// Type-only import: erased at build, so it costs nothing at runtime.
import type * as AstronomyEngine from 'astronomy-engine';
import { onPageReady } from './utils/lifecycle';

const NAKED_EYE_PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;

// 8-point compass, indexed by azimuth (0-360, clockwise from north) / 45.
const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function compassDirection(azimuthDegrees: number): string {
  const index = Math.round(azimuthDegrees / 45) % 8;
  return COMPASS_POINTS[index];
}

async function updateVisiblePlanets() {
  const card = document.querySelector<HTMLElement>('[data-visible-planets]');
  const list = document.getElementById('visible-planets-list');
  const empty = document.getElementById('visible-planets-empty');
  if (!card || !list || !empty) return;

  const lat = Number(card.dataset.lat);
  const lon = Number(card.dataset.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

  // astronomy-engine bundles VSOP87/ELP2000 term tables and isn't trivially
  // small, so it's loaded on demand rather than adding it to the page's
  // initial bundle — mirrors how three.js is lazy-loaded in space-hero.ts.
  const Astronomy: typeof AstronomyEngine = await import('astronomy-engine');

  const now = new Date();
  const observer = new Astronomy.Observer(lat, lon, 0);

  const visible = NAKED_EYE_PLANETS.map((name) => {
    const body = Astronomy.Body[name];
    const equator = Astronomy.Equator(body, now, observer, true, true);
    const horizon = Astronomy.Horizon(now, observer, equator.ra, equator.dec, 'normal');
    const { mag } = Astronomy.Illumination(body, now);
    return { name, altitude: horizon.altitude, azimuth: horizon.azimuth, mag };
  })
    .filter((planet) => planet.altitude > 0)
    .sort((a, b) => a.mag - b.mag);

  list.replaceChildren(
    ...visible.map((planet) => {
      const item = document.createElement('li');
      item.textContent = `${planet.name} — ${compassDirection(planet.azimuth)}, ${Math.round(planet.altitude)}° up`;
      return item;
    })
  );
  list.classList.toggle('hidden', visible.length === 0);
  empty.classList.toggle('hidden', visible.length > 0);
}

export function initVisiblePlanets(): void {
  onPageReady(() => void updateVisiblePlanets());
}
