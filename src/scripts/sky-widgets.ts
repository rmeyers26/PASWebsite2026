import { onPageReady } from './utils/lifecycle';

// Pure math, computed client-side so it's accurate for the visitor's
// actual "tonight" rather than whenever the site was last built/deployed
// — the Astrospheric weather widget above is live for the same reason.
const LUNAR_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);

const MOON_PHASES: { max: number; name: string; icon: string }[] = [
  { max: 0.02, name: 'New Moon', icon: '🌑' },
  { max: 0.24, name: 'Waxing Crescent', icon: '🌒' },
  { max: 0.26, name: 'First Quarter', icon: '🌓' },
  { max: 0.49, name: 'Waxing Gibbous', icon: '🌔' },
  { max: 0.51, name: 'Full Moon', icon: '🌕' },
  { max: 0.74, name: 'Waning Gibbous', icon: '🌖' },
  { max: 0.76, name: 'Last Quarter', icon: '🌗' },
  { max: 0.98, name: 'Waning Crescent', icon: '🌘' },
  { max: 1.01, name: 'New Moon', icon: '🌑' },
];

function updateMoonPhase() {
  const iconEl = document.getElementById('moon-phase-icon');
  const nameEl = document.getElementById('moon-phase-name');
  const illumEl = document.getElementById('moon-phase-illum');
  if (!iconEl || !nameEl || !illumEl) return;

  const ageDays = ((Date.now() - KNOWN_NEW_MOON_UTC) / 86_400_000) % LUNAR_MONTH_DAYS;
  const fraction = (((ageDays % LUNAR_MONTH_DAYS) + LUNAR_MONTH_DAYS) / LUNAR_MONTH_DAYS) % 1;
  // Fraction of the disc lit — exact for a circular orbit approximation,
  // which is what a decorative widget like this needs, not an almanac.
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100);
  const phase = MOON_PHASES.find((p) => fraction <= p.max) ?? MOON_PHASES[0];

  iconEl.textContent = phase.icon;
  nameEl.textContent = phase.name;
  illumEl.textContent = `${illumination}% illuminated`;
}

function updateMeteorShowers() {
  const items = document.querySelectorAll<HTMLLIElement>('[data-shower-item]');
  if (!items.length) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let soonestItem: HTMLLIElement | null = null;
  let soonestDiff = Infinity;

  for (const item of items) {
    const month = Number(item.dataset.month) - 1;
    const day = Number(item.dataset.day);
    let next = new Date(today.getFullYear(), month, day);
    if (next < today) next = new Date(today.getFullYear() + 1, month, day);

    const dateEl = item.querySelector('.shower-date');
    if (dateEl) {
      const withYear = next.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      dateEl.textContent = `Peaks ${withYear}`;
    }

    const diff = next.getTime() - today.getTime();
    if (diff < soonestDiff) {
      soonestDiff = diff;
      soonestItem = item;
    }
  }

  // Only one "Next Up" badge should ever exist — re-running on repeat
  // astro:page-load events (view transitions) must not stack another.
  document.querySelector('.shower-next-badge')?.remove();
  const nameEl = soonestItem?.querySelector('.shower-name');
  if (nameEl) {
    const badge = document.createElement('span');
    badge.textContent = 'Next Up';
    badge.className = 'shower-next-badge';
    nameEl.appendChild(badge);
  }
}

function updateSkyWidgets() {
  updateMoonPhase();
  updateMeteorShowers();
}

export function initSkyWidgets(): void {
  onPageReady(updateSkyWidgets);
}
