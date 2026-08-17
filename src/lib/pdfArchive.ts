import { statSync } from 'node:fs';
import { join } from 'node:path';

export type PdfArchiveEntry = {
  date: string;
  title?: string;
  summary?: string;
  // Free text as printed on the issue's cover, e.g. "Vol. 77, Issue 2".
  // Newsletter-only — press releases never set this.
  volume?: string;
  file: string;
};

export type PdfArchiveListEntry = PdfArchiveEntry & { size?: string; displayDate: string };

// public/ is copied verbatim into the build, so an entry's `file` path is both
// its URL and its location on disk relative to public/. Resolve against the cwd
// rather than import.meta.url: this module is bundled into
// dist/.prerender/chunks/ before it runs, so import.meta.url points at the
// bundle, not at this file. Both `astro dev` and `astro build` run from the
// project root.
const publicDir = join(process.cwd(), 'public');

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  // The dates are calendar days, not instants. Without this they parse as UTC
  // midnight and render as the previous day for anyone west of Greenwich — us.
  timeZone: 'UTC',
});

// Reading the size off disk means nobody has to type a byte count that would
// then silently drift when a PDF is replaced. A bad `file` path is the likeliest
// maintenance mistake, so warn loudly at build time — but do not fail the build
// over it, since a single bad row should never block a deploy of everything else.
function fileSize(file: string, warnContext: string): string | undefined {
  try {
    const bytes = statSync(join(publicDir, file)).size;
    return bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  } catch {
    console.warn(
      `[${warnContext}] No file at public${file} — check the path in src/pages/${warnContext}.astro`
    );
    return undefined;
  }
}

// Newest first, then grouped into years in that same order, so the year headings
// come out descending without a separately maintained list of years.
export function groupPdfArchiveByYear(
  entries: PdfArchiveEntry[],
  warnContext: string
): [string, PdfArchiveListEntry[]][] {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const byYear = new Map<string, PdfArchiveListEntry[]>();
  for (const entry of sorted) {
    const year = entry.date.slice(0, 4);
    const listEntry: PdfArchiveListEntry = {
      ...entry,
      size: fileSize(entry.file, warnContext),
      displayDate: dateFormat.format(new Date(`${entry.date}T00:00:00Z`)),
    };
    byYear.set(year, [...(byYear.get(year) ?? []), listEntry]);
  }
  return [...byYear.entries()];
}
