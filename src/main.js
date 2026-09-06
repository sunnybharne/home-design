import './style.css';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { property, plan, rooms, walls, windows, doors } from './property.js';

const $ = (id) => document.getElementById(id);
const dialog = $('sources-dialog');
$('sources-button').onclick = () => dialog.showModal();
$('close-sources').onclick = () => dialog.close();
$('official-plan').href = property.brochure;
$('brochure-link').href = property.brochure;
$('property-link').href = property.website;
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});

let renderer, scene, camera, controls, furniture, labels;
let activeRoom = null;
let frame = 0;
let graphicsAvailable = false;
const roomMeshes = [];
const raycaster = new THREE.Raycaster();
const materialCache = new Map();
function material(color) {
  if (!materialCache.has(color)) materialCache.set(color, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
  return materialCache.get(color);
}

// Plan coordinates use X right and Y down; Three.js uses Y up.
function polygon(points, color, z = 0, parent = scene) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, -y)));
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material(color));
  mesh.position.z = z;
  parent.add(mesh);
  return mesh;
}
function line(points, color = '#929681', z = 0.12, parent = scene) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, y]) => new THREE.Vector3(x, -y, z)));
  const mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
  parent.add(mesh);
  return mesh;
}
function rect(x, y, width, height, color, z = 0.08, parent = scene, border = null) {
  const corners = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
  const mesh = polygon(corners, color, z, parent);
  if (border) line([...corners, corners[0]], border, z + 0.005, parent);
  return mesh;
}
function circle(x, y, radius, color, z = 0.09, parent = scene, border = '#9c9f88') {
  const points = Array.from({ length: 49 }, (_, i) => [x + Math.cos(i / 48 * Math.PI * 2) * radius, y + Math.sin(i / 48 * Math.PI * 2) * radius]);
  polygon(points, color, z, parent);
  if (border) line(points, border, z + 0.005, parent);
}
function text(content, x, y, width = 2, height = 0.54, parent = labels, small = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 176;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#536148';
  ctx.font = '500 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(content, 320, small ? 64 : 88, 610);
  if (small) {
    ctx.fillStyle = '#8a927d'; ctx.font = '25px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(small, 320, 124, 610);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.position.set(x, -y, 0.8); sprite.scale.set(width, height, 1);
  parent.add(sprite);
}

function addFlooring() {
  // A small paper-like shadow behind the plan, not a spatial building model.
  polygon(plan.outline.map(([x, y]) => [x + 0.09, y + 0.1]), '#d4d9cb', -0.05);
  polygon(plan.terrace.map(([x, y]) => [x + 0.09, y + 0.1]), '#d4d9cb', -0.05);
  polygon(plan.outline, '#eae5d8', -0.02);
  polygon(plan.terrace, '#ded9c9', -0.02);
  for (const room of rooms) {
    const mesh = polygon(room.polygon, room.color);
    mesh.material = mesh.material.clone();
    mesh.userData.room = room;
    roomMeshes.push(mesh);
  }
  // Indicative floor finishes. Lines stay within rectangular room bounds.
  for (const [x1, y1, x2, y2] of [[3.83, 0.46, 8.46, 3.17], [1.9, 0.46, 3.73, 3.17], [2.14, 7.25, 5.89, 10.15], [0.19, 3.98, 2.02, 10.15], [2.02, 3.26, 8.46, 7.05]]) {
    for (let y = y1 + 0.21; y < y2; y += 0.21) line([[x1, y], [x2, y]], '#dcdacb', 0.025);
  }
  for (let y = 0.46; y < 3.85; y += 0.4) line([[0.19, y], [1.78, y]], '#cbd5ca', 0.025);
  for (let x = 0.19; x < 1.78; x += 0.4) line([[x, 0.46], [x, 3.85]], '#cbd5ca', 0.025);
  for (let x = 6.45; x < 8.68; x += 0.2) line([[x, 7.49], [x, 13.25]], '#bcbba5', 0.025);
}

function addWallsAndOpenings() {
  for (const [x, y, w, h] of walls) rect(x, y, w, h, '#53604a', 0.3);
  for (const w of windows) {
    rect(w.x1 - 0.1, w.y1, 0.2, w.y2 - w.y1, '#e4f0ed', 0.2);
    for (const offset of [-0.11, 0, 0.11]) line([[w.x1 + offset, w.y1], [w.x2 + offset, w.y2]], '#88a8a8', 0.32);
    const mid = (w.y1 + w.y2) / 2;
    line([[w.x1 - 0.1, mid], [w.x1 + 0.1, mid]], '#88a8a8', 0.32);
  }
  // Terrace opening and openable glazing on its outer edge.
  line([[6.61, 7.14], [8.17, 7.14]], '#87a3a2', 0.32);
  line([[6.61, 7.24], [8.17, 7.24]], '#87a3a2', 0.32);
  line([[8.69, 7.49], [8.69, 13.25]], '#91a5a0', 0.32);
  line([[8.83, 7.49], [8.83, 13.25]], '#91a5a0', 0.32);
  for (let y = 7.49; y <= 13.25; y += 0.72) line([[8.69, y], [8.83, y]], '#91a5a0', 0.32);
  for (const d of doors) {
    const arc = Array.from({ length: 25 }, (_, i) => {
      const angle = d.closed + (d.open - d.closed) * i / 24;
      return [d.x + Math.cos(angle) * d.radius, d.y + Math.sin(angle) * d.radius];
    });
    line(arc, '#959e86', 0.34);
    line([[d.x, d.y], arc.at(-1)], '#79866a', 0.35);
  }
  // Entrance marker outside the apartment.
  line([[-0.95, 9.57], [-0.22, 9.57]], '#7b8c64', 0.3);
  line([[-0.43, 9.41], [-0.22, 9.57], [-0.43, 9.73]], '#7b8c64', 0.3);
}

function cabinet(x, y, w, h, parent = scene) {
  rect(x, y, w, h, '#f4f1e7', 0.13, parent, '#a6ab94');
  line([[x + 0.08, y + 0.08], [x + w - 0.08, y + h - 0.08]], '#b7bba8', 0.14, parent);
}
function addFixtures() {
  // Fixed kitchen run (indicative appliance widths).
  for (let i = 0; i < 6; i++) rect(2.05 + i * 0.56, 6.4, 0.56, 0.62, '#f4f2e9', 0.13, scene, '#a6ab94');
  for (const [x, y] of [[2.77, 6.57], [3.0, 6.57], [2.77, 6.83], [3.0, 6.83]]) circle(x, y, 0.08, '#e5e7da', 0.15);
  rect(3.61, 6.51, 0.41, 0.38, '#d7e1da', 0.15, scene, '#a3afa1');
  line([[3.82, 6.4], [3.82, 6.56]], '#879980', 0.17);
  cabinet(4.87, 6.4, 0.56, 0.62);
  // Hall storage, bedroom storage and wardrobe fittings.
  cabinet(0.2, 6.0, 0.64, 1.03); cabinet(0.2, 7.23, 0.64, 1.25);
  cabinet(2.18, 7.28, 0.58, 1.03);
  cabinet(2.0, 0.48, 0.52, 2.58);
  cabinet(2.57, 0.48, 1.1, 0.53); cabinet(2.57, 2.55, 1.1, 0.53);
  // Bathroom: shower, basin, toilet and laundry provision.
  rect(0.23, 0.51, 1.47, 1.03, '#e7eee7', 0.12, scene, '#a5b5a3');
  line([[0.23, 1.53], [1.5, 1.53]], '#8eaaa4', 0.17);
  circle(0.58, 0.83, 0.08, '#9caf9b', 0.16);
  rect(0.23, 1.73, 0.45, 0.67, '#fafbf5', 0.14, scene, '#a6b09d');
  circle(0.46, 2.01, 0.13, '#d3e0d8', 0.16);
  rect(0.24, 2.51, 0.34, 0.33, '#f5f7ed', 0.14, scene, '#a6b09d');
  circle(0.65, 2.68, 0.22, '#f5f7ed', 0.16);
  rect(0.24, 3.19, 0.61, 0.59, '#f0f2e7', 0.14, scene, '#a6b09d');
  circle(0.54, 3.49, 0.19, '#e0e7dc', 0.16);
}

function bed(x, y, w, h, horizontal = false) {
  rect(x - 0.07, y - 0.06, w + 0.14, h + 0.12, '#c6c5b0', 0.07, furniture);
  rect(x, y, w, h, '#f8f5eb', 0.08, furniture, '#b3b6a1');
  if (horizontal) {
    rect(x + w - 0.43, y + 0.1, 0.3, h - 0.2, '#fffdf4', 0.11, furniture, '#d0d0bf');
    rect(x + 0.14, y + 0.04, w - 0.77, h - 0.08, '#d2d7c1', 0.1, furniture);
  } else {
    rect(x + 0.1, y + 0.12, w / 2 - 0.15, 0.38, '#fffdf4', 0.11, furniture, '#d0d0bf');
    rect(x + w / 2 + 0.05, y + 0.12, w / 2 - 0.15, 0.38, '#fffdf4', 0.11, furniture, '#d0d0bf');
    rect(x + 0.04, y + 0.7, w - 0.08, h - 0.79, '#d2d7c1', 0.1, furniture);
  }
}
function addFurniture() {
  // Loose furniture is a design suggestion, not a fitted package or a measured fit.
  bed(6.35, 0.63, 1.55, 2.02);
  rect(5.87, 0.66, 0.36, 0.42, '#c8c3ab', 0.1, furniture);
  bed(3.86, 9.09, 1.85, 0.92, true);
  rect(3.61, 7.55, 1.34, 0.55, '#c9c5b1', 0.08, furniture, '#b1b49c');
  circle(4.26, 8.31, 0.23, '#d3d6c2', 0.1, furniture);
  // Dining table and four chairs.
  circle(3.06, 4.65, 0.57, '#c8c4aa', 0.1, furniture);
  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) circle(3.06 + Math.cos(angle) * 0.91, 4.65 + Math.sin(angle) * 0.91, 0.23, '#e3e5d7', 0.09, furniture);
  // Living-room rug, sofa and coffee table.
  rect(6.15, 4.34, 2.02, 1.83, '#e4dfcf', 0.06, furniture);
  rect(6.29, 5.42, 1.9, 0.74, '#c0cbb2', 0.1, furniture, '#a7b498');
  rect(6.37, 5.44, 0.8, 0.52, '#d6deca', 0.11, furniture, '#bdc8ae');
  rect(7.22, 5.44, 0.87, 0.52, '#d6deca', 0.11, furniture, '#bdc8ae');
  circle(7.38, 4.84, 0.37, '#c3bca1', 0.12, furniture);
  rect(6.44, 3.37, 1.58, 0.3, '#c8c1a7', 0.08, furniture);
}

