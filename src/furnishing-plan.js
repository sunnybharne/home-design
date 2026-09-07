// Original model geometry inspired by IKEA ranges; no IKEA mesh or image copies.
// Nominal reference sizes are not a live catalogue/stock check or a fit guarantee.
import { upperStorageConcept } from './specification.js';
const ikea = (query) => `https://www.ikea.com/fi/fi/search/?q=${encodeURIComponent(query)}`;
export const shopping = [
  { id: 'kivik', name: 'KIVIK', type: '3-seat sofa', finish: 'Light beige fabric', size: [2.28, .95, .83], room: 'Living', url: ikea('KIVIK 3 istuttava sohva beige'), note: 'Low arms, generous cushions. Confirm the current cover and exact version.' },
  { id: 'besta', name: 'BESTÅ', type: 'TV bench frame', finish: 'Oak effect / pale fronts', size: [1.80, .40, .38], room: 'Living', url: ikea('BESTÅ TV taso 180 40 38'), note: 'Frame size only. Fronts, legs and fittings change the final envelope.' },
  { id: 'upper-glass', name: 'METOD / STENSUND', type: 'Glass wall cabinet reference · two shown', finish: 'Light-green glass fronts / warm display lighting', size: [.40, upperStorageConcept.depth, upperStorageConcept.height], room: 'Kitchen', url: upperStorageConcept.url, linkLabel: 'View the IKEA cabinet reference ↗', note: '40 × 40 cm cabinet, item 394.864.11; dimensions checked 7 Sep 2026. For occasional-use dishes. Beige outer panels and lighting are styling suggestions. Rail and handles are separate; wall fixing and Novart compatibility need confirmation.' },
  { id: 'upper-solid', name: 'Beige upper cupboards', type: 'Custom storage concept', finish: 'Beige fronts to coordinate with the kitchen', size: [.40, upperStorageConcept.depth, upperStorageConcept.height], room: 'Kitchen', note: 'Three proposed 40 cm door bays, beside the two glass cabinets. Mounting height and colour match are not verified. No added cupboards over the fridge or extractor; keep their service routes clear.' },
  { id: 'lisabo-chair', name: 'LISABO', type: 'Desk chair', finish: 'Ash', size: [.44, .51, .80], room: 'Studio', url: ikea('LISABO tuoli saarni'), note: 'One desk chair. Allow pull-out space; try the chair before long editing sessions.' },
  { id: 'malm', name: 'MALM', type: 'Bed frame · 160 × 200 mattress', finish: 'White-stained oak look', size: [1.76, 2.09, 1.00], room: 'Upper bedroom', url: ikea('MALM sängynrunko 160 200 valkotammiviilu'), note: 'Overall frame reference, not mattress size. Bedding is original styling.' },
  { id: 'hemnes', name: 'HEMNES', type: 'Daybed · closed', finish: 'White', size: [2.09, .89, .83], room: 'Studio / guest room', url: ikea('HEMNES vuodesohva valkoinen 80 200'), note: 'Closed footprint only. Opening the guest bed needs a new clearance check.' },
  { id: 'desk', name: 'LAGKAPTEN / ALEX', type: 'Desk combination', finish: 'White / pale oak look', size: [1.40, .60, .73], room: 'Studio / guest room', url: ikea('LAGKAPTEN ALEX 140 60'), note: 'A compact filming/work desk. Confirm the available top and drawer combination.' },
  { id: 'billy', name: 'BILLY', type: 'Bookcase', finish: 'Oak effect', size: [.80, .28, 2.02], room: 'Studio / guest room', url: ikea('BILLY tammikuvio 80 28 202'), note: 'Books, ceramics and warm light make a calm filming background. Wall anchoring required.' },
  { id: 'stoense', name: 'STOENSE', type: 'Low-pile rug', finish: 'Off-white', size: [1.70, 2.40, .018], room: 'Living', url: ikea('STOENSE 170 240 luonnonvalkoinen'), note: 'Softens the room visually and may reduce some reflections; not soundproofing.' },
  { id: 'gladom', name: 'GLADOM', type: 'Tray table / bedside table', finish: 'Off-white powder-coated steel', size: [.45, .45, .53], room: 'Upper bedroom', url: ikea('GLADOM tarjotinpöytä 45 53'), note: 'Two lightweight bedside tables. Confirm the available colour.' },
  { id: 'regolit', name: 'REGOLIT', type: 'Paper pendant shade', finish: 'White rice paper', size: null, room: 'Living and bedroom', url: ikea('REGOLIT 45'), note: '45 cm shade reference. Choose a compatible cord set; hanging heights are styling estimates.' },
  { id: 'dytaag', name: 'DYTÅG', type: 'Curtains', finish: 'White linen', size: null, room: 'Window walls', url: ikea('DYTÅG verhot valkoinen'), note: 'Model pleats and hanging height are estimates. Measure the drop and track before buying.' },
];
export const concept = {
  name: 'Soft Nordic · a home, and a place to create',
  stock: 'Live stock and prices not checked. Confirm the exact variant and availability at IKEA Vantaa or Espoo.',
  dimensions: 'The 40 cm METOD / STENSUND cabinet dimensions were checked on 7 Sep 2026. Other IKEA sizes are nominal references, not verified against current product pages. Furniture placement and the upper-cupboard layout are proposals. Models are original approximations, not official IKEA 3D assets.',
  palette: ['#d8d0c1', '#bd9c74', '#f3f0e8', upperStorageConcept.glassColor, '#343b34'],
};

