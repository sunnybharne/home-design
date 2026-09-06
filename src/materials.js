import * as THREE from 'three';
import { finishes } from './specification.js';

// Deterministic, original textures. No third-party photos, models or downloads.
export function random(seed = 73) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
export function createMaterials(renderer) {
  const maps = [], all = [];
  const rng = random();
  function texture(kind, repeat = 1) {
    const size = 512, c = document.createElement('canvas'); c.width = c.height = size;
    const ctx = c.getContext('2d'), image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let v = 225;
      if (kind === 'linen') v = 209 + 9 * Math.sin(x * Math.PI / 2) + 9 * Math.sin(y * Math.PI / 2) + rng() * 14;
      if (kind === 'plaster') v = 233 + rng() * 20;
      if (kind === 'wood' || kind === 'floor') {
        const strip = kind === 'floor' ? 64 / 3 : 64;
        const row = Math.floor(y / strip), local = y % strip;
        const grain = Math.sin(local * 3.2 + Math.sin(x / 58 + row) * 1.4 + Math.sin(x / 131) * 2);
        v = 222 + grain * 8 + Math.sin(local * .8 + x * .008) * 5 + rng() * 8;
        if (kind === 'floor') {
          v += [0, -10, 3, -4, 7, -5, 1, -8][row % 8];
          if (y % 64 === 0 || (x + row * 127) % 256 === 0) v -= 24;
          else if (local < 1) v -= 9;
        }
      }
      if (kind === 'stone') v = 235 - 30 * Math.pow(Math.max(0, Math.sin(x * .022 + Math.sin(y * .026) * 2 + y * .014)), 16) + rng() * 8;
      if (kind === 'tile') v = x < 2 || y < 2 ? 165 : 229 + rng() * 9;
      if (kind === 'rug') v = 208 + rng() * 37 + Math.sin(x * 2.5) * 8;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = Math.min(255, Math.max(0, v)); image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); maps.push(t); return t;
  }
  function make(color, roughness = .8, extra = {}) {
    const m = new THREE.MeshStandardMaterial({ color, roughness, ...extra }); all.push(m); return m;
  }
  const grain = texture('wood'), linen = texture('linen', 3), floor = texture('floor', .55);
  const plaster = texture('plaster', 2), stone = texture('stone'), tile = texture('tile', 1), pile = texture('rug', 5);
  function bump(map) { const t = map.clone(); t.colorSpace = THREE.NoColorSpace; maps.push(t); return t; }
  const linenBump = bump(linen), woodBump = bump(grain), pileBump = bump(pile);
  const m = {
    wall: make(finishes.wall.color, .94, { bumpMap: bump(plaster), bumpScale: .002 }),
    ceiling: make('#f5f3ef', .96),
    floor: make('#e5d9c2', .63, { map: floor, bumpMap: bump(floor), bumpScale: .007 }),
    oak: make('#cbb08a', .53, { map: grain, bumpMap: woodBump, bumpScale: .003 }),
    lightOak: make('#e1cfac', .57, { map: grain, bumpMap: woodBump, bumpScale: .002 }),
    walnut: make('#6f5038', .6, { map: grain }),
    fabric: make('#d8ceba', .97, { map: linen, bumpMap: linenBump, bumpScale: .011 }),
    linen: make('#f5f1e7', .99, { map: linen, bumpMap: linenBump, bumpScale: .008, side: THREE.DoubleSide }),
    clayFabric: make('#ae765b', .98, { map: linen, bumpMap: linenBump, bumpScale: .008 }),
    oliveFabric: make('#777d64', .99, { map: linen, bumpMap: linenBump, bumpScale: .01 }),
    rug: make('#ebe4d5', 1, { map: pile, bumpMap: pileBump, bumpScale: .015 }),
    mat: make(finishes.terrace.color, 1, { map: pile, bumpMap: pileBump, bumpScale: .008 }),
    kitchen: make(finishes.kitchen.color, .58),
    backsplash: make(finishes.backsplash.color, .16, { metalness: .06 }),
    alder: make(finishes.bathCeiling.color, .65, { map: grain, bumpMap: woodBump, bumpScale: .002 }),
    worktop: make('#f0eeea', .3, { map: stone, bumpMap: bump(stone), bumpScale: .001 }),
    tile: make(finishes.bath.color, .48, { map: tile, bumpMap: bump(tile), bumpScale: .002 }),
    white: make('#eeece5', .55),
    black: make('#242625', .38, { metalness: .2 }),
    metal: make('#b4b3aa', .28, { metalness: .88 }),
    brass: make('#a58b56', .35, { metalness: .75 }),
    ceramic: make('#d4c2a7', .38),
    terracotta: make('#aa7256', .89),
    leaf: make('#415a35', .77, { side: THREE.DoubleSide }),
    leafLight: make('#718052', .8, { side: THREE.DoubleSide }),
    soil: make('#352c23', 1),
    glass: new THREE.MeshPhysicalMaterial({ color: '#f6fcff', roughness: .08, metalness: .05, transparent: true, opacity: .15, depthWrite: false, side: THREE.DoubleSide }),
    screen: make('#171b19', .18, { metalness: .2 }),
    glow: new THREE.MeshStandardMaterial({ color: '#fff3db', emissive: '#ffcc85', emissiveIntensity: .7, roughness: .6 }),
  };
  all.push(m.glass, m.glow);
  return { ...m, make, dispose() { new Set(maps).forEach((t) => t.dispose()); new Set(all).forEach((a) => a.dispose()); } };
}
