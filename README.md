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
- Select rooms from the plan or room list.
- Pan, zoom and fit the plan to the screen.
- Toggle illustrative furniture and room labels.
- Export a PNG with an accuracy note.
- Open the official A1 plan on brochure page 25.

Keyboard controls when the plan is focused: arrow keys to pan, +/− to zoom, 0 to fit, Escape to clear selection.

## Accuracy

A1 is listed as 71 m², 3H + KT, on floor 1. It has two bedrooms and a private terrace.

This is a simplified redraw of the published plan, **not a dimensioned drawing**. Geometry, wall thicknesses, openings and furniture are approximate. Room areas are not calculated or claimed. Verify approved dimensions before buying furniture or making changes.

The source PDF and images are linked, not republished. See [research notes](docs/research.md).

## GitHub Pages

Public site: https://sunnybharne.github.io/home-design/

Pushes to `main` run tests, build the app and deploy through `.github/workflows/pages.yml`. The Vite base path is `/home-design/` in production.

## Files

- `src/property.js`: apartment facts and indicative plan geometry.
- `src/main.js`: Three.js floor-plan renderer and controls.
- `src/style.css`: layout and appearance.
- `test/property.test.js`: plan and source checks.
