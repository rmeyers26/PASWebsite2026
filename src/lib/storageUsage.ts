import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type StorageFile = { path: string; bytes: number };

export type StorageFolderReport = {
  label: string;
  publicPath: string;
  fileCount: number;
  bytes: number;
  size: string;
};

export type StorageUsageReport = {
  folders: StorageFolderReport[];
  totalBytes: number;
  totalSize: string;
  largestFiles: (StorageFile & { size: string })[];
};

// public/ is copied verbatim into the build; resolve against the cwd rather
// than import.meta.url since this module is bundled into dist/.prerender/
// chunks/ before it runs (see the same note in src/lib/pdfArchive.ts).
const publicDir = join(process.cwd(), 'public');

// Mirrors the CMS upload targets in public/orion/config.yml — the only
// folders Sveltia CMS ever writes files into.
const TRACKED_FOLDERS: { label: string; publicPath: string }[] = [
  { label: 'Images', publicPath: '/images/uploads' },
  { label: 'Press releases', publicPath: '/press-releases' },
  { label: 'Newsletters', publicPath: '/newsletters' },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 KB';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Walks a folder recursively, collecting every file's size. A missing
// folder (e.g. no press releases uploaded yet) is a valid empty state, not
// a build error, so it resolves to an empty list rather than throwing.
function walk(dir: string, publicPath: string): StorageFile[] {
  let entries: import('node:fs').Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries.flatMap((entry) => {
    const entryPublicPath = `${publicPath}/${entry.name}`;
    if (entry.isDirectory()) {
      return walk(join(dir, entry.name), entryPublicPath);
    }
    return [{ path: entryPublicPath, bytes: statSync(join(dir, entry.name)).size }];
  });
}

export function getStorageUsageReport(): StorageUsageReport {
  const allFiles: StorageFile[] = [];

  const folders = TRACKED_FOLDERS.map(({ label, publicPath }) => {
    const files = walk(join(publicDir, publicPath), publicPath);
    allFiles.push(...files);
    const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
    return { label, publicPath, fileCount: files.length, bytes, size: formatBytes(bytes) };
  });

  const totalBytes = folders.reduce((sum, folder) => sum + folder.bytes, 0);

  const largestFiles = [...allFiles]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10)
    .map((file) => ({ ...file, size: formatBytes(file.bytes) }));

  return { folders, totalBytes, totalSize: formatBytes(totalBytes), largestFiles };
}
