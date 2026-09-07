import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fixedItems, fixtures, upperStorage, kitchenServiceSpaces } from '../src/interior.js';
import { ceiling, upperStorageConcept } from '../src/specification.js';
import { createUpperStorage } from '../src/upper-storage.js';

const epsilon = 1e-6;
const overlap = (a, b) => Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]) > epsilon
  && Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]) > epsilon;

test('short upper cupboards stay above the kitchen and separate from floor obstacles', () => {
  const [kx,kz,kw,kd] = fixedItems.find(item => item.id === 'kitchen-base').box;
  const existingTop = fixedItems.find(item => item.id === 'fridge').box[4];
  assert.ok(upperStorage.length > 0);
  assert.equal(new Set(upperStorage.map(item => item.id)).size, upperStorage.length);
  for (const item of upperStorage) {
    const [x,z,w,d,h] = item.box;
    assert.ok([x,z,w,d,h,item.baseHeight].every(Number.isFinite), item.id);
    assert.ok(w > 0 && d > 0 && h > 0, item.id);
    assert.ok(x >= kx-epsilon && x+w <= kx+kw+epsilon, `${item.id} above kitchen width`);
    assert.ok(z >= kz-epsilon && z+d <= kz+kd+epsilon, `${item.id} above kitchen depth`);
    assert.ok(item.baseHeight >= existingTop, `${item.id} above existing cabinets`);
    assert.ok(item.baseHeight+h < ceiling.main, `${item.id} below provisional ceiling`);
    assert.ok(!fixedItems.some(fixed => fixed.id === item.id), `${item.id} is a proposal`);
    assert.ok(!fixtures.some(box => box.slice(0,4).every((n,i) => Math.abs(n-item.box[i]) < epsilon)), `${item.id} has no floor obstacle`);
  }
  const glass = upperStorage.filter(item => item.kind === 'glass');
  assert.equal(glass.length, 2);
  for (const item of glass) assert.deepEqual(item.box.slice(2,5), [.4,.389,.4]);
  assert.match(upperStorageConcept.status, /not verified/);
});

test('the added cupboards leave both reserved service spaces open', () => {
  assert.deepEqual(kitchenServiceSpaces.map(space => space.id).sort(), ['extractor','fridge']);
  for (const space of kitchenServiceSpaces) {
    assert.ok(space.top > space.baseHeight);
    for (const item of upperStorage) {
      const heightOverlap = Math.min(item.baseHeight+item.box[4],space.top)-Math.max(item.baseHeight,space.baseHeight) > epsilon;
      assert.ok(!(heightOverlap && overlap(item.box,space.box)), `${item.id} blocks ${space.id}`);
    }
  }
  for (let i=0; i<upperStorage.length; i++) for (let j=i+1; j<upperStorage.length; j++) {
    assert.ok(!overlap(upperStorage[i].box,upperStorage[j].box), `${upperStorage[i].id} overlaps ${upperStorage[j].id}`);
  }
});

test('upper storage meshes fit their planned envelopes with two lit glass cupboards', () => {
  const names = ['kitchen','white','upperGreen','glass','glow','ceramic','brass'];
  const materials = Object.fromEntries(names.map(name => [name, new THREE.MeshStandardMaterial({ transparent: name === 'glass' })]));
  const parent = new THREE.Group();
  const { group, lights } = createUpperStorage(parent, materials);
  group.updateMatrixWorld(true);
  assert.equal(group.parent, parent, 'proposal belongs to the furniture visibility group');
  assert.equal(group.children.length, upperStorage.length);
  assert.equal(lights.length, 2);
  const sceneLights = [];
  group.traverse(object => {
    if (object.isLight) sceneLights.push(object);
    if (!object.isMesh) return;
    assert.ok(names.some(name => object.material === materials[name]), 'known cabinet material');
    assert.ok(object.position.toArray().every(Number.isFinite));
    assert.ok(object.scale.toArray().every(n => Number.isFinite(n) && n > 0));
    assert.ok([...object.geometry.attributes.position.array].every(Number.isFinite));
  });
  assert.deepEqual(sceneLights, lights);
  for (const item of upperStorage) {
    const unit = group.getObjectByName(item.id);
    assert.ok(unit, item.id);
    const bounds = new THREE.Box3().setFromObject(unit);
    const [x,z,w,d,h] = item.box;
    assert.ok(!bounds.isEmpty(), item.id);
    for (const [axis,start,size] of [['x',x,w],['y',item.baseHeight,h],['z',z,d]]) {
      const handleProjection = axis === 'z' ? .013 : 0;
      assert.ok(bounds.min[axis] >= start-handleProjection-epsilon && bounds.max[axis] <= start+size+epsilon, `${item.id} ${axis} envelope with handles`);
      assert.ok(bounds.max[axis]-bounds.min[axis] >= size-.01, `${item.id} fills ${axis} envelope`);
    }
    if (item.kind === 'glass') {
      const meshes = [];
      unit.traverse(object => { if (object.isMesh) meshes.push(object); });
      assert.ok(meshes.some(mesh => mesh.material === materials.upperGreen));
      assert.ok(meshes.some(mesh => mesh.material === materials.glass));
      const light = lights.find(light => light.parent === unit);
      assert.ok(light?.isPointLight && light.intensity > 0 && light.distance > 0, `${item.id} light`);
    }
  }
  for (const material of Object.values(materials)) material.dispose();
});
