import './style.css';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { property, plan, rooms, walls, windows, doors, terraceOpening, terraceGlass } from './property.js';
import { createWalkthrough } from './walkthrough.js';
import { fixedItems, upperStorage } from './interior.js';
import { audit, sources, documentedDimensions, finishes, confirmationNeeded, ceiling } from './specification.js';
import './audit.css';
import './studio.css';
import { shopping, concept, furnishingLayout, productFor, stylingRug } from './furnishing-plan.js';

const $ = (id) => document.getElementById(id);
const dialog = $('sources-dialog');
const showSources = () => { if (walkthrough?.active) exitWalkthrough(); dialog.showModal(); };
$('sources-button').onclick = showSources;
$('dimensions-button').onclick = showSources;
$('close-sources').onclick = () => dialog.close();
$('official-plan').href = property.brochure;
$('brochure-link').href = property.brochure;
$('property-link').href = property.website;
const productsDialog = $('products-dialog');
const showProducts = () => { if (walkthrough?.active) exitWalkthrough(); productsDialog.showModal(); };
$('products-button').onclick = showProducts; $('walk-products-button').onclick = showProducts;
$('close-products').onclick = () => productsDialog.close();
$('stock-note').textContent = concept.stock;
$('product-model-note').textContent = concept.dimensions;
for (const product of shopping) {
  const card = document.createElement('article'); card.className = 'product-card';
  const name = document.createElement('h3'); name.textContent = product.name;
  const type = document.createElement('p'); type.textContent = `${product.type} · ${product.room}`;
  const finish = document.createElement('p'); finish.textContent = product.finish;
  const size = document.createElement('small'); size.textContent = product.size ? `${product.size.map(v => Math.round(v * 1000)).join(' × ')} mm · ${product.url ? 'nominal' : 'proposed'} W × D × H` : 'Confirm size and installation details on site';
  const note = document.createElement('p'); note.textContent = product.note;
  card.append(name, type, finish, size, note);
  if (product.url) {
    const link = document.createElement('a'); link.href = product.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = product.linkLabel || 'Find this range at IKEA Finland ↗';
    card.append(link);
  }
  $('product-list').append(card);
}
for (const color of concept.palette) { const swatch = document.createElement('i'); swatch.style.background = color; $('concept-palette').append(swatch); }
productsDialog.addEventListener('click', (event) => {
  const r = productsDialog.getBoundingClientRect();
  if (event.target === productsDialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) productsDialog.close();
});
$('audit-summary').textContent = `${audit.documents} documents / ${audit.pages} pages reviewed. No as-built survey supplied.`;
$('ceiling-note').textContent = ceiling.status;
for (const dimension of documentedDimensions) {
  const card = document.createElement('div'); card.className = 'dimension-card';
  for (const [tag, value] of [['strong', dimension.name], ['p', dimension.value], ['small', `${dimension.status} · ${dimension.source}`]]) {
    const element = document.createElement(tag); element.textContent = value; card.append(element);
  }
  $('documented-dimensions').append(card);
}
for (const [id, name, date, note] of sources) {
  const item = document.createElement('li');
  const title = document.createElement('strong'); title.textContent = `${id} · ${name} · ${date}`;
  const description = document.createElement('p'); description.textContent = note; item.append(title, description);
  $('document-sources').append(item);
}
for (const note of confirmationNeeded) { const item = document.createElement('li'); item.textContent = note; $('confirmation-list').append(item); }
for (const finish of Object.values(finishes)) {
  const item = document.createElement('li'); item.textContent = `${finish.name} — ${finish.source}`; $('finish-list').append(item);
}
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});

