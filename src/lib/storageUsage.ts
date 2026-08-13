import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type StorageFile = { path: string; bytes: number };

export type StorageBreakdownEntry = {
  label: string;
  fileCount: number;
  bytes: number;
  size: string;
};

export type StorageFolderReport = {
  label: string;
  publicPath: string;
  fileCount: number;
  bytes: number;
  size: string;
  // Only set for the Images folder — every other CMS collection with a
  // photo/image field shares that one folder (see public/orion/config.yml,
  // where only press-releases/newsletters override the default
  // media_folder), so it's the only folder where "which collection is this
  // file for" isn't already implied by the folder itself.
  breakdown?: StorageBreakdownEntry[];
};

export type StorageUsageReport = {
  folders: StorageFolderReport[];
  totalBytes: number;
  totalSize: string;
  largestFiles: (StorageFile & { size: string })[];
};

// A CMS collection's list of photo/image field values (as stored in the
// content JSON — see src/content.config.ts's publicPath-typed fields), used
// to attribute Images-folder files back to the collection that references
// them.
export type ImageCollectionRef = { label: string; paths: (string | undefined)[] };

// public/ is copied verbatim into the build; resolve against the cwd rather
// than import.meta.url since this module is bundled into dist/.prerender/
// chunks/ before it runs (see the same note in src/lib/pdfArchive.ts).
const publicDir = join(process.cwd(), 'public');

const IMAGES_PUBLIC_PATH = '/images/uploads';

// Mirrors the CMS upload targets in public/orion/config.yml — the only
// folders Sveltia CMS ever writes files into.
const TRACKED_FOLDERS: { label: string; publicPath: string }[] = [
  { label: 'Images', publicPath: IMAGES_PUBLIC_PATH },
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

// First collection to reference a given path wins, matching how the pages
// that consume these fields (e.g. gallery.astro's `photo ?? image`) already
// treat one path as belonging to one entry. A file uploaded but not yet
// referenced by any entry's photo field — a curated asset, or an in-progress
// CMS edit — falls into "Unreferenced".
function buildImageBreakdown(
  files: StorageFile[],
  refs: ImageCollectionRef[]
): StorageBreakdownEntry[] {
  const labelByPath = new Map<string, string>();
  for (const ref of refs) {
    for (const path of ref.paths) {
      if (path && !labelByPath.has(path)) labelByPath.set(path, ref.label);
    }
  }

  const totals = new Map<string, { fileCount: number; bytes: number }>();
  for (const file of files) {
    const label = labelByPath.get(file.path) ?? 'Unreferenced';
    const entry = totals.get(label) ?? { fileCount: 0, bytes: 0 };
    entry.fileCount += 1;
    entry.bytes += file.bytes;
    totals.set(label, entry);
  }

  return [...totals.entries()]
    .map(([label, { fileCount, bytes }]) => ({ label, fileCount, bytes, size: formatBytes(bytes) }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function getStorageUsageReport(
  imageCollectionRefs: ImageCollectionRef[] = []
): StorageUsageReport {
  const allFiles: StorageFile[] = [];

  const folders = TRACKED_FOLDERS.map(({ label, publicPath }) => {
    const files = walk(join(publicDir, publicPath), publicPath);
    allFiles.push(...files);
    const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
    const breakdown =
      publicPath === IMAGES_PUBLIC_PATH
        ? buildImageBreakdown(files, imageCollectionRefs)
        : undefined;
    return {
      label,
      publicPath,
      fileCount: files.length,
      bytes,
      size: formatBytes(bytes),
      breakdown,
    };
  });

  const totalBytes = folders.reduce((sum, folder) => sum + folder.bytes, 0);

  const largestFiles = [...allFiles]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10)
    .map((file) => ({ ...file, size: formatBytes(file.bytes) }));

  return { folders, totalBytes, totalSize: formatBytes(totalBytes), largestFiles };
}
