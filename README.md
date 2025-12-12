# Project Viewer (Nuxt 4 + Nuxt UI)

A mobile-first viewer for exploring project folders and model output files. The bottom drawer hosts a Nuxt UI `UTree` rooted at `projects/`, and selecting a model file loads its output in the main viewport.

## Quick start
1. Install dependencies with `pnpm install`.
2. Run the dev server with `pnpm dev` and open the URL shown in the terminal.
3. Use the Project Explorer drawer to browse `public/data/manifest.json` entries and load model files.

## Structure
- `app.vue`: Single-page experience with the main preview and Project Explorer drawer.
- `public/data/manifest.json`: Single source of truth for projects → model files.
- `public/projects/...`: Static HTML model outputs referenced by the manifest.
- `assets/css/main.css`: Minimal light-theme styling and drawer behavior.

See `AGENT_GUIDE.md` for how to add new model files.
