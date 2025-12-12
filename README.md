# Model Project Viewer

Nuxt UI powered file-viewer that lets you browse project outputs and their agent prompts from a single, responsive layout. Projects live as standalone HTML packages under `public/projects`, so you can drop in new experiments and review them immediately.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse projects.

> If installing fails in restricted environments, fetch dependencies where you have registry access and copy the project back into place.

## How it works

- **Left rail navigation**: Projects at the top level, their model builds beneath, optimized for desktop and a sliding drawer on mobile.
- **Main preview**: Renders each model’s `index.html` inside an iframe and keeps the prompts close by for quick reference.
- **Single-file drops**: Every project build is just HTML (plus any inline JS/CSS) in `public/projects/<project>/<model>/index.html`.

## Add a new project

1. Create a folder at `public/projects/<project-slug>/<model-name>/`.
2. Add an `index.html` containing the model output (self-contained works best).
3. Extend `data/projects.ts` with metadata for the project, its instructions, and tasks.
4. Restart the dev server to pick up the new entry.

## Current projects

- **Traffic Simulator** – reference implementation of a two-lane flow with a shared stoplight and collision-safe cars.

## Tech stack

- Nuxt 3 + TypeScript
- Nuxt UI components
- Tailwind CSS (through Nuxt UI)

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build for production
- `npm run start` – preview the production build
- `npm test` – validate project metadata and asset links

> Always run `npm test` before committing changes so every agent can rely on working project metadata and assets.
