import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { audit, sources, documentedDimensions, finishes, ceiling } from '../src/specification.js';
import { calibration, pdfPoint, plan, rooms } from '../src/property.js';
import { fixedItems, fixtures } from '../src/interior.js';
import { fixtures as collisionFixtures, canStand, WALL_HEIGHT } from '../src/navigation.js';

const size = (id) => documentedDimensions.find((d) => d.id === id).mm;
const box = (id) => fixedItems.find((item) => item.id === id).box;
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('document review does not make the model furniture-order ready', () => {
  assert.equal(audit.furnitureOrderReady, false);
  assert.equal(audit.documents, 13);
  assert.equal(audit.pages, 96);
  assert.equal(sources.length, 13);
  assert.equal(new Set(sources.map((s) => s[0])).size, 13);
  assert.match(sources.find((s) => s[0] === 'S13')[3], /ONLY for electrical points/);
  assert.match(sources.find((s) => s[0] === 'S12')[3], /indicative and may change/);
  for (const dimension of documentedDimensions) {
    assert.match(dimension.source, /S\d\d.*p/);
    assert.ok(Object.values(dimension.mm).every((n) => Number.isFinite(n) && n > 0));
    assert.doesNotMatch(dimension.status, /as-built|site-measured/i);
  }
});
test('1:100 PDF calibration uses native points, not screenshot pixels', () => {
  near(calibration.metresPerPoint, 25.4 / 720);
  assert.deepEqual(pdfPoint(...calibration.originPt), [0, 0]);
  const tenMetresInPoints = 10000 / 100 / 25.4 * 72;
  assert.deepEqual(pdfPoint(calibration.originPt[0] + tenMetresInPoints, calibration.originPt[1]), [10, 0]);
  assert.equal(plan.status, 'scale-derived');
});
test('scaled wardrobe cross-checks the stated enclosure without claiming installed size', () => {
  const room = rooms.find((r) => r.id === 'wardrobe');
  const xs = room.polygon.map((p) => p[0]), zs = room.polygon.map((p) => p[1]);
  near(Math.max(...xs) - Math.min(...xs), size('wardrobe').shortSide / 1000);
  near(Math.max(...zs) - Math.min(...zs), size('wardrobe').longSide / 1000);
  assert.match(room.description, /planned dimensions/);
});
test('rotated entrance cabinets use the supplier frame sizes', () => {
  for (const id of ['entry-a', 'entry-b']) {
    const [,, xWidth, zDepth, height] = box(id), mm = size(id);
    near(xWidth, mm.depth / 1000); near(zDepth, mm.width / 1000); near(height, mm.height / 1000);
  }
});
test('worktop, bedroom group, laundry enclosure and toilet use documented sizes', () => {
  near(box('kitchen-base')[2], size('worktop').width / 1000);
  near(box('kitchen-base')[3], size('worktop').depth / 1000);
  near(box('bedroom-cabinet')[3], (size('bedroom-cabinet').width + size('bedroom-cabinet').filler) / 1000);
  near(box('bedroom-cabinet')[4], (size('bedroom-cabinet').bodyHeight + size('bedroom-cabinet').plinthHeight) / 1000);
  near(box('laundry')[3], (size('laundry').width + 2 * size('laundry').sidePanel) / 1000);
  near(box('laundry')[4], (size('laundry').height + size('laundry').underside) / 1000);
  near(box('vanity')[3], size('vanity').width / 1000);
  near(box('toilet')[2], size('toilet').depth / 1000);
  near(box('toilet')[3], size('toilet').width / 1000);
  near(box('toilet')[4], size('toilet').height / 1000);
});
test('fixed units share one collision source and cannot vanish with furniture ideas', () => {
  assert.equal(fixtures, collisionFixtures);
  for (const item of fixedItems) {
    const [x, z, w, d, h] = item.box;
    assert.ok([x, z, w, d, h].every(Number.isFinite));
    assert.ok(w > 0 && d > 0 && h > 0 && h <= WALL_HEIGHT);
    assert.ok(item.source && item.sizeNote);
    assert.equal(canStand(x + w / 2, z + d / 2, false), false, item.id);
  }
  for (const file of ['main', 'interior-scene']) {
    const js = readFileSync(new URL(`../src/${file}.js`, import.meta.url), 'utf8');
    assert.match(js, /for \(const item of fixedItems\)/);
  }
});
test('selected finishes and provisional heights retain their provenance', () => {
  for (const finish of Object.values(finishes)) {
    assert.match(finish.source, /S12/); assert.match(finish.color, /^#[\da-f]{6}$/i);
  }
  assert.match(finishes.kitchen.name, /Beige/);
  assert.match(finishes.terrace.name, /Anthracite/);
  assert.match(ceiling.status, /Provisional/);
  assert.equal(WALL_HEIGHT, ceiling.main);
  assert.ok(ceiling.bathroom < ceiling.entry && ceiling.entry < ceiling.main);
});
test('accuracy controls exist, use unique IDs, and warn in both plan and walkthrough', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const file of ['main', 'walkthrough']) {
    const js = readFileSync(new URL(`../src/${file}.js`, import.meta.url), 'utf8');
    for (const match of js.matchAll(/(?:\$|document\.getElementById)\('([^']+)'\)/g)) assert.ok(ids.includes(match[1]), `Missing UI element: ${match[1]}`);
  }
  assert.match(html, /Not ready for furniture orders/);
  assert.match(html, /INSIDE A1 · NOT FOR FURNITURE ORDERS/);
  assert.match(html, /id="documented-dimensions"/);
  assert.match(html, /id="confirmation-list"/);
  assert.doesNotMatch(html, /estimated 2\.7 m|replica|as-built replica/);
});
test('private inputs are ignored and the production build runs its privacy check', () => {
  const ignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8');
  assert.match(ignore, /^\/documents\/$/m); assert.match(ignore, /^\/\*\.pdf$/m);
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.build, /check-public-files\.js/);
});
