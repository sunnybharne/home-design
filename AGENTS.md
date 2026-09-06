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
- Run tests and build before deploying to GitHub Pages.
