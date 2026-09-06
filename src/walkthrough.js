import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { plan, rooms } from './property.js';
import { EYE_HEIGHT, SPAWN, movePlayer, insidePolygon } from './navigation.js';
import { buildInterior } from './interior-scene.js';
import { cameraViews, recordingRect } from './furnishing-plan.js';

export function createWalkthrough({ renderer, onExit, onRoom }) {
  const canvas = renderer.domElement;
  const original = { tone: renderer.toneMapping, exposure: renderer.toneMappingExposure, ratio: renderer.getPixelRatio(), shadows: renderer.shadowMap.enabled, type: renderer.shadowMap.type, auto: renderer.shadowMap.autoUpdate };
  const { scene, ceiling, furniture, setLighting } = buildInterior(renderer);
  const camera = new THREE.PerspectiveCamera(55, 1, .045, 60); camera.rotation.order = 'YXZ';
  const composer = new EffectComposer(renderer);
  composer.renderTarget1.samples = composer.renderTarget2.samples = 4;
  composer.addPass(new RenderPass(scene, camera));
  const ao = new SSAOPass(scene, camera, 512, 512, 16); ao.kernelRadius = .22; ao.minDistance = .001; ao.maxDistance = .08;
  composer.addPass(ao); composer.addPass(new OutputPass());
  let active = false, furnished = true, raf = 0, lastTime = 0, transitionStart = 0, dirty = true;
  let position = { ...SPAWN }, yaw = 0, pitch = 0, eye = EYE_HEIGHT, transitioning = false, hadLock = false;
  let lastRoom = null, lookPointer = null, width = 1, height = 1;
  const keys = new Set(), heldButtons = new Map();
  const hint = document.getElementById('walk-hint'), lockButton = document.getElementById('mouse-look-button');
  const viewSelect = document.getElementById('walk-view'), lightSelect = document.getElementById('walk-light');
  const qualitySelect = document.getElementById('walk-quality'), recordFrame = document.getElementById('record-frame');
  qualitySelect.value = window.matchMedia('(pointer: coarse)').matches ? 'smooth' : 'detail';
  const startPosition = new THREE.Vector3(plan.width / 2, 15, plan.height / 2);
  const startQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'YXZ'));
  const endQuaternion = new THREE.Quaternion();
  const moveCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  function clearInput() {
    keys.clear(); heldButtons.clear(); lookPointer = null;
    document.querySelectorAll('[data-move]').forEach((b) => b.classList.remove('held'));
  }
  function projection() {
    camera.aspect = width / height; camera.updateProjectionMatrix();
    ao.setSize(Math.max(1, Math.round(width * .75)), Math.max(1, Math.round(height * .75)));
    dirty = true;
  }
  function resize(w, h) {
    width = w; height = h; composer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.5)); composer.setSize(w, h); projection();
    recordFrame.style.width = `${recordingRect(w, h).width}px`;
  }
  function quality() {
    const detail = qualitySelect.value === 'detail'; ao.enabled = detail;
    if (active) renderer.setPixelRatio(Math.min(window.devicePixelRatio, detail ? 1.5 : 1));
    resize(width, height); dirty = true;
  }
  function shot(id) {
    const view = cameraViews[id]; if (!view) return;
    clearInput(); transitioning = false; ceiling.visible = true;
    position = { x: view.x, z: view.z }; eye = view.eye;
    const dx = view.target[0] - view.x, dz = view.target[2] - view.z;
    yaw = Math.atan2(-dx, -dz); pitch = Math.atan2(view.target[1] - eye, Math.hypot(dx, dz));
    camera.fov = view.fov; viewSelect.value = id; recordFrame.hidden = !view.filming;
    if (view.filming) { lightSelect.value = 'recording'; setLighting('recording'); }
    lastRoom = null; projection(); renderer.shadowMap.needsUpdate = true;
  }
  function freeWalk() {
    viewSelect.value = 'free'; eye = EYE_HEIGHT; camera.fov = 55; recordFrame.hidden = true; projection();
  }
  function updateLook(dx, dy) {
    if (!active || transitioning) return;
    yaw -= dx * .0025; pitch = THREE.MathUtils.clamp(pitch - dy * .0025, -1.25, 1.25); dirty = true;
  }
  function stop() {
    active = false; cancelAnimationFrame(raf); raf = 0; hadLock = false; clearInput();
    renderer.toneMapping = original.tone; renderer.toneMappingExposure = original.exposure; renderer.setPixelRatio(original.ratio);
    renderer.shadowMap.enabled = original.shadows; renderer.shadowMap.type = original.type; renderer.shadowMap.autoUpdate = original.auto;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }
  function render() {
    // AO is optional; the physically based scene still works in Smooth mode.
    composer.render(); dirty = false;
  }
  function tick(time) {
    if (!active || document.hidden) return;
    const dt = Math.min((time - lastTime) / 1000 || 0, .05); lastTime = time;
    if (transitioning) {
      const t = Math.min((time - transitionStart) / 1150, 1), eased = t * t * (3 - 2 * t);
      camera.position.lerpVectors(startPosition, new THREE.Vector3(SPAWN.x, EYE_HEIGHT, SPAWN.z), eased);
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, eased); dirty = true;
      if (t === 1) { transitioning = false; ceiling.visible = true; renderer.shadowMap.needsUpdate = true; }
    } else {
      const held = new Set(heldButtons.values());
      let forward = Number(keys.has('KeyW') || keys.has('ArrowUp') || held.has('forward')) - Number(keys.has('KeyS') || keys.has('ArrowDown') || held.has('back'));
      let side = Number(keys.has('KeyD') || keys.has('ArrowRight') || held.has('right')) - Number(keys.has('KeyA') || keys.has('ArrowLeft') || held.has('left'));
      if (keys.has('KeyQ')) { yaw += dt * 1.3; dirty = true; }
      if (keys.has('KeyE')) { yaw -= dt * 1.3; dirty = true; }
      const length = Math.hypot(forward, side);
      if (length) {
        if (viewSelect.value !== 'free') freeWalk();
        forward /= length; side /= length;
        position = movePlayer(position, (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * dt * 1.6, (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * dt * 1.6, furnished); dirty = true;
      }
      camera.position.set(position.x, eye, position.z); camera.rotation.set(pitch, yaw, 0, 'YXZ');
      const room = rooms.find((r) => insidePolygon(position.x, position.z, r.polygon));
      if (room && room.id !== lastRoom) { lastRoom = room.id; onRoom(room); }
    }
    if (dirty) render(); raf = requestAnimationFrame(tick);
  }
  function start(showFurniture, initialView = 'entrance') {
    furnished = showFurniture; furniture.visible = furnished;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
    active = true; shot(initialView); quality(); setLighting(lightSelect.value);
    transitioning = initialView === 'entrance' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ceiling.visible = !transitioning; transitionStart = performance.now(); lastTime = transitionStart;
    hint.textContent = 'WASD / arrows · drag to look · Q/E turn · Esc back';
    lockButton.hidden = !canvas.requestPointerLock || !window.matchMedia('(pointer: fine)').matches;
    canvas.focus({ preventScroll: true }); dirty = true; raf = requestAnimationFrame(tick);
  }
  function requestMouse() {
    if (!active || !canvas.requestPointerLock) return;
    try { canvas.requestPointerLock()?.catch(() => { hint.textContent = 'Mouse capture unavailable. Drag to look.'; }); }
    catch { hint.textContent = 'Mouse capture unavailable. Drag to look.'; }
  }
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) { hadLock = true; hint.textContent = 'Mouse to look · WASD to move · Esc back'; }
    else if (active && hadLock) { hadLock = false; onExit(); }
  });
  document.addEventListener('pointerlockerror', () => { if (active) hint.textContent = 'Mouse capture unavailable. Drag to look.'; });
  document.addEventListener('mousemove', (e) => { if (active && document.pointerLockElement === canvas) updateLook(e.movementX, e.movementY); });
  canvas.addEventListener('pointerdown', (e) => {
    if (!active || transitioning || document.pointerLockElement === canvas || lookPointer || e.button !== 0) return;
    lookPointer = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!active || !lookPointer || lookPointer.id !== e.pointerId) return;
    updateLook(e.clientX-lookPointer.x, e.clientY-lookPointer.y); lookPointer.x=e.clientX; lookPointer.y=e.clientY;
  });
  const releaseLook = (e) => { if (lookPointer?.id === e.pointerId) lookPointer = null; };
  for (const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event,releaseLook);
  window.addEventListener('keydown', (e) => {
    if (!active || e.target.closest?.('dialog, input, textarea, select')) return;
    if (e.code === 'Escape') { e.preventDefault(); onExit(); return; }
    if ([...moveCodes,'KeyQ','KeyE'].includes(e.code)) { e.preventDefault(); keys.add(e.code); }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code)); window.addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', () => {
    clearInput(); cancelAnimationFrame(raf);
    if (active && !document.hidden) { lastTime=performance.now(); dirty=true; raf=requestAnimationFrame(tick); }
  });
  for (const button of document.querySelectorAll('[data-move]')) {
    button.addEventListener('pointerdown',(e)=>{if(!active)return;e.preventDefault();button.setPointerCapture(e.pointerId);heldButtons.set(e.pointerId,button.dataset.move);button.classList.add('held');});
    const release=(e)=>{heldButtons.delete(e.pointerId);button.classList.remove('held');};
    for(const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name,release);
    button.addEventListener('keydown',(e)=>{if(active&&['Space','Enter'].includes(e.code)){e.preventDefault();heldButtons.set(button.id,button.dataset.move);button.classList.add('held');}});
    button.addEventListener('keyup',(e)=>{if(['Space','Enter'].includes(e.code)){heldButtons.delete(button.id);button.classList.remove('held');}});
    button.addEventListener('blur',()=>{heldButtons.delete(button.id);button.classList.remove('held');});
  }
  lockButton.onclick=requestMouse;
  viewSelect.onchange=()=>{
    if(!active)return;
    if(viewSelect.value==='free'){clearInput();transitioning=false;ceiling.visible=true;freeWalk();renderer.shadowMap.needsUpdate=true;}
    else shot(viewSelect.value);
  };
  lightSelect.onchange=()=>{if(active){setLighting(lightSelect.value);dirty=true;}};
  qualitySelect.onchange=()=>{if(active)quality();};
  document.getElementById('walk-reset-button').onclick=()=>{if(active){shot('entrance');canvas.focus({preventScroll:true});}};
  document.getElementById('save-view-button').onclick=()=>{
    if(!active||transitioning)return; render();
    const output=document.createElement('canvas'),ctx=output.getContext('2d');
    const crop=recordFrame.hidden?{x:0,y:0,width,height}:recordingRect(width,height),ratio=canvas.width/width;
    output.width=Math.round(crop.width*ratio);output.height=Math.round(crop.height*ratio);
    ctx.drawImage(canvas,crop.x*ratio,crop.y*ratio,crop.width*ratio,crop.height*ratio,0,0,output.width,output.height);
    ctx.fillStyle='#f4f0e8ed';ctx.fillRect(0,output.height-32,output.width,32);ctx.fillStyle='#514a3e';ctx.font='12px sans-serif';ctx.textAlign='center';
    ctx.fillText('A1 · Nordic concept · Unofficial IKEA approximations · Verify sizes and finishes',output.width/2,output.height-11,output.width-20);
    output.toBlob((blob)=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='a1-nordic-room-concept.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  };
  return {start,stop,resize,get active(){return active;}};
}
