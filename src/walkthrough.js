import * as THREE from 'three';
import { plan, rooms, walls, windows, doors } from './property.js';
import { EYE_HEIGHT, WALL_HEIGHT, SPAWN, fixtures, looseFurniture, movePlayer, insidePolygon } from './navigation.js';

export function createWalkthrough({ renderer, onExit, onRoom }) {
  const canvas = renderer.domElement;
  const originalToneMapping = renderer.toneMapping;
  const originalExposure = renderer.toneMappingExposure;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dfe8e5');
  const camera = new THREE.PerspectiveCamera(72, 1, 0.04, 100);
  camera.rotation.order = 'YXZ';
  const furniture = new THREE.Group(); scene.add(furniture);
  let active = false, furnished = true, raf = 0, lastTime = 0, transitionStart = 0;
  let position = { ...SPAWN }, yaw = 0, pitch = 0, transitioning = false, hadLock = false;
  let lastRoom = null, lookPointer = null;
  const keys = new Set(), heldButtons = new Map();
  const hint = document.getElementById('walk-hint');
  const lockButton = document.getElementById('mouse-look-button');
  const materials = new Map();
  function mat(color) {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
    return materials.get(color);
  }
  function box(x, z, w, d, h, color, base = 0, parent = scene) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? mat(color) : color);
    mesh.position.set(x + w / 2, base + h / 2, z + d / 2);
    parent.add(mesh); return mesh;
  }
  function surface(points, y, material) {
    const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
    const geometry = new THREE.ShapeGeometry(shape); geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, material); mesh.position.y = y; scene.add(mesh); return mesh;
  }
  function floorTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#c9ba98'; ctx.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row++) {
      ctx.fillStyle = row % 2 ? '#cfc1a2' : '#c6b694'; ctx.fillRect(0, row * 32 + 1, 256, 30);
      ctx.strokeStyle = '#b6a685'; ctx.beginPath(); ctx.moveTo((row % 3) * 80 + 10, row * 32); ctx.lineTo((row % 3) * 80 + 10, row * 32 + 32); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(0.45, 0.45);
    return texture;
  }
  surface(plan.outline, 0, new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.9, side: THREE.DoubleSide }));
  surface(plan.terrace, 0, mat('#b7ad92'));
  const bath = rooms.find((r) => r.id === 'bathroom');
  surface(bath.polygon, 0.008, mat('#b8c8ba'));
  const ceiling = surface(plan.outline, WALL_HEIGHT, new THREE.MeshStandardMaterial({ color: '#f4f1e8', side: THREE.DoubleSide }));
  for (const [x, z, w, d] of walls) {
    box(x, z, w, d, WALL_HEIGHT, '#e7e3d7');
    box(x - 0.012, z - 0.012, w + 0.024, d + 0.024, 0.095, '#bdbba9');
  }
  const glass = new THREE.MeshStandardMaterial({ color: '#c6e3e2', transparent: true, opacity: 0.28, roughness: 0.15, depthWrite: false, side: THREE.DoubleSide });
  for (const w of windows) {
    const length = w.y2 - w.y1;
    box(w.x1 - 0.19, w.y1, 0.38, length, 0.7, '#e7e3d7');
    box(w.x1 - 0.19, w.y1, 0.38, length, WALL_HEIGHT - 2.25, '#e7e3d7', 2.25);
    box(w.x1 - 0.015, w.y1, 0.03, length, 1.55, glass, 0.7);
    for (const base of [0.7, 2.21]) box(w.x1 - 0.05, w.y1, 0.1, length, 0.04, '#879793', base);
    for (const z of [w.y1, (w.y1 + w.y2) / 2, w.y2 - 0.035]) box(w.x1 - 0.05, z, 0.1, 0.035, 1.55, '#879793', 0.7);
  }
  // Open internal doorways with lintels. No swinging leaf blocks the passage.
  for (const d of doors.slice(1)) {
    const ex = d.x + Math.cos(d.closed) * d.radius, ez = d.y + Math.sin(d.closed) * d.radius;
    box(Math.min(d.x, ex) - 0.04, Math.min(d.y, ez) - 0.04,
      Math.max(0.08, Math.abs(ex - d.x) + 0.08), Math.max(0.08, Math.abs(ez - d.y) + 0.08),
      WALL_HEIGHT - 2.15, '#e7e3d7', 2.15);
  }
  // Close the unused portion of the wide terrace doorway above head height.
  box(6.61, 7.1, 1.56, 0.14, WALL_HEIGHT - 2.15, '#e7e3d7', 2.15);
  box(0.02, 9.08, 0.15, 0.94, 2.15, '#a89a80');
  box(0, 9.08, 0.19, 0.94, WALL_HEIGHT - 2.15, '#e7e3d7', 2.15);
  box(8.72, 7.49, 0.025, 5.76, 2.5, glass);
  for (let z = 7.49; z <= 13.25; z += 0.72) box(8.71, z, 0.045, 0.035, 2.5, '#879793');
  for (const b of fixtures) box(...b);
  // Kitchen worktop, sink and hob.
  box(2.05, 6.4, 2.82, 0.62, 0.045, '#f1efe3', 0.91);
  box(3.6, 6.51, 0.43, 0.4, 0.02, '#8ca39b', 0.96);
  box(2.65, 6.5, 0.5, 0.43, 0.02, '#39433e', 0.96);
  box(3.8, 6.44, 0.025, 0.025, 0.24, '#83948c', 0.96);
  // Bathroom mirror and shower fittings; the shower remains walkable.
  box(0.2, 1.78, 0.015, 0.58, 0.8, '#afc4bd', 1.12);
  box(0.21, 0.74, 0.03, 0.03, 1.05, '#8b9d94', 1.05);
  box(0.21, 0.71, 0.3, 0.16, 0.035, '#8b9d94', 2.1);
  for (const b of looseFurniture) box(...b, 0, furniture);
  // Softer furniture details over the collision volumes.
  box(6.39, 0.68, 1.47, 1.94, 0.13, '#e5e8d6', 0.48, furniture);
  for (const x of [6.47, 7.19]) box(x, 0.76, 0.59, 0.38, 0.1, '#f2f0e5', 0.61, furniture);
  box(3.91, 9.14, 1.75, 0.82, 0.13, '#e5e8d6', 0.48, furniture);
  box(5.3, 9.22, 0.3, 0.65, 0.1, '#f2f0e5', 0.61, furniture);
  box(6.29, 6.03, 1.9, 0.13, 0.2, '#94a682', 0.74, furniture);
  // These are ambient design-study lights, not a daylight simulation.
  scene.add(new THREE.HemisphereLight('#f8f6e9', '#b8b296', 2.4));
  scene.add(new THREE.AmbientLight('#fff5df', 0.65));
  const sunlight = new THREE.DirectionalLight('#fff5e4', 1.5); sunlight.position.set(15, 12, -5); scene.add(sunlight);
  for (const [x, z] of [[4.6, 4.4], [5.6, 1.8], [3.9, 8.3], [1.1, 6], [1, 2.1]]) {
    const light = new THREE.PointLight('#fff0d5', 1.8, 8, 2); light.position.set(x, 2.25, z); scene.add(light);
    box(x - 0.17, z - 0.17, 0.34, 0.34, 0.03, new THREE.MeshBasicMaterial({ color: '#fff4d6' }), 2.65);
  }

  const startPosition = new THREE.Vector3(plan.width / 2, 15, plan.height / 2);
  const startQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'YXZ'));
  const endQuaternion = new THREE.Quaternion();
  const moveCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  function clearInput() { keys.clear(); heldButtons.clear(); lookPointer = null; document.querySelectorAll('[data-move]').forEach((b) => b.classList.remove('held')); }
  function updateLook(dx, dy) {
    if (!active || transitioning) return;
    yaw -= dx * 0.003; pitch = THREE.MathUtils.clamp(pitch - dy * 0.003, -1.25, 1.25);
  }
  function stop() {
    active = false; cancelAnimationFrame(raf); raf = 0; hadLock = false; clearInput();
    renderer.toneMapping = originalToneMapping; renderer.toneMappingExposure = originalExposure;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }
  function tick(time) {
    if (!active || document.hidden) return;
    const dt = Math.min((time - lastTime) / 1000 || 0, 0.05); lastTime = time;
    if (transitioning) {
      const t = Math.min((time - transitionStart) / 1150, 1), eased = t * t * (3 - 2 * t);
      camera.position.lerpVectors(startPosition, new THREE.Vector3(SPAWN.x, EYE_HEIGHT, SPAWN.z), eased);
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, eased);
      if (t === 1) { transitioning = false; ceiling.visible = true; }
    } else {
      const held = new Set(heldButtons.values());
      let forward = Number(keys.has('KeyW') || keys.has('ArrowUp') || held.has('forward')) - Number(keys.has('KeyS') || keys.has('ArrowDown') || held.has('back'));
      let side = Number(keys.has('KeyD') || keys.has('ArrowRight') || held.has('right')) - Number(keys.has('KeyA') || keys.has('ArrowLeft') || held.has('left'));
      if (keys.has('KeyQ')) yaw += dt * 1.5;
      if (keys.has('KeyE')) yaw -= dt * 1.5;
      const length = Math.hypot(forward, side);
      if (length) {
        forward /= length; side /= length;
        position = movePlayer(position, (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * dt * 1.8,
          (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * dt * 1.8, furnished);
      }
      camera.position.set(position.x, EYE_HEIGHT, position.z); camera.rotation.set(pitch, yaw, 0, 'YXZ');
      const room = rooms.find((r) => insidePolygon(position.x, position.z, r.polygon));
      if (room && room.id !== lastRoom) { lastRoom = room.id; onRoom(room); }
    }
    renderer.render(scene, camera); raf = requestAnimationFrame(tick);
  }
  function reset() {
    position = { ...SPAWN }; yaw = 0; pitch = 0; lastRoom = null; clearInput();
  }
  function start(showFurniture) {
    furnished = showFurniture; furniture.visible = furnished;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    reset(); active = true;
    transitioning = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ceiling.visible = !transitioning;
    transitionStart = performance.now(); lastTime = transitionStart;
    hint.textContent = 'WASD / arrows to move · drag to look · Q/E to turn · Esc to exit';
    lockButton.hidden = !canvas.requestPointerLock || !window.matchMedia('(pointer: fine)').matches;
    canvas.focus({ preventScroll: true });
    raf = requestAnimationFrame(tick);
  }
  function resize(width, height) { camera.aspect = width / height; camera.updateProjectionMatrix(); }
  function requestMouse() {
    if (!active || !canvas.requestPointerLock) return;
    try {
      const result = canvas.requestPointerLock();
      result?.catch(() => { hint.textContent = 'Mouse capture unavailable. Drag the view to look around.'; });
    } catch { hint.textContent = 'Mouse capture unavailable. Drag the view to look around.'; }
  }
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) { hadLock = true; hint.textContent = 'Mouse to look · WASD to move · Esc to return to plan'; }
    else if (active && hadLock) { hadLock = false; onExit(); }
  });
  document.addEventListener('pointerlockerror', () => { if (active) hint.textContent = 'Mouse capture unavailable. Drag the view to look around.'; });
  document.addEventListener('mousemove', (e) => { if (active && document.pointerLockElement === canvas) updateLook(e.movementX, e.movementY); });
  canvas.addEventListener('pointerdown', (e) => {
    if (!active || transitioning || document.pointerLockElement === canvas || lookPointer || e.button !== 0) return;
    lookPointer = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!active || !lookPointer || lookPointer.id !== e.pointerId) return;
    updateLook(e.clientX - lookPointer.x, e.clientY - lookPointer.y); lookPointer.x = e.clientX; lookPointer.y = e.clientY;
  });
  function releaseLook(e) { if (lookPointer?.id === e.pointerId) lookPointer = null; }
  canvas.addEventListener('pointerup', releaseLook); canvas.addEventListener('pointercancel', releaseLook); canvas.addEventListener('lostpointercapture', releaseLook);
  window.addEventListener('keydown', (e) => {
    if (!active || e.target.closest?.('dialog, input, textarea, select')) return;
    if (e.code === 'Escape') { e.preventDefault(); onExit(); return; }
    if ([...moveCodes, 'KeyQ', 'KeyE'].includes(e.code)) { e.preventDefault(); keys.add(e.code); }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', () => {
    clearInput(); cancelAnimationFrame(raf);
    if (active && !document.hidden) { lastTime = performance.now(); raf = requestAnimationFrame(tick); }
  });
  for (const button of document.querySelectorAll('[data-move]')) {
    button.addEventListener('pointerdown', (e) => {
      if (!active) return;
      e.preventDefault(); button.setPointerCapture(e.pointerId); heldButtons.set(e.pointerId, button.dataset.move); button.classList.add('held');
    });
    const release = (e) => { heldButtons.delete(e.pointerId); button.classList.remove('held'); };
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, release);
    button.addEventListener('keydown', (e) => { if (active && ['Space', 'Enter'].includes(e.code)) { e.preventDefault(); heldButtons.set(button.id, button.dataset.move); button.classList.add('held'); } });
    button.addEventListener('keyup', (e) => { if (['Space', 'Enter'].includes(e.code)) { heldButtons.delete(button.id); button.classList.remove('held'); } });
    button.addEventListener('blur', () => { heldButtons.delete(button.id); button.classList.remove('held'); });
  }
  lockButton.onclick = requestMouse;
  document.getElementById('walk-reset-button').onclick = () => { if (active) { reset(); transitioning = false; ceiling.visible = true; canvas.focus({ preventScroll: true }); } };
  return { start, stop, resize, get active() { return active; } };
}
