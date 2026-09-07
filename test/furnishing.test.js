import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { shopping, concept, furnishingLayout, furnitureBox, furnitureFootprints, cameraViews, recordingRect } from '../src/furnishing-plan.js';
import { fixtures, barriers, looseFurniture, canStand, insidePolygon } from '../src/navigation.js';
import { fixedItems } from '../src/interior.js';
import { plan } from '../src/property.js';
import { createStyledFurniture } from '../src/styled-furniture.js';

function overlap(a, b) {
  return Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]) > .005 && Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]) > .005;
}
test('IKEA references do not claim live store stock or official geometry', () => {
  assert.match(concept.stock, /not checked/);
  assert.match(concept.dimensions, /not verified/);
  assert.match(concept.dimensions, /not official IKEA/);
  assert.equal(new Set(shopping.map(p=>p.id)).size, shopping.length);
  for(const product of shopping) {
    if (product.url) {
      const url=new URL(product.url);assert.equal(url.hostname,'www.ikea.com');assert.ok(url.pathname.startsWith('/fi/fi/'));
    } else {
      assert.match(product.type,/concept/);
      assert.match(product.note,/proposed|Proposed/);
    }
    assert.ok(product.note);if(product.size)assert.ok(product.size.every(n=>Number.isFinite(n)&&n>0));
  }
});
test('furniture has one shared layout and conservative collision envelopes', () => {
  assert.equal(looseFurniture, furnitureFootprints);
  assert.equal(new Set(furnishingLayout.map(p=>p.id)).size,furnishingLayout.length);
  for(const item of furnishingLayout) {
    assert.ok(shopping.some(p=>p.id===item.product),item.id);
    const box=furnitureBox(item);
    for(const [x,z] of [[box[0],box[1]],[box[0]+box[2],box[1]],[box[0],box[1]+box[3]],[box[0]+box[2],box[1]+box[3]]]) assert.ok(insidePolygon(x,z,plan.outline),`${item.id} outside apartment`);
    assert.equal(canStand(item.x,item.z,true),false,item.id);
    assert.ok(![...fixtures,...barriers].some(fixed=>overlap(box,fixed)),`${item.id} overlaps a cabinet, wall or window`);
  }
  for(let i=0;i<furnishingLayout.length;i++)for(let j=i+1;j<furnishingLayout.length;j++) assert.ok(!overlap(furnitureBox(furnishingLayout[i]),furnitureBox(furnishingLayout[j])),`${furnishingLayout[i].id} overlaps ${furnishingLayout[j].id}`);
});
test('island leaves a 120 cm working aisle with seating on the other side', () => {
  const island = furnishingLayout.find(item => item.kind === 'island');
  const [x,z,w,d] = furnitureBox(island);
  const kitchen = fixedItems.find(item => item.id === 'kitchen-base').box;
  assert.ok(kitchen[1]-(z+d) >= 1.2-1e-9);
  const stools = furnishingLayout.filter(item => item.kind === 'stool');
  assert.equal(stools.length,2);
  for (const stool of stools) {
    const [sx,sz,sw,sd] = furnitureBox(stool);
    assert.ok(sz+sd <= z+1e-9, 'stool must stay out of kitchen working aisle');
    assert.ok(sx >= x && sx+sw <= x+w, 'seat must align with island knee space');
  }
  assert.ok(!furnishingLayout.some(item => item.id.startsWith('dining')));
});
test('all saved camera views start in clear floor space, not inside furniture or walls', () => {
  for(const [id,view] of Object.entries(cameraViews)) {
    assert.ok(canStand(view.x,view.z),id);
    assert.ok(view.eye>1 && view.eye<2 && view.fov>=40 && view.fov<=60);
    assert.ok(view.target.every(Number.isFinite));
  }
});
test('16:9 recording crop stays centred and fits portrait and landscape screens', () => {
  for(const [w,h] of [[390,844],[1280,800],[1920,1080],[844,390]]) {
    const r=recordingRect(w,h);assert.ok(Math.abs(r.width/r.height-16/9)<1e-10);
    assert.ok(r.x>0&&r.y>0&&r.x+r.width<w&&r.y+r.height<h);
    assert.ok(Math.abs(r.x*2+r.width-w)<1e-10);
  }
});
test('original styled models have rounded geometry, separate legs, upholstery and finite transforms', () => {
  const material=new THREE.MeshStandardMaterial();
  const materials=new Proxy({}, {get:()=>material});
  const group=new THREE.Group();createStyledFurniture(group,materials);group.updateMatrixWorld(true);
  let meshes=0,rounded=0,triangles=0;
  group.traverse(object=>{
    if(!object.isMesh)return;meshes++;
    assert.ok(object.position.toArray().every(Number.isFinite));
    assert.ok(object.scale.toArray().every(n=>Number.isFinite(n)&&n>0));
    const position=object.geometry.attributes.position;
    assert.ok([...position.array].every(Number.isFinite),object.name);
    if(object.geometry.type==='RoundedBoxGeometry')rounded++;
    triangles+=(object.geometry.index?.count ?? position.count)/3;
  });
  for(const item of furnishingLayout) {
    const model=group.getObjectByName(item.id);assert.ok(model && model.children.length>=4,item.id);
    const bounds=new THREE.Box3().setFromObject(model);
    assert.ok(!bounds.isEmpty());
    // Decorations can sit above a product; its plan envelope should still agree.
    const box=furnitureBox(item);
    assert.ok(bounds.min.x>=box[0]-.08&&bounds.max.x<=box[0]+box[2]+.08,`${item.id} X envelope`);
    assert.ok(bounds.min.z>=box[1]-.08&&bounds.max.z<=box[1]+box[3]+.08,`${item.id} Z envelope`);
  }
  assert.ok(meshes>150 && meshes<850,`mesh budget: ${meshes}`);
  assert.ok(rounded>50);assert.ok(triangles<500000,`triangle budget: ${triangles}`);
});
test('rendering and filming controls are explicit, with a lighter GPU option and photo caveats', () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  for(const id of ['walk-view','walk-light','walk-quality','record-frame','save-view-button','products-dialog','stock-note'])assert.ok(html.includes(`id="${id}"`));
  assert.match(html,/not a photograph/);assert.match(html,/They do not soundproof/);
  const js=readFileSync(new URL('../src/walkthrough.js',import.meta.url),'utf8');
  for(const word of ['SSAOPass','ACESFilmicToneMapping','shadowMap','recordingRect','original.ratio','if (dirty) render()']) assert.ok(js.includes(word),word);
  assert.match(js,/value === 'detail'/);
});
