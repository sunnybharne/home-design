import { finishes } from './specification.js';

export const property = {
  name: 'Helsingin Saarenhelmi', address: 'Tihtaalinkatu 5, 00540 Helsinki',
  apartment: 'A1', area: 71, floor: 1, type: '3H + KT',
  website: 'https://helsinginsaarenhelmi.fi/',
  brochure: 'https://helsinginsaarenhelmi.fi/wp-content/uploads/2025/12/Kilo-Invest-Oy-As-Oy-Helsingin-Saarenhelmi-Esite_web_22122025.pdf#page=25',
};

// S01 p.14: native 1:100 PDF, checked against its 10 m scale bar.
// Metres here are DRAWING-SCALE metres, not surveyed finished dimensions.
export const calibration = { source: 'S01 p.14', originPt: [113.497, 250.496], metresPerPoint: 25.4 / 720, roundingMm: 5 };
export function pdfPoint(x, y) {
  return [x, y].map((v, i) => Math.round((v - calibration.originPt[i]) * calibration.metresPerPoint * 200) / 200);
}
export const plan = {
  width: 8.85, height: 13.385, status: 'scale-derived',
  outline: [[0, 0], [8.85, 0], [8.85, 7.485], [6.335, 7.485], [6.335, 10.395], [0, 10.395]],
  terrace: [[6.335, 7.485], [8.85, 7.485], [8.85, 13.385], [6.335, 13.385]],
};

export const rooms = [
  { id: 'living', number: '01', name: 'Living / dining / kitchen', short: 'LIVING / DINING', code: 'OH · RT · KT', label: [5.15, 4.65], color: finishes.floor.color, polygon: [[2.025, 3.25], [8.39, 3.25], [8.39, 7.04], [2.025, 7.04]], description: 'Open kitchen, dining and living area. Selected beige kitchen, white-marble-look laminate and black appliances. Kitchen worktop code: 2722 × 600 mm (S05; S12 p.10). Its placement and the overall room size still need a site check.' },
  { id: 'bedroom-1', number: '02', name: 'Upper bedroom', short: 'UPPER BEDROOM', code: 'MH', label: [5.3, 1.22], color: finishes.floor.color, polygon: [[3.82, 0.46], [8.39, 0.46], [8.39, 3.16], [3.82, 3.16]], description: 'Upper bedroom in the viewer, beside the walk-in wardrobe. Wall and window positions are traced at drawing scale from S01 p.14, not measured in the apartment. “Upper” is a viewer label.' },
  { id: 'bedroom-2', number: '03', name: 'Lower bedroom', short: 'LOWER BEDROOM', code: 'MH', label: [3.92, 8.35], color: finishes.floor.color, polygon: [[2.115, 7.22], [5.89, 7.22], [5.89, 10.215], [2.115, 10.215]], description: 'Bedroom beside the entrance and terrace. The Novart MH1 cabinet group has two 500 mm modules and a 30 mm filler; body 2112 mm plus 166 mm plinth (S07; S12 p.13). Its depth and placement are scale-derived.' },
  { id: 'bathroom', number: '04', name: 'Bathroom', short: 'BATH', code: 'KPH', label: [1.2, 2.6], color: finishes.bath.color, polygon: [[0.18, 0.46], [1.925, 0.46], [1.925, 3.875], [0.18, 3.875]], description: 'Selected beige tiles, 600 mm Svedbergs basin/mirror cabinets, black shower fittings and alder ceiling (S12 pp.2–3). KPH01 marks 2350 mm as an indicative ceiling height. Plumbing positions are not editable furniture suggestions.' },
  { id: 'wardrobe', number: '05', name: 'Walk-in wardrobe', short: 'WARDROBE', code: 'VH', label: [2.87, 1.7], color: finishes.floor.color, polygon: [[2.025, 0.46], [3.725, 0.46], [3.725, 3.16], [2.025, 3.16]], description: 'The Novart VH1 drawing states a 2700 × 1700 mm enclosure and 2800 mm height (S08; S12 p.15). This also cross-checks the scaled plan. These are planned dimensions; the specification still calls the shelving image indicative.' },
  { id: 'entry', number: '06', name: 'Entrance / hallway', short: 'ENTRY', code: 'ET', label: [1.27, 8.7], color: finishes.floor.color, polygon: [[0.18, 3.97], [2.025, 3.97], [2.025, 10.215], [0.18, 10.215]], description: 'Mirrored Inaria cabinets: A is 1200 × 700 × 2500 mm; B is 1040 × 700 × 2500 mm (W × D × H, S02/S03). The cabinet sizes are documented, but clear aisle width and installation positions are not site-verified.' },
  { id: 'terrace', number: '07', name: 'Private terrace', short: 'TERRACE', code: 'as.terassi', label: [7.48, 11.1], color: finishes.terrace.color, polygon: [[6.335, 7.485], [8.715, 7.485], [8.715, 13.185], [6.335, 13.185]], description: 'Anthracite terrace mat is selected (S12 p.3). Glass, edges and access are scale-derived; the documents do not establish an as-built terrace size. Verify the threshold and level change before planning furniture delivery.' },
];

// Simplified wall runs from S01 p.14 vector linework, rounded to 5 mm.
// This rounding is a modeling choice, NOT a statement of accuracy.
export const walls = [
  [0, 0, 8.85, 0.46],
  [0, 0.46, 0.18, 8.615], [0, 10.095, 0.18, 0.3],
  [0, 10.215, 6.335, 0.18],
  [8.39, 0.46, 0.46, 0.425], [8.39, 2.7, 0.46, 1.035], [8.39, 6.6, 0.46, 0.885],
  [5.89, 7.22, 0.445, 0.6], [5.89, 9.485, 0.445, 0.73],
  [1.925, 0.46, 0.1, 3.51], [0.18, 1.355, 0.33, 0.95],
  [0.18, 3.875, 0.775, 0.095], [1.875, 3.875, 0.15, 0.095],
  [3.725, 0.46, 0.095, 1.075], [3.725, 2.355, 0.095, 0.805],
  [2.025, 3.16, 2.215, 0.09], [5.16, 3.16, 3.23, 0.09],
  [2.025, 7.04, 4.525, 0.18], [8.165, 7.04, 0.225, 0.18],
  [2.025, 7.22, 0.09, 1.935], [2.025, 10.055, 0.09, 0.16],
  [0.18, 7.04, 0.72, 0.18],
  [6.195, 10.395, 0.14, 2.99], [6.335, 13.185, 2.515, 0.2],
];
export const windows = [
  { x1: 8.62, y1: 0.885, x2: 8.62, y2: 2.7 },
  { x1: 8.62, y1: 3.735, x2: 8.62, y2: 6.6 },
  { x1: 6.11, y1: 7.82, x2: 6.11, y2: 9.485 },
];
export const doors = [
  { x: 0.09, y: 9.075, radius: 1.02, closed: Math.PI / 2, open: Math.PI },
  { x: 1.875, y: 3.92, radius: 0.92, closed: Math.PI, open: Math.PI / 2 },
  { x: 3.77, y: 1.535, radius: 0.82, closed: Math.PI / 2, open: 0 },
  { x: 4.24, y: 3.205, radius: 0.92, closed: 0, open: -Math.PI / 2 },
  { x: 2.07, y: 10.055, radius: 0.9, closed: -Math.PI / 2, open: 0 },
  { x: 6.55, y: 7.13, radius: 0.955, closed: 0, open: Math.PI / 2 },
];
export const terraceOpening = { x: 6.55, z: 7.13, width: 1.615 };
export const terraceGlass = { x: 8.715, z: 7.485, depth: 5.7 };
