// Curated facts only. Private PDFs, contacts, order IDs and prices stay local.
export const audit = {
  documents: 13,
  pages: 96,
  furnitureOrderReady: false,
  areaStatus: 'Published apartment area, not a measured room-area sum',
  geometryStatus: 'Scale-derived from S01 p.14; simplified, not as-built',
  warning: 'Do not order fitted furniture from this model. Confirm finished dimensions on site.',
};

export const sources = [
  ['S01', 'Marketing drawings', '2025-09-25', '54 pages; A01 on p.14 at 1:100. Not a dimensioned survey.'],
  ['S02', 'Inaria entrance cabinet A', '2025-09-24', '3 pages. Frame dimensions and mirror doors.'],
  ['S03', 'Inaria entrance cabinet B', '2025-09-24', '3 pages. Frame dimensions and mirror doors.'],
  ['S04', 'Novart laundry cabinet drawing', '2025-09-08', '1 page. Cabinet and enclosing wall dimensions must be distinguished.'],
  ['S05', 'Novart kitchen drawing', '2025-09-08', '1 page. Module widths and worktop code; finishes superseded by S12.'],
  ['S06', 'Bathroom KPH01 plan and elevations', '2025-09-10', '1 wide sheet. For sales; fixture shapes and ceiling height are indicative.'],
  ['S07', 'Novart bedroom cabinet drawing', '2025-09-08', '1 page. Two 500 mm cabinets and a 30 mm filler.'],
  ['S08', 'Novart walk-in wardrobe drawing', '2025-09-08', '1 page. Dimensioned enclosure; shelving image remains indicative in S12.'],
  ['S09', 'Confirmed material selections', '2026-05-05', '5 pages. Matches the apartment card, not a measurement survey.'],
  ['S10', 'Electrical symbol legend', '2025-09-05', '1 page. Generic point heights, unless otherwise marked.'],
  ['S11', 'Alteration instructions', '2025-12-04', '9 pages. Design changes go through Fira; water/drain positions cannot be changed under these instructions.'],
  ['S12', 'Apartment card, version 2, with attachments', '2026-05-05', '15 pages. Latest supplied finish selections. Page 3 says plan dimensions are indicative and may change.'],
  ['S13', 'A01 electrical-point plan', '2025-09-05', '1 page; repeated in S12 p.14. Valid ONLY for electrical points, not architectural dimensions.'],
];

export const documentedDimensions = [
  { id: 'entry-a', name: 'Entrance cabinet A frame', value: '1200 × 700 × 2500 mm (W × D × H)', source: 'S02 pp.1–2; S12 pp.4–5', status: 'Documented design size', mm: { width: 1200, depth: 700, height: 2500 } },
  { id: 'entry-b', name: 'Entrance cabinet B frame', value: '1040 × 700 × 2500 mm (W × D × H)', source: 'S03 pp.1–2; S12 pp.7–8', status: 'Documented design size', mm: { width: 1040, depth: 700, height: 2500 } },
  { id: 'wardrobe', name: 'Wardrobe enclosure', value: '2700 × 1700 mm; elevation height 2800 mm', source: 'S08 p.1; S12 p.15', status: 'Documented design size', mm: { longSide: 2700, shortSide: 1700, height: 2800 } },
  { id: 'worktop', name: 'Kitchen worktop code', value: 'ITK2722×600 → 2722 × 600 mm', source: 'S05 p.1; S12 p.10', status: 'Documented design size', mm: { width: 2722, depth: 600 } },
  { id: 'bedroom-cabinet', name: 'Bedroom cabinet group', value: '500 + 500 mm, plus 30 mm filler; 2112 mm body + 166 mm plinth', source: 'S07 p.1; S12 p.13', status: 'Documented design size; depth not stated', mm: { width: 1000, filler: 30, bodyHeight: 2112, plinthHeight: 166 } },
  { id: 'laundry', name: 'Laundry upper cabinets', value: '800 mm total width; 576 mm high; underside at 1750 mm', source: 'S04 p.1; S12 p.11', status: 'Documented design size; depth not stated', mm: { width: 800, height: 576, underside: 1750, sidePanel: 16 } },
  { id: 'vanity', name: 'Bathroom basin and mirror cabinets', value: '600 mm nominal width each', source: 'S12 p.2; S09 p.4', status: 'Selected product width', mm: { width: 600 } },
  { id: 'toilet', name: 'IDO Glow 60 toilet', value: '355 × 635 × 860 mm (W × D × H); seat 420 mm without lid', source: 'S12 p.3; S09 p.4', status: 'Selected product dimensions', mm: { width: 355, depth: 635, height: 860, seatHeight: 420 } },
  { id: 'skirting', name: 'White-lacquer skirting', value: '12 × 42 mm', source: 'S12 p.1; S09 p.1', status: 'Selected product dimensions', mm: { depth: 12, height: 42 } },
];

export const ceiling = {
  main: 3.395, // Wall/elevation context in both Novart kitchen and bedroom sheets, NOT a surveyed clear height.
  entry: 2.8, // Electrical background only; needs architectural confirmation.
  wardrobe: 2.8, // Dimensioned in S08, also marked in electrical background.
  bathroom: 2.35, // S06 explicitly calls its ceiling level indicative.
  status: 'Provisional: 3395 mm elevation context, 2800 mm hall/wardrobe, 2350 mm bathroom. Confirm on site.',
};

export const finishes = {
  wall: { name: 'NCS S 0500-N painter’s white', color: '#f2f1ed', source: 'S12 p.1' },
  floor: { name: 'Shade Oak Cotton White TreS, 3-strip', color: '#e4dfd1', source: 'S12 p.1' },
  kitchen: { name: 'Novart Ajaton Beige', color: '#d7cebc', source: 'S12 pp.1,10' },
  worktop: { name: 'Usvainen Marmori laminate', color: '#e2dfd5', source: 'S12 pp.1,10' },
  backsplash: { name: 'Lacobel Pearl White', color: '#eeeee3', source: 'S12 pp.1,10' },
  bath: { name: 'Pukkila Europe Beige; walls 300 × 600 mm, floor 100 × 100 mm', color: '#c6bba8', source: 'S12 p.2' },
  bathCeiling: { name: 'Alder STS 15 × 90 mm', color: '#bd9773', source: 'S12 p.3' },
  terrace: { name: 'Anthracite terrace mat', color: '#626660', source: 'S12 p.3' },
};

export const confirmationNeeded = [
  'Finished wall-to-wall lengths, diagonals, wall thicknesses and service-box projections.',
  'Main clear ceiling height: 3395 mm appears in cabinet elevation backgrounds, not a surveyed room section.',
  'Extent and clear heights of the hall, wardrobe and bathroom lowered ceilings.',
  'Door frame sizes, clear openings, swings, thresholds and furniture delivery route.',
  'Window/reveal positions and sill heights: marketing notes show 700 mm; the electrical background also shows 725 mm.',
  'Final kitchen run, filler/scribe panels, appliance ventilation and manufacturer installation clearances.',
  'Exact cabinet positions/depths where only a scaled plan is available, plus sockets, pipes and skirting.',
  'Final terrace size and level/threshold details; no verified terrace area is supplied.',
];
