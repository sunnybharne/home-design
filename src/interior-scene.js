import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { plan, rooms, walls, windows, doors, terraceOpening, terraceGlass } from './property.js';
import { fixedItems } from './interior.js';
import { ceiling as levels } from './specification.js';
import { createMaterials } from './materials.js';
import { block, cylinder, ellipsoid, rod } from './geometry.js';
import { createStyledFurniture, curtain } from './styled-furniture.js';
import { createUpperStorage } from './upper-storage.js';

export function buildInterior(renderer) {
  const scene = new THREE.Scene(), m = createMaterials(renderer);
  scene.background = new THREE.Color('#e4e9ed');
  const studio = new RoomEnvironment(), generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(studio, .04); scene.environment = environment.texture;
  scene.environmentIntensity = .38; generator.dispose(); studio.dispose();
  const ceiling = new THREE.Group(), furniture = new THREE.Group(); scene.add(ceiling, furniture);
  const H = levels.main;
  function box(x, z, w, d, h, material = m.wall, base = 0, parent = scene, round = .004) {
    return block(parent, [w, h, d], [x+w/2, base+h/2, z+d/2], material, round);
  }
  function surface(points, y, material, parent = scene) {
    const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
    const geometry = new THREE.ShapeGeometry(shape); geometry.rotateX(-Math.PI/2);
    const mesh = new THREE.Mesh(geometry, material); mesh.position.y = y; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  surface(plan.outline, 0, m.floor); surface(plan.terrace, 0, m.mat);
  const bath = rooms.find((r) => r.id === 'bathroom');
  const floorTile = m.tile.clone(); floorTile.map = m.tile.map.clone(); floorTile.map.repeat.set(10, 10);
  floorTile.bumpMap = m.tile.bumpMap.clone(); floorTile.bumpMap.repeat.set(10, 10);
  surface(bath.polygon, .005, floorTile);
  const ceilingMat = m.ceiling.clone(); ceilingMat.side = THREE.DoubleSide;
  surface(plan.outline, H, ceilingMat, ceiling);
  for (const id of ['entry', 'wardrobe', 'bathroom']) {
    const room = rooms.find((r) => r.id === id), mat = id === 'bathroom' ? m.alder.clone() : ceilingMat;
    mat.side = THREE.DoubleSide; surface(room.polygon, levels[id], mat, ceiling);
  }
  box(2, 3.97, .05, 3.07, H-levels.entry, m.wall, levels.entry, ceiling);
  for (const [x, z, w, d] of walls) {
    box(x, z, w, d, H); box(x-.012, z-.012, w+.024, d+.024, .042, m.white);
  }
  for (const [x, z, w, d] of [[1.917,.46,.008,3.415],[.18,.46,1.745,.008],[.18,.46,.008,3.415],[.51,1.355,.008,.95],[.18,1.355,.33,.008],[.18,2.305,.33,.008],[.18,3.867,.775,.008],[1.875,3.867,.05,.008]]) box(x,z,w,d,levels.bathroom,m.tile);
  const windowLights = [];
  RectAreaLightUniformsLib.init();
  for (const w of windows) {
    const length = w.y2-w.y1, mid = (w.y1+w.y2)/2;
    box(w.x1-.23,w.y1,.46,length,.7);
    box(w.x1-.23,w.y1,.46,length,H-2.8,m.wall,2.8);
    box(w.x1-.005,w.y1,.01,length,2.1,m.glass,.7);
    box(w.x1-.28,w.y1,.35,length,.035,m.worktop,.695);
    for (const base of [.7,2.75]) box(w.x1-.045,w.y1,.09,length,.05,m.white,base);
    for (const z of [w.y1,mid,w.y2-.045]) box(w.x1-.045,z,.09,.045,2.1,m.white,.7);
    const light = new THREE.RectAreaLight('#e5efff', 4.0, length, 2.1);
    light.position.set(w.x1-.08,1.85,mid); light.lookAt(w.x1-5,1,mid); scene.add(light); windowLights.push(light);
    // Linen panels are decoration, not a validated curtain installation drawing.
    for (const z of [w.y1+.07,w.y2-.07]) curtain(furniture,w.x1-.32,z,.43,2.96,m);
    rod(furniture,[w.x1-.31,3.015,w.y1-.2],[w.x1-.31,3.015,w.y2+.2],.012,m.white);
  }
  for (const d of doors.slice(1,-1)) {
    const ex=d.x+Math.cos(d.closed)*d.radius, ez=d.y+Math.sin(d.closed)*d.radius;
    const x=Math.min(d.x,ex)-.04,z=Math.min(d.y,ez)-.04,w=Math.max(.08,Math.abs(ex-d.x)+.08),depth=Math.max(.08,Math.abs(ez-d.y)+.08);
    box(x,z,w,depth,H-2.1,m.wall,2.1);
    // Open passages; frame trim, not a fictitious closed door.
    box(x-.018,z-.018,w+.036,depth+.036,.055,m.white,2.065);
    for (const [px,pz] of [[d.x,d.y],[ex,ez]]) box(px-.025,pz-.025,.05,.05,2.1,m.white);
  }
  box(.02,doors[0].y,.15,doors[0].radius,2.1,m.white);
  box(0,doors[0].y,.18,doors[0].radius,H-2.1,m.wall,2.1);
  box(.178,9.18,.01,.06,.19,m.metal,.91);
  rod(scene,[.19,1,9.2],[.30,1,9.2],.012,m.metal);
  box(terraceOpening.x,terraceOpening.z-.04,terraceOpening.width,.14,H-2.8,m.wall,2.8);
  box(terraceGlass.x,terraceGlass.z,.012,terraceGlass.depth,2.5,m.glass);
  for(let z=terraceGlass.z;z<=terraceGlass.z+terraceGlass.depth;z+=.72) box(terraceGlass.x,z,.04,.026,2.5,m.metal);

  for (const item of fixedItems) {
    const [x,z,w,d,h] = item.box;
    if (['shelf','rail'].includes(item.kind)) {
      box(x,z,.016,d,h,m.white); box(x+w-.016,z,.016,d,h,m.white);
      if(item.kind==='shelf') for(let y=.20;y<h;y+=.36) box(x,z,w,d,.016,m.white,y);
      else { box(x,z,w,d,.02,m.white,h-.02); rod(scene,[x+w/2,1.86,z],[x+w/2,1.86,z+d],.013,m.metal); }
    } else if(item.kind==='laundry') {
      for(const dz of [0,d-.016]) box(x,z+dz,w,.016,h,m.white);
      box(x,z+.016,w,d-.032,.576,m.white,1.75);
      for(const base of [0,.83]) {
        box(x,z+.10,.57,.6,.82,m.white,base,scene,.02);
        const drum = cylinder(scene,.20,.20,.025,[x+.58,base+.40,z+.4],m.black,48); drum.rotation.z=Math.PI/2;
        const glass = cylinder(scene,.165,.165,.029,[x+.595,base+.40,z+.4],m.screen,48); glass.rotation.z=Math.PI/2;
        box(x+.575,z+.17,.008,.12,.045,m.screen,base+.71);
      }
    } else if(item.kind==='toilet') {
      box(x,z+.025,.17,d-.05,.82,m.white,0,scene,.05);
      ellipsoid(scene,[.22,.17,.16],[x+.40,.37,z+d/2],m.white);
      ellipsoid(scene,[.17,.022,.145],[x+.40,.43,z+d/2],m.white);
      ellipsoid(scene,[.12,.16,.12],[x+.37,.18,z+d/2],m.white);
    } else {
      const mat=item.kind==='kitchen'||item.kind==='fridge'?m.kitchen:m.white;
      box(...item.box.slice(0,5),mat);
      if(item.kind==='mirror') {
        const mirrorMat = new THREE.MeshStandardMaterial({color:'#d8ded9',metalness:1,roughness:.08});
        box(x+w,z+.02,.004,d-.04,2.361,mirrorMat,.07);
        box(x+w+.006,z+d/2,.006,.012,2.361,m.metal,.07);
        if(item.id==='entry-a' && !window.matchMedia('(pointer: coarse)').matches) {
          const mirror=new Reflector(new THREE.PlaneGeometry(d-.045,2.36),{color:0xd7dcda,textureWidth:512,textureHeight:1024,clipBias:.003});
          mirror.position.set(x+w+.01,1.25,z+d/2);mirror.rotation.y=Math.PI/2;scene.add(mirror);
        }
      }
      if(item.kind==='cabinet') for(const dz of [.275,.775]) { box(x+w,z+dz-.24,.012,.485,h-.17,m.white,.17); box(x+w+.014,z+dz-.04,.012,.08,.012,m.black,1.12); }
    }
  }
  const [kx,kz,kw,kd,kh]=fixedItems.find((i)=>i.id==='kitchen-base').box;
  box(kx,kz,kw,kd,.04,m.worktop,kh);
  box(kx,kz+kd-.013,kw,.013,.46,m.backsplash,kh+.04);
  // Recessed plinth, separate fronts and reveals.
  box(kx+.02,kz+.02,kw-.04,.02,.15,m.black);
  for(const [offset,width] of [[0,.4],[.4,.6],[1,.5],[1.5,.6],[2.1,.622]]) {
    box(kx+offset+.004,kz-.014,width-.008,.016,.70,m.kitchen,.175);
    box(kx+offset+.04,kz-.022,width-.08,.012,.012,m.black,.844);
    box(kx+offset+.004,kz+.26,width-.008,.34,.878,m.kitchen,1.4);
  }
  box(kx+.40,kz-.027,.60,.026,.60,m.black,.166);
  box(kx+.43,kz-.043,.54,.01,.38,m.screen,.23);
  rod(scene,[kx+.46,.735,kz-.052],[kx+.94,.735,kz-.052],.011,m.metal);
  box(kx+.4,kz+.06,.6,.48,.012,m.black,kh+.04);
  for(const dx of [.54,.86]) for(const dz of [.18,.42]) {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.08,.0015,6,32),m.metal); ring.rotation.x=Math.PI/2;ring.position.set(kx+dx,kh+.054,kz+dz);scene.add(ring);
  }
  box(kx+1.6,kz+.07,.46,.46,.008,m.black,kh+.042);
  box(kx+1.64,kz+.11,.38,.38,.012,m.screen,kh+.047);
  const curve=new THREE.CatmullRomCurve3([[kx+1.83,kh+.05,kz+.52],[kx+1.83,kh+.32,kz+.52],[kx+1.83,kh+.36,kz+.36],[kx+1.83,kh+.28,kz+.30]].map(p=>new THREE.Vector3(...p)));
  const faucet=new THREE.Mesh(new THREE.TubeGeometry(curve,30,.012,10,false),m.black);faucet.castShadow=true;scene.add(faucet);
  box(kx+.4,kz+.21,.6,.39,.065,m.black,1.4);
  box(kx+2.12,kz+.244,.56,.016,.38,m.black,1.42);
  box(kx,kz+.255,kw,.018,.009,m.glow,1.392);
  const counterLight=new THREE.RectAreaLight('#ffe4b8',2.5,kw,.12);counterLight.position.set(kx+kw/2,1.38,kz+.30);counterLight.lookAt(kx+kw/2,.9,kz+.2);scene.add(counterLight);
  const [vx,vz,vw,vd,vh]=fixedItems.find((i)=>i.id==='vanity').box;
  box(vx,vz,vw,vd,.035,m.white,vh);
  ellipsoid(scene,[vw*.40,.017,vd*.38],[vx+vw/2,vh+.029,vz+vd/2],m.ceramic);
  box(vx+.02,vz,.016,vd,.70,m.metal,1.15);
  rod(scene,[.22,1.0,.77],[.22,2.1,.77],.013,m.black);
  rod(scene,[.22,2.1,.77],[.50,2.1,.77],.013,m.black);
  cylinder(scene,.10,.10,.022,[.49,2.095,.77],m.black,32);
  createStyledFurniture(furniture,m);
  const upper = createUpperStorage(furniture,m);
  // Grille location is illustrative; the source shows fridge ventilation.
  const [fx,fz,fw,,fh] = fixedItems.find(item => item.id === 'fridge').box;
  box(fx+.04,fz-.006,fw-.08,.012,.075,m.black,fh-.11);
  for (let y=fh-.105;y<fh-.04;y+=.012) box(fx+.045,fz-.014,fw-.09,.009,.004,m.metal,y);

  // Soft studio/daylight approximation, not a sun-path or lux calculation.
  const sky=new THREE.HemisphereLight('#edf3ff','#b1a18c',.48);scene.add(sky);
  const sun=new THREE.DirectionalLight('#fff0da',2.4);sun.position.set(17,6,5);sun.target.position.set(4,0,5);scene.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=9;sun.shadow.camera.bottom=-9;sun.shadow.camera.near=.5;sun.shadow.camera.far=35;sun.shadow.bias=-.00025;sun.shadow.normalBias=.025;sun.shadow.radius=3;
  const lamps=[];
  for(const [x,z,y] of [[6.55,4.9,2.6],[6.81,1.5,2.6],[4.15,8.2,2.55],[1.2,6,2.55],[1.2,2.1,2.14]]) {
    const lamp=new THREE.PointLight('#ffdab0',3,6,2);lamp.position.set(x,y,z);scene.add(lamp);lamps.push(lamp);
  }
  const key=new THREE.SpotLight('#fff2e4',0,7,.8,.8,2);key.position.set(5.5,2.4,8.0);key.target.position.set(3.8,1.3,9.5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.02;scene.add(key,key.target);
  const backdrop=new THREE.PointLight('#ffc889',1.2,2.5,2);backdrop.position.set(2.8,1.75,9.74);scene.add(backdrop);
  function setLighting(mode) {
    const evening=mode==='evening',recording=mode==='recording';
    scene.background.set(evening?'#566678':'#e4e9ed');scene.environmentIntensity=evening?.16:.38;
    sun.intensity=evening?0:2.4;sky.intensity=evening?.13:.48;
    windowLights.forEach(l=>{l.intensity=evening?.35:4;l.color.set(evening?'#869cc2':'#e5efff');});
    lamps.forEach(l=>l.intensity=evening?12:recording?5:3);counterLight.intensity=evening?5:2.5;
    upper.lights.forEach(l=>l.intensity=evening?.9:.45);
    key.intensity=recording?20:evening?6:0;backdrop.intensity=recording||evening?3:1.2;m.glow.emissiveIntensity=evening?2:.7;
    renderer.shadowMap.needsUpdate=true;
  }
  return {scene,ceiling,furniture,setLighting};
}
