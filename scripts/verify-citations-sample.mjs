import fs from 'node:fs';
import path from 'node:path';

const entriesDir = 'dataset/changelog-actions/v1/entries';
const files = fs.readdirSync(entriesDir).filter(f => f.endsWith('.json'));

const sample = [];
const seenProduct = new Set();
for (const f of files) {
  const e = JSON.parse(fs.readFileSync(path.join(entriesDir, f), 'utf8'));
  if (seenProduct.has(e.input.product)) continue;
  seenProduct.add(e.input.product);
  sample.push(e);
}

let missingRelease = 0;
let probeMiss = 0;
let ok = 0;
const issues = [];

for (const e of sample) {
  const releaseFile = path.join('products', e.input.product, 'releases', `${e.input.version}.md`);
  if (!fs.existsSync(releaseFile)) {
    missingRelease++;
    issues.push({ id: e.id, kind: 'no-release-file', path: releaseFile });
    continue;
  }
  const body = fs.readFileSync(releaseFile, 'utf8');
  const probe = e.input.change_text.slice(0, 25).replace(/[*_`\\]/g, '').trim().slice(0, 18);
  if (!body.includes(probe)) {
    probeMiss++;
    issues.push({ id: e.id, kind: 'probe-mismatch', probe });
  } else {
    ok++;
  }
}

console.log(`sampled: ${sample.length} entries (one per product)`);
console.log(`citation ok: ${ok}`);
console.log(`missing release file: ${missingRelease}`);
console.log(`probe mismatch: ${probeMiss}`);
if (issues.length) console.log('issues:', JSON.stringify(issues, null, 2));
