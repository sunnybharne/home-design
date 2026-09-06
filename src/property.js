export const property = {
  name: 'Helsingin Saarenhelmi',
  address: 'Tihtaalinkatu 5, 00540 Helsinki',
  apartment: 'A1',
  area: 71,
  floor: 1,
  type: '3H + KT',
  website: 'https://helsinginsaarenhelmi.fi/',
  brochure: 'https://helsinginsaarenhelmi.fi/wp-content/uploads/2025/12/Kilo-Invest-Oy-As-Oy-Helsingin-Saarenhelmi-Esite_web_22122025.pdf#page=25',
};

// Manually interpreted from brochure p.25. These local drawing units are
// approximate, not surveyed metres. Do not infer room areas from this model.
export const plan = {
  width: 8.85,
  height: 13.5,
  outline: [[0, 0], [8.85, 0], [8.85, 7.49], [6.3, 7.49], [6.3, 10.43], [0, 10.43]],
  terrace: [[6.3, 7.49], [8.85, 7.49], [8.85, 13.5], [6.3, 13.5]],
};

export const rooms = [
  { id: 'living', number: '01', name: 'Living / dining / kitchen', short: 'LIVING / DINING', code: 'OH · RT · KT', label: [5.15, 4.65], color: '#ece6d9', polygon: [[1.88, 3.26], [8.46, 3.26], [8.46, 7.05], [2.02, 7.05], [2.02, 3.98], [1.88, 3.98]], description: 'One open space for cooking, dining and relaxing. Kitchen cabinets run along the lower wall; the living area opens to the terrace.' },
  { id: 'bedroom-1', number: '02', name: 'Bedroom 1', short: 'BEDROOM 1', code: 'MH', label: [5.3, 1.22], color: '#e9e7da', polygon: [[3.83, 0.46], [8.46, 0.46], [8.46, 3.17], [3.83, 3.17]], description: 'The upper bedroom in the published plan, with a window on the right and access to the walk-in wardrobe. “Bedroom 1” is our label, not an official room number.' },
  { id: 'bedroom-2', number: '03', name: 'Bedroom 2', short: 'BEDROOM 2', code: 'MH', label: [3.92, 8.35], color: '#e9e7da', polygon: [[2.14, 7.25], [5.89, 7.25], [5.89, 10.15], [2.14, 10.15]], description: 'The lower bedroom, entered from the hallway. Its window faces the private terrace. “Bedroom 2” is our label, not an official room number.' },
  { id: 'bathroom', number: '04', name: 'Bathroom', short: 'BATH', code: 'KPH', label: [1.04, 2.62], color: '#dde4dc', polygon: [[0.19, 0.46], [1.78, 0.46], [1.78, 3.85], [0.19, 3.85]], description: 'Bathroom with shower, toilet and basin. The published plan also marks a washing-machine / dryer provision.' },
  { id: 'wardrobe', number: '05', name: 'Walk-in wardrobe', short: 'WARDROBE', code: 'VH', label: [2.82, 1.7], color: '#e4e1d5', polygon: [[1.9, 0.46], [3.73, 0.46], [3.73, 3.17], [1.9, 3.17]], description: 'A separate wardrobe beside the upper bedroom. Storage modules are indicative in this drawing.' },
  { id: 'entry', number: '06', name: 'Entrance / hallway', short: 'ENTRY', code: 'ET', label: [1.0, 8.48], color: '#eee9de', polygon: [[0.19, 3.98], [2.02, 3.98], [2.02, 10.15], [0.19, 10.15]], description: 'The apartment entrance is on the lower-left edge. The hall connects the bathroom, lower bedroom and open living area.' },
  { id: 'terrace', number: '07', name: 'Private terrace', short: 'TERRACE', code: 'as.terassi', label: [7.48, 11.1], color: '#ddd8c9', polygon: [[6.35, 7.49], [8.68, 7.49], [8.68, 13.25], [6.35, 13.25]], description: 'The terrace extends down the right side of the apartment and is accessed from the living area. Openable terrace glazing is marked in the published plan. No terrace area is claimed here.' },
];

// x, y, width, height; openings are gaps between wall segments.
export const walls = [
  [0, 0, 8.85, 0.46],
  [0, 0.46, 0.19, 8.62], [0, 10.02, 0.19, 0.41],
  [0, 10.15, 6.3, 0.28],
  [8.46, 0.46, 0.39, 0.86], [8.46, 3.15, 0.39, 0.59], [8.46, 6.63, 0.39, 0.86],
  [5.89, 7.25, 0.41, 0.6], [5.89, 9.33, 0.41, 0.82],
  [1.78, 0.46, 0.12, 3.52],
  [0.19, 3.85, 0.6, 0.13], [1.69, 3.85, 0.21, 0.13],
  [3.73, 0.46, 0.1, 1.12], [3.73, 2.32, 0.1, 0.85],
  [1.9, 3.17, 2.37, 0.09], [5.12, 3.17, 3.34, 0.09],
  [2.02, 7.05, 4.59, 0.2], [8.17, 7.05, 0.29, 0.2],
  [2.02, 7.25, 0.12, 1.94], [2.02, 10.01, 0.12, 0.14],
  [0.19, 7.05, 0.67, 0.16],
  [6.16, 10.43, 0.14, 3.07], [6.3, 13.25, 2.55, 0.25],
];

export const windows = [
  { x1: 8.65, y1: 1.32, x2: 8.65, y2: 3.15 },
  { x1: 8.65, y1: 3.74, x2: 8.65, y2: 6.63 },
  { x1: 6.08, y1: 7.85, x2: 6.08, y2: 9.33 },
];

// Door leaf angle and swing in plan coordinates (Y down).
export const doors = [
  { x: 0.09, y: 9.08, radius: 0.94, closed: Math.PI / 2, open: Math.PI },
  { x: 1.69, y: 3.91, radius: 0.9, closed: Math.PI, open: Math.PI / 2 },
  { x: 3.78, y: 1.58, radius: 0.74, closed: Math.PI / 2, open: 0 },
  { x: 4.27, y: 3.22, radius: 0.85, closed: 0, open: -Math.PI / 2 },
  { x: 2.08, y: 10.01, radius: 0.82, closed: -Math.PI / 2, open: 0 },
  { x: 6.61, y: 7.14, radius: 0.95, closed: 0, open: Math.PI / 2 },
];
