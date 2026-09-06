import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
assert.ok(!tracked.some((p) => p.startsWith('documents/') || /\.pdf$/i.test(p) || p === '1945905'), 'Private owner documents must not be tracked.');

const files = readdirSync('dist', { recursive: true }).filter((p) => statSync(join('dist', p)).isFile());
for (const file of files) {
  // This procedural app needs no PDF/image copies. Review this allowlist before adding assets.
  assert.ok(['.html', '.js', '.css'].includes(extname(file)), `Unexpected public asset: ${file}`);
  assert.ok(!/documents|review\/|homerun/i.test(file), `Private file path in build: ${file}`);
  const text = readFileSync(join('dist', file), 'utf8');
  assert.ok(!text.includes('%PDF-'), `PDF data in ${file}`);
  assert.ok(!/homerun\.net\/shoppings|person=\d+|apartment-card-v2-with-attachments\.pdf/i.test(text), `Private portal/document reference in ${file}`);
  assert.ok(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text), `Email address in ${file}; review before publishing.`);
}
console.log(`Public-file check passed: ${files.length} app assets; no forbidden files or private-data patterns found.`);
