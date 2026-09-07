import * as THREE from 'three';
import { furnishingLayout, productFor, stylingRug } from './furnishing-plan.js';
import { block, cylinder, ellipsoid, rod, vase, foldedFabric } from './geometry.js';
import { random } from './materials.js';

function cushion(g, size, position, material, tilt = 0) {
  const c = block(g, size, position, material, .055); c.rotation.x = tilt;
  // Fine upholstery piping rather than a hard rectangular edge.
  const [w, h, d] = size;
  const points = [[-w/2+.045, 0, -d/2+.025], [0, 0, -d/2+.012], [w/2-.045, 0, -d/2+.025], [w/2-.012, 0, 0], [w/2-.045, 0, d/2-.025], [0, 0, d/2-.012], [-w/2+.045, 0, d/2-.025], [-w/2+.012, 0, 0]].map((p) => new THREE.Vector3(...p));
  const seam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 40, .0018, 5, true), material);
  seam.position.set(...position); seam.position.y += h * .05; seam.rotation.x = tilt; g.add(seam); return c;
}
function legs(g, w, d, height, m, inset = .09) {
  for (const x of [-w/2+inset, w/2-inset]) for (const z of [-d/2+inset, d/2-inset]) {
    const leg = cylinder(g, .027, .018, height, [x, height/2, z], m, 16); leg.rotation.z = x > 0 ? -.04 : .04;
  }
}
function sofa(g, [w, d, h], m) {
  legs(g, w, d, .15, m.black, .16);
  block(g, [w-.04, .20, d-.02], [0, .24, 0], m.fabric, .05);
  for (const x of [-w/2+.12, w/2-.12]) block(g, [.24, .41, d], [x, .345, 0], m.fabric, .045);
  block(g, [w-.44, .43, .19], [0, h-.215, -d/2+.095], m.fabric, .035);
  for (const x of [-(w-.48)/4, (w-.48)/4]) {
    cushion(g, [(w-.50)/2, .165, .73], [x, .405, .075], m.fabric);
    cushion(g, [(w-.50)/2, .40, .20], [x, .625, -.295], m.fabric, -.13);
  }
  for (const [x, mat, angle] of [[-.71, m.linen, -.16], [.73, m.oliveFabric, .18]]) {
    const pillow = cushion(g, [.40, .40, .15], [x, .65, -.06], mat, -.22); pillow.rotation.z = angle;
  }
  foldedFabric(g, .54, .72, [-.65, .501, .02], m.clayFabric, .08);
}
function chair(g, [w, d, h], m) {
  legs(g, w, d, .46, m.lightOak, .065);
  block(g, [w, .035, .42], [0, .46, .02], m.lightOak, .055);
  for (const x of [-.17, .17]) rod(g, [x, .3, -.17], [x, h-.06, -.22], .019, m.lightOak);
  const back = block(g, [w-.015, .18, .026], [0, h-.10, -.215], m.lightOak, .038); back.rotation.x = -.12;
}
function roundTable(g, [diameter, , h], m) {
  // Generic preview until the owner's exact table model is confirmed.
  const radius = diameter/2;
  cylinder(g, radius, radius-.006, .03, [0,h-.015,0], m.lightOak, 80);
  cylinder(g, radius*.68, radius*.64, .065, [0,h-.0625,0], m.lightOak, 64);
  for (const x of [-1,1]) for (const z of [-1,1]) {
    rod(g,[x*radius*.58,.025,z*radius*.58],[x*radius*.42,h-.04,z*radius*.42],.024,m.lightOak);
  }
  vase(g, [0,h,0], .13, m.ceramic);
}
function coffee(g, [w, , h], m) {
  cylinder(g, w/2, w/2, .028, [0, h-.014, 0], m.oak, 64);
  cylinder(g, w/2-.055, w/2-.055, .02, [0, .14, 0], m.oak, 64);
  for (let i=0; i<3; i++) {
    const a = i*Math.PI*2/3; rod(g, [Math.sin(a)*.35, .015, Math.cos(a)*.35], [Math.sin(a)*.31, h-.03, Math.cos(a)*.31], .022, m.oak);
  }
  block(g, [.25, .025, .20], [-.07, h+.013, .035], m.white, .002);
  block(g, [.23, .02, .18], [-.055, h+.035, .035], m.clayFabric, .002);
  vase(g, [.17, h, -.11], .14, m.terracotta);
}
function side(g, [w, d, h], m) {
  for(const x of [-.15,.15]) for(const z of [-.15,.15]) rod(g,[x,.015,z],[x,h-.02,z],.008,m.white);
  rod(g,[-.15,.024,-.15],[.15,.024,.15],.008,m.white);
  rod(g,[-.15,.024,.15],[.15,.024,-.15],.008,m.white);
  cylinder(g,w/2-.005,w/2-.005,.008,[0,h-.024,0],m.white,48);
  const rim=new THREE.Mesh(new THREE.LatheGeometry([[w/2-.006,h-.028],[w/2-.006,h],[w/2,h],[w/2,h-.028]].map(p=>new THREE.Vector2(...p)),48),m.white);
  rim.castShadow=true;rim.receiveShadow=true;g.add(rim);
  vase(g,[0,h-.02,0],.14,m.ceramic);
}
function bed(g, [w, d, h], m) {
  block(g, [w, h, .055], [0, h/2, -d/2+.0275], m.lightOak, .009);
  for (const x of [-w/2+.025, w/2-.025]) block(g, [.05, .28, d-.07], [x, .24, .035], m.lightOak);
  block(g, [w, .28, .045], [0, .24, d/2-.023], m.lightOak);
  cushion(g, [1.60, .23, 1.99], [0, .45, .02], m.linen);
  foldedFabric(g, 1.77, 1.46, [0, .577, .30], m.linen, .11);
  for (const x of [-.4, .4]) cushion(g, [.67, .13, .43], [x, .625, -.68], m.linen);
  foldedFabric(g, 1.82, .44, [0, .6, .63], m.oliveFabric, .16);
}
function daybed(g, [w, d, h], m) {
  block(g, [w-.08, .37, d-.04], [0, .225, 0], m.white);
  for (const x of [-w/2+.025, w/2-.025]) {
    block(g, [.05, h, d], [x, h/2, 0], m.white);
    block(g, [.065, .045, d+.01], [x, h-.022, 0], m.white);
  }
  block(g, [w-.05, .45, .025], [0, h-.225, -d/2+.025], m.white);
  for (const x of [-.66, 0, .66]) {
    block(g, [.642, .25, .022], [x, .235, d/2-.01], m.white);
    const knob = cylinder(g, .017, .017, .03, [x, .26, d/2+.008], m.black); knob.rotation.x = Math.PI/2;
  }
  cushion(g, [2, .14, .80], [0, .47, .01], m.linen);
  for (const [x, mat] of [[-.65, m.fabric], [0, m.linen], [.65, m.clayFabric]]) cushion(g, [.50, .30, .17], [x, .66, -.22], mat, -.15);
  foldedFabric(g, .68, .91, [.50, .55, .02], m.fabric, .06);
}
function desk(g, [w, d, h], m) {
  block(g, [w, .034, d], [0, h-.017, 0], m.lightOak);
  block(g, [.36, .69, .56], [-w/2+.20, .345, 0], m.white);
  for (const [y, height] of [[.61, .10], [.50, .10], [.37, .14], [.22, .14], [.075, .13]]) {
    block(g, [.344, height-.007, .016], [-w/2+.20, y, .288], m.white, .003);
    block(g, [.16, .012, .008], [-w/2+.20, y+height/2-.025, .299], m.black, .004);
  }
  for (const z of [-.23, .23]) cylinder(g, .02, .02, h-.034, [w/2-.065, (h-.034)/2, z], m.white);
  // Generic filming/work accessories. Not claimed as IKEA products.
  block(g, [.48, .014, .29], [.05, h+.007, .02], m.black);
  const screen = block(g, [.48, .28, .012], [.05, h+.155, -.13], m.screen); screen.rotation.x = -.14;
  rod(g, [.49, h, -.13], [.48, h+.24, -.13], .008, m.black);
  rod(g, [.48, h+.24, -.13], [.31, h+.38, -.04], .008, m.black);
  cylinder(g, .022, .022, .10, [.31, h+.37, -.04], m.black);
}
function books(g, x, y, z, width, m, seed = 6) {
  const rng = random(seed), palette = [m.white, m.clayFabric, m.fabric, m.oliveFabric, m.lightOak];
  for (let at = x; at < x+width-.04;) {
    const w = .023+rng()*.028, h = .18+rng()*.08;
    const book = block(g, [w, h, .16], [at+w/2, y+h/2, z], palette[Math.floor(rng()*palette.length)], .002);
    book.rotation.z = rng()*.035; at += w+.005;
  }
}
function bookcase(g, [w, d, h], m) {
  block(g, [w, h, .012], [0, h/2, -d/2+.006], m.lightOak, .002);
  for (const x of [-w/2+.009, w/2-.009]) block(g, [.018, h, d], [x, h/2, 0], m.lightOak, .002);
  for (const y of [.08, .44, .80, 1.16, 1.52, h-.012]) block(g, [w, .018, d], [0, y, 0], m.lightOak, .002);
  books(g, -.33, .09, .01, .60, m); books(g, -.32, .45, .01, .25, m, 17);
  books(g, .02, 1.17, .01, .31, m, 3); books(g, -.30, 1.53, .01, .25, m, 10);
  vase(g, [.19, .45, 0], .23, m.terracotta); vase(g, [-.19, .81, 0], .28, m.ceramic);
  block(g, [.27, .022, .19], [.12, .835, 0], m.white);
  block(g, [.26, .022, .18], [.13, .858, 0], m.clayFabric);
}
function console(g, [w, d, h], m) {
  block(g, [w, h, d], [0, h/2, 0], m.lightOak);
  for (const x of [-.6, 0, .6]) block(g, [.59, h-.02, .016], [x, h/2, d/2+.008], m.white);
  block(g, [1.1, .65, .032], [0, h+.46, -.02], m.black, .018);
  block(g, [1.065, .614, .004], [0, h+.46, .0], m.screen, .005);
  for (const x of [-.36, .36]) rod(g, [x, h+.145, -.02], [x-.04, h, .10], .012, m.black);
  vase(g, [.73, h, .015], .20, m.ceramic);
  plant(g, -w/2+.20, .015, .27, m, h);
}
export function plant(parent, x, z, height, m, base = 0) {
  const group = new THREE.Group(); group.position.set(x, base, z); parent.add(group);
  const potH = height*.24;
  cylinder(group, height*.13, height*.09, potH, [0, potH/2, 0], m.terracotta, 32);
  cylinder(group, height*.12, height*.12, .01, [0, potH, 0], m.soil, 32);
  const leafGeometry = new THREE.SphereGeometry(1, 12, 8), leaves = new THREE.InstancedMesh(leafGeometry, m.leaf, 22);
  leaves.castShadow = true; leaves.receiveShadow = true;
  const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion(), rng = random(23);
  for (let i=0; i<22; i++) {
    const a = i*2.4, y = potH + (i/22)*height*.65, reach = height*(.12+rng()*.12)*(1-i/35);
    const end = [Math.cos(a)*reach, y+height*.08, Math.sin(a)*reach];
    rod(group, [0, potH, 0], end, .0025*height, m.walnut);
    rotation.setFromEuler(new THREE.Euler(.3*Math.sin(a), -a, .3*Math.cos(a)));
    matrix.compose(new THREE.Vector3(...end), rotation, new THREE.Vector3(height*.10, height*.025, height*.055)); leaves.setMatrixAt(i, matrix);
  }
  group.add(leaves); return group;
}
export function artwork(parent, x, y, z, width, height, m, rotation = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotation; parent.add(g);
  block(g, [width, height, .025], [0, 0, 0], m.oak, .004);
  block(g, [width-.035, height-.035, .012], [0, 0, .018], m.linen, .001);
  // Original cut-paper-style composition, not a reproduced artwork.
  ellipsoid(g, [width*.24, height*.28, .006], [width*.05, height*.11, .031], m.terracotta);
  block(g, [width*.48, height*.18, .008], [-width*.06, -height*.24, .034], m.fabric, .015);
  rod(g, [-width*.23, -height*.12, .042], [width*.13, height*.27, .042], .003, m.black);
}
export function curtain(parent, x, z, width, height, m) {
  const geometry = new THREE.PlaneGeometry(width, height, 48, 32), p = geometry.attributes.position;
  for (let i=0; i<p.count; i++) {
    const px = p.getX(i), py = p.getY(i);
    p.setZ(i, .046*Math.sin(px/width*Math.PI*12) + .015*Math.sin(py*2+px*10));
    p.setY(i, py + .006*Math.cos(px*30)*(height/2-py)/height);
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, m.linen); mesh.position.set(x, height/2+.025, z); mesh.rotation.y = -Math.PI/2;
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
}
export function paperPendant(parent, x, z, y, m, radius = .25) {
  rod(parent, [x, 3.36, z], [x, y, z], .003, m.white);
  ellipsoid(parent, [radius, radius*.9, radius], [x, y, z], m.glow);
  for (let i=-5; i<=5; i++) {
    const lat = i/6*Math.PI/2, r = radius*Math.cos(lat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .0015, 4, 48), m.fabric);
    ring.rotation.x = Math.PI/2; ring.position.set(x, y+Math.sin(lat)*radius*.9, z); parent.add(ring);
  }
}
export function createStyledFurniture(parent, m) {
  const models = { sofa, chair, roundTable, coffee, bed, daybed, desk, bookcase, console, side };
  for (const item of furnishingLayout) {
    const group = new THREE.Group(); group.name = item.id; group.userData.product = item.product;
    group.position.set(item.x, 0, item.z); group.rotation.y = item.rotation; parent.add(group);
    models[item.kind](group, productFor(item).size, m);
  }
  const rug = stylingRug;
  block(parent, [rug.width, rug.height, rug.depth], [rug.x, rug.height/2+.002, rug.z], m.rug, .06);
  // Styling stays within the fixed/furniture footprints or against a wall.
  plant(parent, 2.80, 10.05, .43, m, 2.02);
  artwork(parent, 4.61, 1.55, 10.175, .65, .86, m, Math.PI);
  artwork(parent, 5.27, 1.61, 10.175, .40, .55, m, Math.PI);
  artwork(parent, 6.74, 1.75, .485, .75, .93, m);
  paperPendant(parent, 6.55, 4.9, 2.66, m, .225);
  paperPendant(parent, 6.81, 1.5, 2.66, m, .225);
}
