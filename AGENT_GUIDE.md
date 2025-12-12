# Agent Guide

## Adding a new model file
1. Place the rendered artifact under `public/projects/<project-folder>/`. Keep names lowercase and hyphenated for consistency.
2. Update `public/data/manifest.json`:
   - Append the project entry if it does not exist (provide `id`, `name`, and a `models` array).
   - Add a model object with `id`, `name` (file name with extension), `path` (absolute path starting with `/projects/…`), and an optional `description`.
3. The Project Explorer tree reads only from `manifest.json`; no other source of truth is used.
4. If you add a new project folder, keep the folder name in sync with the `name` field in the manifest to maintain a clean `projects/` tree.

## Tooling
- Use **pnpm** for installs and scripts (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`).
- The app forces a light theme via `colorMode` and has no dark mode toggle.
