import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const shapes = new Map();
export function block(parent, size, position, material, radius = .012) {
  const key = `${size}:${radius}`;
  if (!shapes.has(key)) shapes.set(key, radius ? new RoundedBoxGeometry(...size, 3, Math.min(radius, Math.min(...size) * .45)) : new THREE.BoxGeometry(...size));
  const mesh = new THREE.Mesh(shapes.get(key), material); mesh.position.set(...position);
  mesh.castShadow = !material.transparent; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function cylinder(parent, top, bottom, height, position, material, segments = 24) {
  const key = `c:${top}:${bottom}:${height}:${segments}`;
  if (!shapes.has(key)) shapes.set(key, new THREE.CylinderGeometry(top, bottom, height, segments));
  const mesh = new THREE.Mesh(shapes.get(key), material); mesh.position.set(...position);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function ellipsoid(parent, scale, position, material) {
  if (!shapes.has('sphere')) shapes.set('sphere', new THREE.SphereGeometry(1, 24, 16));
  const mesh = new THREE.Mesh(shapes.get('sphere'), material); mesh.scale.set(...scale); mesh.position.set(...position);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function rod(parent, a, b, radius, material) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
  const mesh = cylinder(parent, radius, radius, delta.length(), start.add(end).multiplyScalar(.5).toArray(), material, 12);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return mesh;
}
export function vase(parent, position, height, material) {
  const points = [[0, 0], [.22, 0], [.28, .12], [.31, .4], [.22, .68], [.1, .84], [.1, 1], [.075, 1], [.075, .86]];
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r * height, y * height)), 32), material);
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function foldedFabric(parent, width, depth, position, material, drop = .16) {
  const geometry = new THREE.PlaneGeometry(width, depth, 40, 40); geometry.rotateX(-Math.PI / 2);
  const vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i), z = vertices.getZ(i), edge = Math.max(0, Math.abs(x) / (width / 2) - .82) / .18;
    vertices.setY(i, Math.sin(z * 27 + Math.sin(x * 12)) * .012 + Math.cos(x * 21 + z * 8) * .008 - Math.pow(edge, 2) * drop);
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
