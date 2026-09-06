# Home Design · A1

An interactive top-down floor plan for apartment A1 at Helsingin Saarenhelmi, Helsinki. Built with Three.js.

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
- Play opens a full-screen first-person walkthrough with an entry animation.
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
- “Return to entrance”: reset your position.

Reduced-motion settings skip the entry animation. Movement stops when the tab loses focus. The Furniture toggle applies to the walkthrough when you enter.

## Accuracy

A1 is listed as 71 m², 3H + KT, on floor 1. It has two bedrooms and a private terrace.

**Not ready for furniture orders.** The 13 supplied documents (96 pages) provide planned cabinet sizes, but no as-built apartment survey. The apartment card says dimensions are indicative and may change.

Geometry is scaled from the supplied 1:100 marketing plan. Fixed units use stated sizes where available; their locations and some dimensions remain scaled. Heights are provisional: 3395 mm main elevation context, 2800 mm hall/wardrobe and 2350 mm bathroom. Selected finishes now follow the apartment card, but screen colours and product shapes remain approximate.

Read the [measurement audit](docs/measurement-audit.md) and complete the blank [site-measurement checklist](docs/site-measurements.csv) before furniture purchases.

## Owner documents

Originals are organised under the ignored `documents/` folder: apartment, cabinetry, bathroom, electrical and project files. The local index is `documents/README.md`. Extracted text and review images are also private. Do not force-add them to Git or put them in `public/`.

Only curated non-personal facts appear in the app. The production build checks for private files and PDF copies.

## GitHub Pages

Public site: https://sunnybharne.github.io/home-design/

Pushes to `main` run tests, build the app and deploy through `.github/workflows/pages.yml`. The Vite base path is `/home-design/` in production.

## Files

- `src/property.js`: apartment facts and indicative plan geometry.
- `src/main.js`: Three.js floor-plan renderer and controls.
- `src/walkthrough.js`: first-person scene, animation and controls.
- `src/navigation.js`: collision checks.
- `src/interior.js`: shared fixed-unit footprints and provenance.
- `src/specification.js`: source register, stated dimensions, finishes and accuracy limits.
- `src/style.css`: layout and appearance.
- `test/`: source, plan, collision and room-access checks.
