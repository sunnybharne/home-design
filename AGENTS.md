# Project Instructions

- This repository is for visualizing the home and related elements.
- The current app is a Three.js floor plan and first-person walkthrough of apartment A1 at Helsingin Saarenhelmi.
- Keep the view focused on A1, not the whole building or neighbourhood.
- Read `docs/measurement-audit.md` before geometry changes. The model is not ready for furniture orders.
- Distinguish stated design dimensions, scale-derived geometry and site-measured values. Never call planned sizes as-built.
- Source IDs and sizes live in `src/specification.js`; share fixed-unit footprints through `src/interior.js`.
- Keep the public brochure link on page 25; do not confuse it with S01 page 14.
- Keep the owner's `documents/` folder private and ignored. Never publish its PDFs, previews, contacts, prices or portal links.
- Do not republish third-party images or PDFs without permission.
- Interior style: Scandinavian / IKEA display-room feel, with a guest-room YouTube setup. Read `docs/nordic-concept.md`.
- Prefer detailed geometry, neutral materials and soft lighting over flat coloured blocks. Do not call the render a photograph.
- Keep furniture and camera placement in `src/furnishing-plan.js`. Check collisions and open/pull-out clearances separately.
- Do not claim IKEA stock, current variants or dimensions are verified without checking their live source.
- Run tests and build before deploying to GitHub Pages.