// Coordinates: centre X/Z and rotation about Y. Local furniture front is +Z.
// Rotations are right angles so collision envelopes remain simple and testable.
export const furnishingLayout = [
  { id: 'main-bed', product: 'malm', kind: 'bed', x: 6.81, z: 1.605, rotation: 0 },
  { id: 'sofa', product: 'kivik', kind: 'sofa', x: 6.68, z: 5.065, rotation: Math.PI },
  { id: 'tv', product: 'besta', kind: 'console', x: 6.45, z: 3.49, rotation: 0 },
  { id: 'guest-bed', product: 'hemnes', kind: 'daybed', x: 4.61, z: 9.72, rotation: Math.PI },
  { id: 'studio-desk', product: 'desk', kind: 'desk', x: 4.15, z: 7.60, rotation: 0 },
  { id: 'studio-chair', product: 'lisabo-chair', kind: 'chair', x: 4.15, z: 8.23, rotation: Math.PI },
  { id: 'backdrop', product: 'billy', kind: 'bookcase', x: 2.80, z: 10.065, rotation: Math.PI },
  ...[5.62, 8.0].map((x, i) => ({ id: `bedside-${i}`, product: 'gladom', kind: 'side', x, z: .95, rotation: 0 })),
];
export function productFor(item) { return shopping.find((p) => p.id === item.product); }
export function furnitureBox(item) {
  const [w, d, h] = productFor(item).size;
  const quarterTurn = Math.abs(Math.sin(item.rotation)) > .5;
  const width = quarterTurn ? d : w, depth = quarterTurn ? w : d;
  return [item.x - width / 2, item.z - depth / 2, width, depth, h, '#d8d0c1'];
}
const rugSize = shopping.find(p => p.id === 'stoense').size;
export const stylingRug = { x: 6.68, z: 4.54, width: rugSize[1], depth: rugSize[0], height: rugSize[2] };
export const furnitureFootprints = furnishingLayout.map(furnitureBox);

export function recordingRect(width, height) {
  const w = Math.min(width * .86, height * .68 * 16 / 9), h = w * 9 / 16;
  return { x: (width-w)/2, y: (height-h)/2, width: w, height: h };
}
export const cameraViews = {
  entrance: { name: 'Entrance', x: 1.27, z: 9.55, eye: 1.62, target: [1.27, 1.62, 5], fov: 55 },
  living: { name: 'Living room', x: 3.85, z: 4.05, eye: 1.60, target: [6.65, 1.0, 5.0], fov: 55 },
  upper: { name: 'Upper kitchen cupboards', x: 4.65, z: 3.85, eye: 1.65, target: [3.60, 1.95, 6.92], fov: 58 },
  bedroom: { name: 'Bedroom', x: 4.72, z: 2.69, eye: 1.60, target: [6.9, .8, 1.35], fov: 55 },
  studio: { name: 'Studio / guest room', x: 2.98, z: 8.71, eye: 1.60, target: [4.5, 1.0, 8.7], fov: 58 },
  video: { name: 'YouTube background', x: 3.85, z: 8.65, eye: 1.35, target: [3.8, 1.30, 10.15], fov: 48, filming: true },
};
