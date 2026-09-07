import * as THREE from 'three';
import { upperStorage } from './interior.js';
import { block, cylinder, vase } from './geometry.js';

// Original cabinet geometry; not official IKEA assets or an installation drawing.
export function createUpperStorage(parent, m) {
  const group = new THREE.Group(); group.name = 'upper-storage-proposal'; parent.add(group);
  const lights = [];
  for (const item of upperStorage) {
    const [x,z,w,d,h] = item.box;
    const unit = new THREE.Group(); unit.name = item.id;
    unit.position.set(x+w/2,item.baseHeight,z+d/2); group.add(unit);
    const body = m.kitchen, t = .018;
    for (const px of [-w/2+t/2,w/2-t/2]) block(unit,[t,h,d-.016],[px,h/2,.008],body,.002);
    for (const y of [t/2,h-t/2]) block(unit,[w-2*t,t,d-.016],[0,y,.008],body,.002);
    block(unit,[w-2*t,h-2*t,.008],[0,h/2,d/2-.004],m.white,.001);
    const frontZ = -d/2+.008;
    if (item.kind === 'glass') {
      const frame = m.upperGreen, edge = .045;
      for (const px of [-w/2+edge/2,w/2-edge/2]) block(unit,[edge-.004,h-.004,.016],[px,h/2,frontZ],frame,.003);
      for (const y of [edge/2,h-edge/2]) block(unit,[w-2*edge,edge-.004,.016],[0,y,frontZ],frame,.003);
      block(unit,[w-2*edge,h-2*edge,.004],[0,h/2,frontZ+.004],m.glass,.001);
      block(unit,[w-2*t,.008,d-.055],[0,h*.52,.009],m.glass,.001);
      block(unit,[w-.07,.008,.014],[0,h-.025,-d/2+.05],m.glow,.001);
      // A small display of occasional-use crockery inside each cupboard.
      for (let i=0;i<3;i++) cylinder(unit,.065,.065,.008,[-.065,.026+i*.009,0],m.ceramic,32);
      vase(unit,[.075,.018,.025],.145,m.ceramic);
      for (const px of [-.065,.065]) cylinder(unit,.032,.026,.085,[px,h*.52+.05,.025],m.white,24);
      const light = new THREE.PointLight('#ffe0ad',.45,.65,2);
      light.position.set(0,h-.045,-d/2+.10); unit.add(light); lights.push(light);
    } else {
      const count = Math.round(w/.4), doorWidth = w/count;
      for (let i=0;i<count;i++) {
        const px = -w/2+doorWidth*(i+.5);
        block(unit,[doorWidth-.006,h-.004,.016],[px,h/2,frontZ],body,.003);
      }
    }
    for (let px=-w/2+.20;px<w/2;px+=.4) block(unit,[.10,.012,.013],[px,.065,-d/2-.0065],m.brass,.003);
  }
  return { group, lights };
}
