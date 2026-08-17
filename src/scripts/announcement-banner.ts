import { onPageReady } from './utils/lifecycle';

// Progressive enhancement over AnnouncementBanner.astro's build-time-only
// baseline: re-checks which announcement (if any) is active using the
// visitor's own clock, so it appears/disappears exactly on schedule even
// between deploys, rather than only whenever the site next rebuilds.
type Announcement = {
  message: string;
  startDate: string;
  endDate: string;
};

function bindAnnouncementBanner() {
  const dataEl = document.getElementById('announcement-data');
  const banner = document.getElementById('announcement-banner');
  const text = document.getElementById('announcement-text');
  if (!dataEl || !banner || !text) return;

  const candidates: Announcement[] = JSON.parse(dataEl.textContent ?? '[]');
  // Same 'YYYY-MM-DD' / America/Phoenix comparison as the build-time
  // baseline — see AnnouncementBanner.astro for why.
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Phoenix' }).format(
    new Date()
  );
  const active = candidates
    .filter((entry) => entry.startDate <= today && entry.endDate >= today)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
    .at(0);

  banner.hidden = !active;
  text.textContent = active?.message ?? '';
}

export function initAnnouncementBanner(): void {
  onPageReady(bindAnnouncementBanner);
}
