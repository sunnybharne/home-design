# Home Design · A1

An A1 floor plan and Scandinavian interior study for Helsingin Saarenhelmi, Helsinki. Built with Three.js.

## Run locally

Requires Node.js 22.12+ or a compatible newer release.

```sh
npm install
npm run dev -- --port 5173
```

Open http://127.0.0.1:5173.

```sh
npm test
npm run build
```

## Features

- A1 only: no building or neighbourhood views.
- Walk inside opens a full-screen first-person interior.
- Soft Nordic furniture inspired by IKEA ranges, with Finland shopping links.
- A provisional 100 cm round dining table with two chairs, representing the owner's existing table.
- Extra 40 cm upper cupboards with two sage glass fronts, warm lights and service gaps.
- A sofa closer to the TV, with a modeled 90 cm terrace route and no coffee table.
- Textured wood and linen, rounded furniture, curtains, reflections and contact shadows.
- Saved living, round-table, upper-cupboard, bedroom, studio and YouTube-background views.
- Daylight, evening and recording light moods; a 16:9 composition guide.
- Save a watermarked room view. Smooth rendering mode reduces GPU work.
- Walk through the rooms and terrace; walls, windows and furniture block movement.
- Keyboard, mouse and on-screen movement controls; drag-to-look works without mouse capture.
- Back to plan restores the top-down view.
- Select rooms from the plan or room list.
- Pan, zoom and fit the plan to the screen.
- Toggle illustrative furniture and room labels.
- Export a PNG with a furniture-order warning.
- Review sourced dimensions, selected finishes and open questions in “Dimensions & accuracy”.
- Open the public A1 plan on brochure page 25.

Plan controls: arrow keys to pan, +/− to zoom, 0 to fit, Escape to clear selection.

Walkthrough controls:
- WASD or arrow keys: move.
- Drag the view: look around. Q/E: turn with the keyboard.
- Optional “Use mouse look”: capture the mouse. Escape returns to the plan.
- Phone/tablet: hold the direction buttons while dragging the view to look.
- “Entrance”: reset your position.
- Room view / Light mood: change the composition and lighting.
- Rendering: choose Detail or Smooth. Touch devices start in Smooth mode.

Reduced-motion settings skip the entry animation. Movement stops when the tab loses focus. The Furniture toggle applies to the walkthrough when you enter.

## Accuracy

A1 is listed as 71 m², 3H + KT, on floor 1. It has two bedrooms and a private terrace.

**Not ready for furniture orders.** The 13 supplied documents (96 pages) provide planned cabinet sizes, but no as-built apartment survey. The apartment card says dimensions are indicative and may change.

Geometry is scaled from the supplied 1:100 marketing plan. Fixed units use stated sizes where available; their locations and some dimensions remain scaled. Heights are provisional: 3395 mm main elevation context, 2800 mm hall/wardrobe and 2350 mm bathroom. Selected finishes now follow the apartment card, but screen colours and product shapes remain approximate.

Read the [measurement audit](docs/measurement-audit.md) and complete the blank [site-measurement checklist](docs/site-measurements.csv) before furniture purchases.

## IKEA and visual realism

Read the [Nordic concept](docs/nordic-concept.md). Models and textures are original approximations, not official IKEA assets or photographs. The 40 cm METOD / STENSUND reference size was checked on 7 Sep 2026; other product sizes remain nominal references. The added cupboards are a proposal, not a verified Novart extension. Current stock was not checked.

The studio is a guest-room proposal. Recording views are not calibrated camera, daylight or acoustic simulations. The guest bed is shown closed.

## Owner documents

Originals are organised under the ignored `documents/` folder: apartment, cabinetry, bathroom, electrical and project files. The local index is `documents/README.md`. Extracted text and review images are also private. Do not force-add them to Git or put them in `public/`.

Only curated non-personal facts appear in the app. The production build checks for private files and PDF copies.

## GitHub Pages

Public site: https://sunnybharne.github.io/home-design/

Pushes to `main` run tests, build the app and deploy through `.github/workflows/pages.yml`. The Vite base path is `/home-design/` in production.

## Files

- `src/property.js`: apartment facts and indicative plan geometry.
- `src/main.js`: Three.js floor-plan renderer and controls.
- `src/walkthrough.js`: first-person controls, post-processing, light moods and export.
- `src/interior-scene.js`: architecture, fixed units, reflections and lighting.
- `src/styled-furniture.js`, `src/geometry.js`: original furniture and styling geometry.
- `src/upper-storage.js`: proposed overhead cupboards and display lights.
- `src/materials.js`: original procedural materials.
- `src/furnishing-plan.js`: IKEA references, shared furniture layout and camera views.
- `src/navigation.js`: collision checks.
- `src/interior.js`: shared fixed-unit footprints and provenance.
- `src/specification.js`: source register, stated dimensions, finishes and accuracy limits.
- `src/style.css`: layout and appearance.
- `test/`: source, plan, collision and room-access checks.
