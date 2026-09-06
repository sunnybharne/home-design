import { plan, walls, windows } from './property.js';

// Drawing units are treated as metres for navigation only. Heights are estimates.
export const EYE_HEIGHT = 1.62;
export const WALL_HEIGHT = 2.7;
export const SPAWN = { x: 1.27, z: 9.55 };
export const PLAYER_RADIUS = 0.17;

// x, z, width, depth, height, colour. Shared by rendering and collision checks.
export const fixtures = [
  [2.05, 6.4, 2.82, 0.62, 0.91, '#d6cfbd'],
  [4.87, 6.4, 0.56, 0.62, 2.15, '#eeeee6'],
  [0.2, 6, 0.64, 1.03, 2.25, '#e0ddd0'],
  [0.2, 7.23, 0.64, 1.25, 2.25, '#e0ddd0'],
  [2.18, 7.28, 0.58, 1.03, 2.25, '#e0ddd0'],
  [2, 0.48, 0.52, 2.58, 2.25, '#d8d2bf'],
  [2.57, 0.48, 1.1, 0.53, 2.25, '#d8d2bf'],
  [2.57, 2.55, 1.1, 0.53, 2.25, '#d8d2bf'],
  [0.23, 1.73, 0.45, 0.67, 0.85, '#f0efe5'],
  [0.24, 2.51, 0.64, 0.42, 0.47, '#f5f5ee'],
  [0.24, 3.19, 0.61, 0.59, 0.86, '#eeeee6'],
];
export const looseFurniture = [
  [6.35, 0.63, 1.55, 2.02, 0.48, '#c0cbb0'],
  [5.87, 0.66, 0.36, 0.42, 0.5, '#bcb398'],
  [3.86, 9.09, 1.85, 0.92, 0.48, '#c0cbb0'],
  [3.61, 7.55, 1.34, 0.55, 0.76, '#c6bca3'],
  [6.29, 5.42, 1.9, 0.74, 0.74, '#a9b799'],
  [6.44, 3.37, 1.58, 0.3, 0.52, '#bfb296'],
  [2.55, 4.14, 1.02, 1.02, 0.75, '#c8b798'],
  [7.06, 4.52, 0.64, 0.64, 0.42, '#c3b99f'],
];
export const barriers = [
  ...walls,
  ...windows.map((w) => [w.x1 - 0.19, w.y1, 0.38, w.y2 - w.y1]),
  [8.69, 7.49, 0.16, 5.76], // terrace glass boundary
  [0, 9.08, 0.19, 0.94], // apartment entrance stays closed
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
