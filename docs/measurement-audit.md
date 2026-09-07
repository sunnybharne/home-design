# A1 measurement audit

## Verdict

**Not ready for furniture ordering or fabrication.**

The model now uses drawing-scale geometry and stated cabinet sizes. It is not a measured, as-built replica. No whole-apartment dimensioned survey was supplied. Do not infer installation tolerances from the number of decimal places in the code.

## Documents reviewed

13 PDFs, 96 pages. Originals were moved into the ignored `documents/` folder and checked with SHA-256 before and after moving. The local index is `documents/README.md`.

All extracted text was reviewed, including repeated lines consolidated with page references. All pages were visually screened in contact sheets; A1, cabinet and electrical sheets were inspected at larger size. The four image-only cabinet sheets were read visually, not treated as empty documents.

| Source | Contents | Pages | Use |
|---|---|---:|---|
| S01 | Marketing drawings, 25 Sep 2025 | 54 | A01 p.14, scale 1:100; other apartments are not A1 evidence |
| S02 | Inaria entrance A | 3 | Frame dimensions |
| S03 | Inaria entrance B | 3 | Frame dimensions |
| S04 | Novart laundry cabinets | 1 | Upper cabinet dimensions; not a bathroom survey |
| S05 | Novart kitchen | 1 | Modules/worktop; original finish codes superseded by S12 |
| S06 | KPH01 plan and elevations | 1 | Sales sheet; shapes and ceiling explicitly indicative |
| S07 | Novart bedroom cabinets | 1 | 500 + 500 mm modules, filler and body/plinth heights |
| S08 | Novart walk-in wardrobe | 1 | 2700 × 1700 mm enclosure and 2800 mm elevation height |
| S09 | Confirmed selections export | 5 | Confirms the S12 finish selections |
| S10 | Electrical legend | 1 | Generic point heights, unless marked otherwise |
| S11 | Change instructions, 4 Dec 2025 | 9 | Process and restrictions, not dimensional authority |
| S12 | Apartment card v2 with attachments, 5 May 2026 | 15 | Latest supplied selections; repeats most technical sheets |
| S13 | A01 electrical-point drawing | 1 | Electrical points only; also in S12 p.14 |

PDF names, personal contacts, prices and portal identifiers are kept out of public files. Standalone sheets and packet copies are retained locally, even where they repeat information.

## Important source limits

- **S12 p.3:** “Huoneiston suunnitelmien mitat ovat suuntaa antavia ja voivat muuttua rakennusteknisistä syistä.” Translation: apartment-plan dimensions are indicative and may change for construction reasons.
- **S13 / S12 p.14:** “VOIMASSA VAIN SÄHKÖPISTEIDEN OSALTA.” Valid only for electrical points. Its architectural background is not an authority for room dimensions.
- **S06 / S12 p.12:** for sales; fixture objects do not represent the real products. Ceiling level and accessory positions are indicative.
- **S08 / S12 p.2:** the wardrobe drawing contains stated enclosure dimensions, but the selected shelving image is still described as indicative.
- **S11 pp.5–8:** design changes are coordinated by Fira. Its instructions disallow changes to water/drain positions and installation of bathtubs. This app does not approve alterations.

## Applied corrections

### Drawing-scale geometry

The old plan was a visual sketch from a brochure rendering. The current plan uses the native S01 p.14 vector coordinates:

- PDF scale: 1:100.
- Conversion: `1 point × 25.4 / 720` drawing-scale metres.
- Origin: `(113.497, 250.496)` PDF points.
- The 10 m scale bar is about 283.465 points long.
- Simplified coordinates are rounded to 5 mm. **That is rounding, not ±5 mm accuracy.**
- The wardrobe interior cross-checks against the separately stated 1700 × 2700 mm dimensions.

Examples of changes, relative to the viewer origin:

| Feature | Old sketch | Updated drawing-scale model |
|---|---|---|
| Wardrobe internal width | 1830 mm | 1700 mm; also stated in S08 |
| Upper bedroom window, along wall | 1320–3150 mm | 885–2700 mm |
| Lower bedroom window, along wall | 7850–9330 mm | 7820–9485 mm |
| Terrace outer end | 13500 mm | 13385 mm |
| Bathroom service-box projection | Missing | Added from plan linework |

