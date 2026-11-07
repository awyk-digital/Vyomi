#!/usr/bin/env node
/**
 * Asset sync.
 *
 * Scans /public/img for files named after a slot id in config/assets.ts and
 * points that slot's `src` at the file. Slots with no matching file are reset
 * to null so they keep rendering their labelled placeholder.
 *
 * This is the whole handoff contract for generated imagery: save a file as
 *   public/img/<slot-id>.<ext>
 * run `npm run assets:sync`, and the slot fills itself. No component edits,
 * no manual path wiring, and the diff is reviewable.
 *
 * Usage:
 *   npm run assets:sync          apply
 *   npm run assets:sync -- --check   report only, non-zero exit if stale
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'config', 'assets.ts');
const imgDir = join(root, 'public', 'img');

const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const checkOnly = process.argv.includes('--check');

const source = readFileSync(manifestPath, 'utf8');

// Slot ids, in file order.
const ids = [...source.matchAll(/\bid: '([a-z0-9-]+)'/g)].map((m) => m[1]);
if (ids.length === 0) {
  console.error('No slot ids found in config/assets.ts — aborting.');
  process.exit(1);
}

// Map slot id -> file on disk.
const onDisk = new Map();
if (existsSync(imgDir)) {
  for (const entry of readdirSync(imgDir)) {
    const ext = extname(entry).toLowerCase();
    if (!ALLOWED.has(ext)) continue;
    const stem = basename(entry, extname(entry));
    if (!onDisk.has(stem)) onDisk.set(stem, entry);
  }
}

let out = source;
const filled = [];
const cleared = [];
const unmatched = [];

for (const id of ids) {
  const file = onDisk.get(id);
  const desired = file ? `'/img/${file}'` : 'null';

  // Find this slot's `src:` — the first one after its `id:`.
  const idIdx = out.indexOf(`id: '${id}'`);
  if (idIdx === -1) continue;
  const srcIdx = out.indexOf('src:', idIdx);
  if (srcIdx === -1) continue;

  const lineEnd = out.indexOf('\n', srcIdx);
  const line = out.slice(srcIdx, lineEnd);
  const current = line.replace(/^src:\s*/, '').replace(/,\s*$/, '');

  if (current === desired) continue;

  out = `${out.slice(0, srcIdx)}src: ${desired},${out.slice(lineEnd)}`;
  if (file) filled.push(`${id} -> /img/${file}`);
  else cleared.push(id);
}

// Files in /public/img that match no slot id.
for (const [stem, file] of onDisk) {
  if (!ids.includes(stem)) unmatched.push(file);
}

const changed = out !== source;

if (filled.length) {
  console.log(`\nFilled ${filled.length} slot(s):`);
  for (const l of filled) console.log('  + ' + l);
}
if (cleared.length) {
  console.log(`\nCleared ${cleared.length} slot(s) (file removed):`);
  for (const l of cleared) console.log('  - ' + l);
}
if (unmatched.length) {
  console.log(`\n${unmatched.length} file(s) in public/img match no slot id:`);
  for (const f of unmatched) console.log('  ? ' + f);
  console.log('  Rename to <slot-id>.<ext> — see HANDOVER.md for the id list.');
}

const pending = ids.filter((id) => !onDisk.has(id));
console.log(
  `\n${ids.length - pending.length}/${ids.length} slots filled, ${pending.length} pending.`
);
if (pending.length) console.log('  pending: ' + pending.join(', '));

if (checkOnly) {
  if (changed) {
    console.error('\nconfig/assets.ts is out of date. Run: npm run assets:sync');
    process.exit(1);
  }
  console.log('\nManifest is up to date.');
  process.exit(0);
}

if (changed) {
  writeFileSync(manifestPath, out);
  console.log('\nUpdated config/assets.ts');
} else {
  console.log('\nNo changes needed.');
}