function addLabels() {
  for (const room of rooms) {
    const narrow = ['bathroom', 'wardrobe', 'entry'].includes(room.id);
    text(room.short, ...room.label, narrow ? 1.32 : 2.2, narrow ? 0.48 : 0.55, labels, room.code);
  }
  text('KITCHEN', 4.27, 5.99, 1.6, 0.36);
  // This stays in PNG exports even when room labels are hidden.
  text('A1 · 71 m² · FLOOR 1', 3.02, 11.84, 3.6, 0.7, scene);
  text('INDICATIVE REDRAW · NOT TO SCALE', 3.02, 12.33, 3.45, 0.38, scene);
  text('Reference: official brochure, p.25', 3.02, 12.69, 3.4, 0.36, scene);
}

function selectRoom(id) {
  activeRoom = id;
  const room = rooms.find((item) => item.id === id);
  for (const mesh of roomMeshes) mesh.material.color.set(mesh.userData.room.id === id ? '#cddcbb' : mesh.userData.room.color);
  document.querySelectorAll('[data-room]').forEach((button) => {
    const selected = button.dataset.room === id;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('detail-code').textContent = room ? `${room.number} / ${room.code}` : 'THE APARTMENT';
  $('detail-title').textContent = room ? room.name : 'Room to make it yours.';
  $('detail-description').textContent = room ? room.description : 'Two bedrooms, an open living / dining / kitchen area, a bathroom, a walk-in wardrobe and a private terrace.';
  draw();
}
for (const room of rooms) {
  const button = document.createElement('button');
  button.className = 'room-button'; button.dataset.room = room.id;
  button.setAttribute('aria-pressed', 'false');
  for (const value of [room.number, room.name, '↗']) { const span = document.createElement('span'); span.textContent = value; button.append(span); }
  button.onclick = () => selectRoom(activeRoom === room.id ? null : room.id);
  $('room-list').append(button);
}
$('clear-room').onclick = () => selectRoom(null);

function draw() {
  if (!graphicsAvailable || frame || document.hidden) return;
  frame = requestAnimationFrame(() => { frame = 0; renderer.render(scene, camera); });
}
function fitPlan() {
  if (!camera) return;
  const x = plan.width / 2 - 0.1;
  const y = -plan.height / 2;
  camera.position.set(x, y, 30); camera.zoom = 1;
  controls.target.set(x, y, 0); camera.updateProjectionMatrix(); controls.update(); draw();
}
function zoom(factor) {
  if (!camera) return;
  camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, 0.65, 5);
  camera.updateProjectionMatrix(); draw();
}
function init() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor('#eef0e8', 0);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'A1 top-down floor plan. Drag or arrow keys to pan. Scroll or plus and minus to zoom. Press zero to fit. Use the room list to select a room.');
  $('plan-canvas').append(canvas);
  camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 100);
  controls = new MapControls(camera, canvas);
  controls.enableRotate = false; controls.enableDamping = false;
  controls.screenSpacePanning = true; controls.minZoom = 0.65; controls.maxZoom = 5;
  controls.addEventListener('change', draw);
  furniture = new THREE.Group(); labels = new THREE.Group(); scene.add(furniture, labels);
  addFlooring(); addFixtures(); addFurniture(); addWallsAndOpenings(); addLabels();
  furniture.visible = $('furniture-toggle').checked; labels.visible = $('labels-toggle').checked;
  graphicsAvailable = true;
  fitPlan();
  new ResizeObserver(() => {
    const { width, height } = $('plan-canvas').getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const viewHeight = Math.max(plan.height + 1.4, (plan.width + 2.8) / aspect);
    camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix(); renderer.setSize(width, height); draw();
  }).observe($('plan-canvas'));
  let pointerStart = null;
  const pointers = new Set();
  let multiplePointers = false;
  canvas.addEventListener('pointerdown', (event) => {
    pointers.add(event.pointerId);
    if (pointers.size === 1) { multiplePointers = false; pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; }
    else multiplePointers = true;
  });
  canvas.addEventListener('pointerup', (event) => {
    pointers.delete(event.pointerId);
    if (multiplePointers || !pointerStart || pointerStart.id !== event.pointerId || event.button !== 0) return;
    const start = pointerStart; pointerStart = null;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return;
    const bounds = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera);
    const hit = raycaster.intersectObjects(roomMeshes)[0];
    const id = hit?.object.userData.room.id ?? null;
    selectRoom(activeRoom === id ? null : id);
  });
  canvas.addEventListener('pointercancel', (event) => { pointers.delete(event.pointerId); pointerStart = null; });
  canvas.addEventListener('keydown', (event) => {
    if (['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) event.preventDefault();
    if (event.key === '+' || event.key === '=') zoom(1.2);
    if (event.key === '-') zoom(1 / 1.2);
    if (event.key === '0') fitPlan();
    if (event.key === 'Escape') selectRoom(null);
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[event.key];
    if (direction) {
      const offset = new THREE.Vector3(direction[0] * 0.5 / camera.zoom, direction[1] * 0.5 / camera.zoom, 0);
      camera.position.add(offset); controls.target.add(offset); controls.update(); draw();
    }
  });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); graphicsAvailable = false;
    $('plan-status').hidden = false;
    $('plan-status').textContent = 'Graphics paused. Reload to restore the plan, or open the published A1 plan using the link in the sidebar.';
    setGraphicsControls(false);
  });
  $('plan-status').hidden = true;
}
function setGraphicsControls(enabled) {
  for (const id of ['furniture-toggle', 'labels-toggle', 'zoom-in', 'zoom-out', 'reset-button', 'save-button']) $(id).disabled = !enabled;
}
$('furniture-toggle').onchange = (event) => { if (furniture) furniture.visible = event.target.checked; draw(); };
$('labels-toggle').onchange = (event) => { if (labels) labels.visible = event.target.checked; draw(); };
$('zoom-in').onclick = () => zoom(1.2);
$('zoom-out').onclick = () => zoom(1 / 1.2);
$('reset-button').onclick = fitPlan;
$('save-button').onclick = () => {
  if (!graphicsAvailable) return;
  // Use a solid background in exports; leave the interactive canvas transparent.
  renderer.setClearColor('#eef0e8', 1); renderer.render(scene, camera);
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = renderer.domElement.width; exportCanvas.height = renderer.domElement.height + 68;
  const ctx = exportCanvas.getContext('2d');
  ctx.fillStyle = '#eef0e8'; ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(renderer.domElement, 0, 0);
  ctx.fillStyle = '#536148'; ctx.textAlign = 'center'; ctx.font = '18px sans-serif';
  ctx.fillText('A1 · 71 m² · Indicative redraw, not to scale · Official brochure p.25', exportCanvas.width / 2, exportCanvas.height - 30, exportCanvas.width - 32);
  renderer.setClearColor('#eef0e8', 0); draw();
  exportCanvas.toBlob((blob) => {
    if (!blob) { $('gesture-help').textContent = 'Could not export the plan. Please try again.'; return; }
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'saarenhelmi-a1-floor-plan-study.png'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
};
document.addEventListener('visibilitychange', draw);
try { init(); } catch (error) {
  console.error('Floor plan initialization failed', error);
  graphicsAvailable = false;
  $('plan-status').hidden = false;
  $('plan-status').textContent = 'This interactive plan needs WebGL. You can still explore the room list and open the published A1 plan using the sidebar link.';
  setGraphicsControls(false);
}