These are not certified finished dimensions. The model does not reproduce every wall layer, reveal, frame, ceiling step or threshold. The apartment-area value remains the published 71 m²; geometry is not stretched to force a matching area.

### Cabinet and product sizes

| Item | Stated design dimensions | Model treatment |
|---|---|---|
| Entrance cabinet A | W1200 × D700 × H2500 mm | Corrected frame; position remains scaled |
| Entrance cabinet B | W1040 × D700 × H2500 mm | Corrected frame; position remains scaled |
| Worktop | Code ITK2722×600 | 2722 × 600 mm footprint; installation height remains estimated |
| Bedroom group | 500 + 500 mm, 30 mm filler; body 2112 + plinth 166 mm | 1030 mm run, 2278 mm overall height; depth remains scaled |
| Laundry upper cabinets | 800 mm width, 576 mm height; underside 1750 mm; 16 mm side panels | Upper units and tower enclosure, not a solid full-height cabinet |
| Basin and mirror cabinets | 600 mm nominal width | Corrected; depths/heights need product/installation confirmation |
| IDO Glow 60 | W355 × D635 × H860 mm, seat 420 mm without lid | Corrected envelope; simplified shape |
| Skirting | 12 × 42 mm | Replaces the old oversized visual skirting |

Fixed-unit footprints now come from one data file shared by the plan, walkthrough and navigation. A stated width does not confirm the cabinet's position, depth, installation gap or clearance to a wall.

The total kitchen run is **not certified**: modules, appliance openings and filler/panel notes are not interchangeable with the worktop code. The renderer uses an interpreted housing. Confirm the final supplier installation drawing and appliance ventilation requirements.

The fridge grille shown in S05 / S12 p.10 is now represented, with an illustrative location and size. The extra upper cupboards are proposal P01, separate from the supplied design. Gaps above the fridge and extractor are reserved provisionally; the drawings do not verify these service clearances or the extractor duct route. See the [upper storage concept](nordic-concept.md#upper-storage).

### Ceiling and window conflicts

The old walkthrough used 2700 mm everywhere. The reviewed drawings contain different values:

- 3395 mm is printed on the enclosing elevation in both the kitchen and bedroom cabinet sheets. The model uses it as **provisional main-wall context**, not a verified finished clear ceiling height.
- 2800 mm is stated on the wardrobe sheet. The electrical background also marks 2800 mm over the hall/wardrobe, but its scope is electrical only.
- 2350 mm is shown for the bathroom and explicitly called indicative on KPH01.
- Marketing A1 window notes show 700 mm sills. The electrical background also marks 725 mm at some windows. The model retains 700 mm provisionally; this conflict is not silently resolved.
- Door-head/window-head heights, frame clearances and threshold levels still need architectural and site confirmation. The walkthrough keeps the terrace floor level for navigation; it is not a validated level-change model.

### Selected finishes

The app now reflects S12 rather than the old invented finish palette:

- Cotton White 3-strip oak, NCS S 0500-N walls, white-lacquer skirting.
- Ajaton Beige kitchen, Usvainen Marmori laminate, Pearl White glass backsplash.
- Integrated fridge/freezer and dishwasher; black hob, oven, microwave, sink and kitchen tap.
- Mirrored entrance cabinet fronts.
- Beige bathroom tiles, white basin/mirror units, black shower fittings and alder ceiling.
- Anthracite terrace mat.

Colour matching, reflections, grain and product shapes remain illustrative. Loose furniture now follows a proposed [Nordic / IKEA concept](nordic-concept.md), not an owner-approved furnishing package. Its catalogue references are separate from this document audit. Some small hardware, exact shower-screen geometry and appliance details are not modeled.

## Needed before furniture orders

Use `docs/site-measurements.csv` as a blank checklist. Have the installer or surveyor verify:

1. Finished wall-to-wall lengths at several heights, diagonals and squareness.
2. Clear heights and all lowered-ceiling boundaries.
3. Wall projections, skirting, services, sockets and access panels.
4. Clear door/window openings, frames, swings, reveals and sill heights.
5. Kitchen fillers, appliance clearances, plumbing and worktop dimensions.
6. Delivery route, lifts, stairs, door openings and terrace threshold.

Record the date, tool, uncertainty, reference surfaces and drawing revision. Leave unmeasured values blank. A nominal cabinet size is not a substitute for an on-site measurement.
