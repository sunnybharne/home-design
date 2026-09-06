import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rooms } from '../src/property.js';
import { SPAWN, EYE_HEIGHT, WALL_HEIGHT, canStand, movePlayer, insidePolygon, looseFurniture } from '../src/navigation.js';

test('walkthrough starts at a clear standing position inside the entrance', () => {
  assert.ok(canStand(SPAWN.x, SPAWN.z));
  const entry = rooms.find((r) => r.id === 'entry');
  assert.ok(insidePolygon(SPAWN.x, SPAWN.z, entry.polygon));
  assert.ok(EYE_HEIGHT < WALL_HEIGHT);
});
test('walls, windows, glass and outside space block the player', () => {
  for (const [x, z] of [[4, 0.2], [8.65, 2], [6.08, 8.5], [8.75, 11], [-1, 5], [4, 12], [0.1, 9.55]]) assert.equal(canStand(x, z), false, `${x},${z} must be blocked`);
  assert.equal(canStand(NaN, 0), false);
});
test('doorway gaps and the terrace are walkable', () => {
  for (const [x, z] of [[1.24, 3.91], [3.78, 1.95], [4.7, 3.22], [2.08, 9.6], [7.6, 7.14], [7.5, 11]]) assert.ok(canStand(x, z), `${x},${z} must be walkable`);
});
test('large movement cannot tunnel through an internal wall', () => {
  const end = movePlayer({ x: 3.1, z: 5.8 }, 0, 4, false);
  assert.ok(end.z < 6.4); // kitchen cabinets before the bedroom wall
  assert.ok(canStand(end.x, end.z, false));
  const entrance = movePlayer(SPAWN, -20, 0);
  assert.ok(entrance.x > 0.19);
});
test('furniture visibility and collisions agree', () => {
  const bed = looseFurniture[0];
  const x = bed[0] + bed[2] / 2, z = bed[1] + bed[3] / 2;
  assert.equal(canStand(x, z, true), false);
  assert.equal(canStand(x, z, false), true);
});
test('every room can be reached from the entrance without crossing obstacles', () => {
  const step = 0.12, queue = [[0, 0]], seen = new Set(['0,0']), reached = new Set();
  for (let head = 0; head < queue.length; head++) {
    const [ix, iz] = queue[head];
    const x = SPAWN.x + ix * step, z = SPAWN.z + iz * step;
    for (const room of rooms) if (insidePolygon(x, z, room.polygon)) reached.add(room.id);
    if (reached.size === rooms.length) break;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${ix + dx},${iz + dz}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const destination = movePlayer({ x, z }, dx * step, dz * step);
      if (Math.abs(destination.x - (x + dx * step)) < 1e-8 && Math.abs(destination.z - (z + dz * step)) < 1e-8) queue.push([ix + dx, iz + dz]);
    }
  }
  assert.deepEqual([...reached].sort(), rooms.map((r) => r.id).sort());
});
test('walk UI includes play, exit, reset, touch controls and a drag-look fallback', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['play-button', 'exit-walk-button', 'walk-reset-button', 'walk-overlay']) assert.ok(html.includes(`id="${id}"`));
  for (const dir of ['forward', 'back', 'left', 'right']) assert.ok(html.includes(`data-move="${dir}"`));
  const js = readFileSync(new URL('../src/walkthrough.js', import.meta.url), 'utf8');
  for (const feature of ['prefers-reduced-motion', 'visibilitychange', 'pointercancel', 'pointerlockerror', 'movePlayer', 'PerspectiveCamera']) assert.ok(js.includes(feature));
});
