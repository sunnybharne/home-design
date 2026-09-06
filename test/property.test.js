import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { property, plan, rooms, walls, windows, doors } from '../src/property.js';

function contains(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]; const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

test('the only apartment is the sourced A1 on brochure page 25', () => {
  assert.equal(property.apartment, 'A1');
  assert.equal(property.area, 71);
  assert.equal(property.floor, 1);
  assert.equal(property.type, '3H + KT');
  assert.equal(new URL(property.brochure).hash, '#page=25');
});
test('A1 includes two bedrooms and the published supporting spaces', () => {
  assert.equal(rooms.length, 7);
  assert.equal(rooms.filter((room) => room.code === 'MH').length, 2);
  for (const id of ['living', 'bathroom', 'wardrobe', 'entry', 'terrace']) assert.ok(rooms.find((room) => room.id === id));
  assert.equal(new Set(rooms.map((room) => room.id)).size, rooms.length);
});
test('room geometry is finite, within the plan, and contains its label', () => {
  for (const room of rooms) {
    assert.ok(room.polygon.length >= 4);
    for (const [x, y] of room.polygon) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y));
      assert.ok(x >= 0 && x <= plan.width && y >= 0 && y <= plan.height);
    }
    assert.ok(contains(room.label, room.polygon), `${room.id} label must be inside its room`);
  }
});
test('terrace is outside the apartment outline', () => {
  const terrace = rooms.find((room) => room.id === 'terrace');
  assert.equal(contains(terrace.label, plan.outline), false);
  assert.equal(contains(terrace.label, plan.terrace), true);
});
test('walls, windows and six door swings use valid geometry', () => {
  for (const [x, y, w, h] of walls) {
    assert.ok([x, y, w, h].every(Number.isFinite));
    assert.ok(w > 0 && h > 0);
    assert.ok(x >= 0 && y >= 0 && x + w <= plan.width + 1e-9 && y + h <= plan.height + 1e-9);
  }
  assert.equal(windows.length, 3);
  for (const window of windows) assert.ok(window.y2 > window.y1);
  assert.equal(doors.length, 6);
  for (const door of doors) {
    assert.ok(door.radius > 0);
    assert.ok(Math.abs(Math.abs(door.closed - door.open) - Math.PI / 2) < 1e-9);
  }
});
test('UI contains only the apartment plan, not building or map controls', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const js = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(html, /id="plan-canvas"/);
  assert.match(html, /id="official-plan"/);
  assert.doesNotMatch(html, /data-view=|data-floor=|id="map"|data-camera=/);
  assert.doesNotMatch(js, /leaflet|nihti\.geojson|buildProperty|PerspectiveCamera/);
  assert.match(js, /OrthographicCamera/);
  assert.match(js, /controls\.enableRotate = false/);
});