let renderer, scene, camera, controls, furniture, labels, walkthrough;
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
function text(content, x, y, width = 2, height = 0.54, parent = labels, small = '', onDark = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 176;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = onDark ? '#f6f5ed' : '#536148';
  ctx.font = '500 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(content, 320, small ? 64 : 88, 610);
  if (small) {
    ctx.fillStyle = onDark ? '#dedfd4' : '#8a927d'; ctx.font = '25px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
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
  polygon(plan.outline, finishes.floor.color, -0.02);
  polygon(plan.terrace, finishes.terrace.color, -0.02);
  for (const room of rooms) {
    const mesh = polygon(room.polygon, room.color);
    mesh.material = mesh.material.clone();
    mesh.userData.room = room;
    roomMeshes.push(mesh);
  }
  // Selected finish types; colours and grain are only visual approximations.
  for (const room of rooms.filter((r) => !['bathroom', 'terrace'].includes(r.id))) {
    const xs = room.polygon.map((p) => p[0]), ys = room.polygon.map((p) => p[1]);
    for (let y = Math.min(...ys) + 0.21; y < Math.max(...ys); y += 0.21) line([[Math.min(...xs), y], [Math.max(...xs), y]], '#d4d0c2', 0.025);
  }
  for (let y = 0.46; y < 3.875; y += 0.1) line([[0.18, y], [1.925, y]], '#b8b09e', 0.025);
  for (let x = 0.18; x < 1.925; x += 0.1) line([[x, 0.46], [x, 3.875]], '#b8b09e', 0.025);
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
  const opening = terraceOpening, glass = terraceGlass;
  for (const offset of [0, 0.1]) line([[opening.x, opening.z + offset], [opening.x + opening.width, opening.z + offset]], '#87a3a2', 0.32);
  for (const offset of [0, 0.12]) line([[glass.x + offset, glass.z], [glass.x + offset, glass.z + glass.depth]], '#91a5a0', 0.32);
  for (let y = glass.z; y <= glass.z + glass.depth; y += 0.72) line([[glass.x, y], [glass.x + 0.12, y]], '#91a5a0', 0.32);
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

function addFixtures() {
  // Same fixed footprints as the walkthrough and collision model.
  for (const item of fixedItems) {
    const [x, z, w, d, , color] = item.box;
    rect(x, z, w, d, color, 0.13, scene, '#999e89');
    if (item.kind === 'mirror') {
      rect(x + w - 0.09, z + 0.02, 0.06, d - 0.04, '#acc0b9', 0.14);
      line([[x + 0.06, z + d / 2], [x + w, z + d / 2]], '#939f92', 0.15);
    }
  }
  const [kx, kz, kw, kd] = fixedItems.find((i) => i.id === 'kitchen-base').box;
  rect(kx, kz, kw, kd, finishes.worktop.color, 0.145);
  for (const dx of [0.4, 1.0, 1.5, 2.1]) line([[kx + dx, kz], [kx + dx, kz + kd]], '#abaea0', 0.15);
  rect(kx + 0.4, kz + 0.06, 0.6, 0.48, '#333c36', 0.16);
  rect(kx + 1.6, kz + 0.07, 0.46, 0.46, '#333c36', 0.16);
  line([[kx + 1.8, kz + 0.03], [kx + 1.8, kz + 0.19]], '#242f28', 0.17);
  line([[0.18, 1.35], [1.35, 1.35]], '#414944', 0.17);
  const [vx, vz, vw, vd] = fixedItems.find((i) => i.id === 'vanity').box;
  rect(vx + 0.03, vz + 0.06, vw - 0.06, vd - 0.12, '#dadcd0', 0.16);
  const [tx, tz, tw, td] = fixedItems.find((i) => i.id === 'toilet').box;
  circle(tx + tw * 0.69, tz + td / 2, td / 2 - 0.02, '#f4f4ed', 0.16);
}

function addFurniture() {
  // Dashed overhead outlines keep the worktop and appliances visible below.
  for (const item of upperStorage) {
    const [x,z,w,d,,color] = item.box;
    const geometry = new THREE.BufferGeometry().setFromPoints([[x,z],[x+w,z],[x+w,z+d],[x,z+d],[x,z]].map(([px,pz]) => new THREE.Vector3(px,-pz,.19)));
    const outline = new THREE.Line(geometry,new THREE.LineDashedMaterial({ color: item.kind === 'glass' ? '#64825a' : '#88745e', dashSize: .055, gapSize: .035 }));
    outline.computeLineDistances(); furniture.add(outline);
    rect(x+.015,z+.012,w-.03,.025,color,.195,furniture);
  }
  const rug = stylingRug;
  rect(rug.x-rug.width/2, rug.z-rug.depth/2, rug.width, rug.depth, '#e8e0d0', .035, furniture);
  for (const item of furnishingLayout) {
    const group = new THREE.Group(); group.position.set(item.x, -item.z, 0); group.rotation.z = item.rotation; furniture.add(group);
    const [w, d] = productFor(item).size, wood = ['coffee', 'table', 'chair', 'console', 'bookcase'].includes(item.kind);
    if (['coffee','side'].includes(item.kind)) circle(0, 0, w/2, item.kind === 'side' ? '#eee9de' : '#c9ae86', .1, group, '#a38d6e');
    else rect(-w/2, -d/2, w, d, wood ? '#d6c2a0' : '#e5decf', .1, group, '#aea38e');
    if (item.kind === 'sofa') {
      for (const x of [-w/2+.12, w/2-.12]) rect(x-.12, -d/2, .24, d, '#c5bba8', .12, group);
      rect(-w/2+.24, -d/2, w-.48, .20, '#c5bba8', .12, group);
      line([[0,-d/2+.2],[0,d/2]], '#b4a992', .13, group);
    }
    if (['bed','daybed'].includes(item.kind)) {
      rect(-w/2+.07, -d/2+.08, w-.14, d-.16, '#f6f2e8', .12, group);
      const count=item.kind==='bed'?2:3;
      for(let i=0;i<count;i++) rect(-w/2+.15+i*(w-.2)/count,-d/2+.13,(w-.35)/count,.30,'#e6dfd1',.13,group);
      rect(-w/2+.08, d/2-.50, w-.16, .30, '#90957b', .14, group);
    }
    if(item.kind==='desk') rect(-.20,-.20,.48,.29,'#515951',.12,group);
    if(item.kind==='chair') rect(-w/2,-d/2,w,.05,'#b79f7d',.12,group);
  }
}

function addLabels() {
  for (const room of rooms) {
    const narrow = ['bathroom', 'wardrobe', 'entry'].includes(room.id);
    text(room.short, ...room.label, narrow ? 1.32 : 2.2, narrow ? 0.48 : 0.55, labels, room.code, room.id === 'terrace');
  }
  text('KITCHEN', 4.27, 5.99, 1.6, 0.36);
  // This stays in PNG exports even when room labels are hidden.
  text('A1 · 71 m² · FLOOR 1', 3.02, 11.84, 3.6, 0.7, scene);
  text('NOT FOR FURNITURE ORDERS', 3.02, 12.33, 3.45, 0.38, scene);
  text('Drawing-scale geometry · S01 p.14', 3.02, 12.69, 3.4, 0.36, scene);
}

function selectRoom(id) {
  activeRoom = id;
  const room = rooms.find((item) => item.id === id);
  for (const mesh of roomMeshes) {
    const color = id === 'terrace' ? '#525d4a' : '#cddcbb';
    mesh.material.color.set(mesh.userData.room.id === id ? color : mesh.userData.room.color);
  }
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
  if (!graphicsAvailable || frame || document.hidden || walkthrough?.active) return;
  frame = requestAnimationFrame(() => { frame = 0; if (!walkthrough?.active) renderer.render(scene, camera); });
}
function enterWalkthrough(initialView = 'entrance') {
  if (!graphicsAvailable || walkthrough?.active) return;
  try {
    walkthrough ??= createWalkthrough({ renderer, onExit: exitWalkthrough, onRoom: (room) => {
      $('walk-room').textContent = room.name; selectRoom(room.id);
    } });
    controls.enabled = false;
    document.querySelector('.workspace').classList.add('walking');
    document.body.classList.add('walk-active');
    document.querySelectorAll('.header, .sidebar, footer').forEach((el) => { el.inert = true; });
    $('walk-overlay').hidden = false;
    $('play-button').setAttribute('aria-expanded', 'true');
    renderer.domElement.setAttribute('aria-label', 'A1 first-person walkthrough. WASD or arrows to move, drag to look, Q and E to turn, Escape to return to the floor plan.');
    walkthrough.start($('furniture-toggle').checked, initialView);
    const { width, height } = $('plan-canvas').getBoundingClientRect();
    if (height) walkthrough.resize(width, height);
  } catch (error) {
    console.error('Walkthrough initialization failed', error);
    exitWalkthrough();
    $('gesture-help').textContent = 'Walkthrough could not start. The floor plan is still available.';
  }
}
function exitWalkthrough() {
  walkthrough?.stop();
  if (controls) controls.enabled = true;
  document.querySelector('.workspace').classList.remove('walking');
  document.body.classList.remove('walk-active');
  document.querySelectorAll('.header, .sidebar, footer').forEach((el) => { el.inert = false; });
  $('walk-overlay').hidden = true;
  $('play-button').setAttribute('aria-expanded', 'false');
  if (renderer) renderer.domElement.setAttribute('aria-label', 'A1 top-down floor plan. Drag or arrows to pan, scroll or plus and minus to zoom, zero to fit.');
  $('play-button').focus({ preventScroll: true });
  draw();
}
$('play-button').onclick = () => enterWalkthrough();
$('styled-view-button').onclick = () => enterWalkthrough('living');
$('studio-view-button').onclick = () => enterWalkthrough('video');
$('exit-walk-button').onclick = exitWalkthrough;
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
    camera.updateProjectionMatrix(); renderer.setSize(width, height); walkthrough?.resize(width, height); draw();
  }).observe($('plan-canvas'));
  let pointerStart = null;
  const pointers = new Set();
  let multiplePointers = false;
  canvas.addEventListener('pointerdown', (event) => {
    if (walkthrough?.active) { pointerStart = null; pointers.clear(); return; }
    pointers.add(event.pointerId);
    if (pointers.size === 1) { multiplePointers = false; pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; }
    else multiplePointers = true;
  });
  canvas.addEventListener('pointerup', (event) => {
    if (walkthrough?.active) return;
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
    if (walkthrough?.active) return;
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
    event.preventDefault(); exitWalkthrough(); graphicsAvailable = false;
    $('plan-status').hidden = false;
    $('plan-status').textContent = 'Graphics paused. Reload to restore the plan, or open the published A1 plan using the link in the sidebar.';
    setGraphicsControls(false);
  });
  $('plan-status').hidden = true;
}
function setGraphicsControls(enabled) {
  for (const id of ['furniture-toggle', 'labels-toggle', 'zoom-in', 'zoom-out', 'reset-button', 'save-button', 'play-button', 'styled-view-button', 'studio-view-button']) $(id).disabled = !enabled;
}
$('furniture-toggle').onchange = (event) => { if (furniture) furniture.visible = event.target.checked; draw(); };
$('labels-toggle').onchange = (event) => { if (labels) labels.visible = event.target.checked; draw(); };
$('zoom-in').onclick = () => zoom(1.2);
$('zoom-out').onclick = () => zoom(1 / 1.2);
$('reset-button').onclick = fitPlan;
$('save-button').onclick = () => {
  if (!graphicsAvailable || walkthrough?.active) return;
  // Use a solid background in exports; leave the interactive canvas transparent.
  renderer.setClearColor('#eef0e8', 1); renderer.render(scene, camera);
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = renderer.domElement.width; exportCanvas.height = renderer.domElement.height + 68;
  const ctx = exportCanvas.getContext('2d');
  ctx.fillStyle = '#eef0e8'; ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(renderer.domElement, 0, 0);
  ctx.fillStyle = '#536148'; ctx.textAlign = 'center'; ctx.font = '18px sans-serif';
  ctx.fillText('A1 · Drawing-scale model · NOT for furniture orders · Confirm on site', exportCanvas.width / 2, exportCanvas.height - 30, exportCanvas.width - 32);
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
