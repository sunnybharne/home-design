import { plan, walls, windows, doors, terraceGlass } from './property.js';
import { fixtures, looseFurniture } from './interior.js';
import { ceiling } from './specification.js';
export { fixtures, looseFurniture } from './interior.js';

// Drawing-scale metres, not as-built. Camera eye height is a viewer preference.
export const EYE_HEIGHT = 1.62;
export const WALL_HEIGHT = ceiling.main;
export const SPAWN = { x: 1.27, z: 9.55 };
export const PLAYER_RADIUS = 0.17;

export const barriers = [
  ...walls,
  ...windows.map((w) => [w.x1 - 0.23, w.y1, 0.46, w.y2 - w.y1]),
  [terraceGlass.x, terraceGlass.z, 0.135, terraceGlass.depth],
  [0, doors[0].y, 0.18, doors[0].radius], // entrance stays closed
];

export function insidePolygon(x, z, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i], [xj, zj] = polygon[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
export function touchesBox(x, z, box, radius = PLAYER_RADIUS) {
  const [bx, bz, w, d] = box;
  const cx = Math.max(bx, Math.min(x, bx + w));
  const cz = Math.max(bz, Math.min(z, bz + d));
  return (x - cx) ** 2 + (z - cz) ** 2 < radius ** 2;
}
export function canStand(x, z, furnished = true) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  // Check the player's circumference against the union, including the terrace join.
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const px = x + Math.cos(a) * PLAYER_RADIUS, pz = z + Math.sin(a) * PLAYER_RADIUS;
    if (!insidePolygon(px, pz, plan.outline) && !insidePolygon(px, pz, plan.terrace)) return false;
  }
  return !barriers.some((b) => touchesBox(x, z, b)) &&
    !fixtures.some((b) => touchesBox(x, z, b)) &&
    (!furnished || !looseFurniture.some((b) => touchesBox(x, z, b)));
}
export function movePlayer(position, dx, dz, furnished = true) {
  // Substeps prevent tunnelling through thin walls. Resolve axes separately to slide.
  const distance = Math.hypot(dx, dz);
  if (!Number.isFinite(distance) || distance > 100) return { ...position };
  const steps = Math.max(1, Math.ceil(distance / 0.06));
  let { x, z } = position;
  for (let i = 0; i < steps; i++) {
    if (canStand(x + dx / steps, z, furnished)) x += dx / steps;
    if (canStand(x, z + dz / steps, furnished)) z += dz / steps;
  }
  return { x, z };
}
