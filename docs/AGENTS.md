# Agent Instructions

This repository is a static benchmark harness. When adding a new model implementation:

## Checklist
- Add **only** a new folder at `public/projects/<projectId>/<yourModelId>/`.
- Place a self-contained `index.html` inside that folder (you may add optional `style.css`, `app.js`, or other assets in the same folder).
- Update `data/manifest.json` by appending a new entry under the correct project with your `modelId`, `title`, and `path` to your `index.html`.
- Do **not** modify or delete other models’ folders or the harness files.
- Verify your implementation loads correctly inside the harness iframe and also when opened directly via "Open in new tab".

Keep everything dependency-free: vanilla HTML, CSS, and JavaScript only.
