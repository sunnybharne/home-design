import { finishes } from './specification.js';
import { furnitureFootprints } from './furnishing-plan.js';

// Positions use S01 drawing-scale coordinates. A sourced SIZE does not verify its
// position or the room clearance. box = [x, z, width along X, depth along Z, height, colour].
export const fixedItems = [
  { id: 'kitchen-base', kind: 'kitchen', box: [2.025, 6.44, 2.722, 0.6, 0.9, finishes.kitchen.color], source: 'S05 p.1; S12 p.10', sizeNote: 'Worktop 2722 × 600 mm is stated; base height is estimated.' },
  { id: 'fridge', kind: 'fridge', box: [4.747, 6.44, 0.632, 0.6, 2.278, finishes.kitchen.color], source: 'S05; S12 pp.2,10', sizeNote: '600 mm nominal module plus side panels; housing height/depth interpreted, not appliance clearance.' },
  { id: 'entry-a', kind: 'mirror', box: [0.18, 7.22, 0.7, 1.2, 2.5, '#f0eee5'], source: 'S02 pp.1–2', sizeNote: 'Documented frame: W1200 × D700 × H2500 mm. Rotated in the plan.' },
  { id: 'entry-b', kind: 'mirror', box: [0.18, 6.0, 0.7, 1.04, 2.5, '#f0eee5'], source: 'S03 pp.1–2', sizeNote: 'Documented frame: W1040 × D700 × H2500 mm. Rotated in the plan.' },
  { id: 'bedroom-cabinet', kind: 'cabinet', box: [2.115, 7.22, 0.6, 1.03, 2.278, '#f1efe8'], source: 'S07 p.1; S12 p.13', sizeNote: '1000 mm modules + 30 mm filler; 2112 + 166 mm height. Depth 600 mm is scale-derived.' },
  { id: 'wardrobe-rail', kind: 'rail', box: [2.025, 0.46, 0.6, 2.7, 2.1, '#ece8dc'], source: 'S08; S12 p.15', sizeNote: '2700 mm enclosure side is stated. Rail depth/height and loaded-clothes clearance are indicative.' },
  { id: 'wardrobe-shelf-a', kind: 'shelf', box: [2.6, 0.46, 1.125, 0.4, 2.1, '#ece8dc'], source: 'S08', sizeNote: '1125 mm shelf run is stated; depth/height are interpreted.' },
  { id: 'wardrobe-shelf-b', kind: 'shelf', box: [2.6, 2.76, 1.125, 0.4, 2.1, '#ece8dc'], source: 'S08', sizeNote: '1125 mm shelf run is stated; depth/height are interpreted.' },
  { id: 'vanity', kind: 'vanity', box: [0.51, 1.615, 0.46, 0.6, 0.85, '#f4f2e9'], source: 'S12 p.2', sizeNote: '600 mm width is stated; depth and installation height need checking.' },
  { id: 'toilet', kind: 'toilet', box: [0.18, 2.535, 0.635, 0.355, 0.86, '#f7f6ee'], source: 'S12 p.3', sizeNote: 'Documented product: W355 × D635 × H860 mm, seat at 420 mm. Position is scale-derived.' },
  { id: 'laundry', kind: 'laundry', box: [0.18, 3.035, 0.6, 0.832, 2.326, '#f1eee5'], source: 'S04; S12 p.11', sizeNote: '800 mm cabinets + two 16 mm sides, 576 mm upper units at 1750 mm. Depth remains scale-derived; tower itself is a placeholder.' },
];
export const fixtures = fixedItems.map((item) => item.box);

// One layout for the floor plan, styled models and navigation.
export const looseFurniture = furnitureFootprints;
