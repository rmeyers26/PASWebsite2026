#!/usr/bin/env node
// Verifies every public/-relative path an editor enters through the CMS
// (PDFs, uploaded photos, the site logo) actually resolves to a real file,
// so a missing upload fails the build instead of shipping a dead link.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(rootDir, 'src', 'content');
const publicDir = path.join(rootDir, 'public');

// Field name -> whether it's optional (absent/undefined is fine, but an
// empty string or non-existent path is not).
const PUBLIC_PATH_FIELDS = {
  'press-releases': ['pdf'],
  newsletters: ['pdf'],
  officers: ['photo'],
  gallery: ['photo'],
  'site-settings': ['logo', 'nameBadgePhoto', 'patchPhoto'],
};

function walkJsonFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
    } else if (entry.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

const missing = [];

for (const [collection, fields] of Object.entries(PUBLIC_PATH_FIELDS)) {
  const collectionDir = path.join(contentDir, collection);
  if (!existsSync(collectionDir)) continue;

  for (const jsonFile of walkJsonFiles(collectionDir)) {
    const data = JSON.parse(readFileSync(jsonFile, 'utf-8'));
    for (const field of fields) {
      const value = data[field];
      if (value === undefined || value === null) continue;

      const resolved = path.join(publicDir, value);
      if (!existsSync(resolved)) {
        missing.push({
          file: path.relative(rootDir, jsonFile),
          field,
          value,
        });
      }
    }
  }
}

if (missing.length > 0) {
  console.error(`\nFound ${missing.length} CMS-referenced file(s) missing from public/:\n`);
  for (const { file, field, value } of missing) {
    console.error(`  ${file}: "${field}" -> ${value} (not found)`);
  }
  console.error('');
  process.exit(1);
}

console.log(`check-content-files: all CMS-referenced public/ files exist.`);
