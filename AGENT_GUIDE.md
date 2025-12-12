# Project Viewer — Agent Guide

This app is a **mobile-first Project Viewer**. The UI is **fully driven** by a single source of truth:

- `public/data/manifest.json`

Model outputs are served as static files under:

- `public/projects/<project-folder>/<model-file>`

The app renders the selected model output in an **iframe**.

---

## Add a new model output (recommended workflow)

### 1) Create (or choose) a project folder

Place your files under:

- `public/projects/<project-folder>/`

Example:

- `public/projects/my-project/`

### 2) Add the model file (leaf)

Add a self-contained file that can be iframed. The simplest is an HTML file:

- `public/projects/my-project/run-2025-12-12.html`

Rules:

- Keep the output **self-contained** (avoid runtime dependencies unless they’re also in the same folder).
- Prefer **relative asset paths** inside that folder (e.g. `./assets/...`).
- Make sure the output works at its public URL:
  - `/projects/my-project/run-2025-12-12.html`

### 3) Update `public/data/manifest.json`

Open:

- `public/data/manifest.json`

Add (or update) an entry in the `projects` array.

Each project must include:

- `id`: stable identifier (no spaces)
- `label`: human label (optional niceness)
- `folder`: the folder name under `public/projects/`
- `models`: array of model “files”

Each model must include:

- `id`: stable identifier within the project (no spaces)
- `label`: what shows in the tree (often the filename)
- `file`: filename within the project folder

Example:

```json
{
  "id": "my-project",
  "label": "My Project",
  "folder": "my-project",
  "models": [
    {
      "id": "run-2025-12-12",
      "label": "run-2025-12-12.html",
      "file": "run-2025-12-12.html"
    }
  ]
}
```

---

## Validation checklist (don’t skip)

- The file exists:
  - `public/projects/<folder>/<file>`
- The manifest JSON is valid and matches:
  - `folder` → the directory name under `public/projects/`
  - `file` → the filename inside that directory
- The iframe URL resolves:
  - `/projects/<folder>/<file>`
- Don’t break other models:
  - Don’t rename existing folders/files without updating the manifest.
  - Keep additions backward compatible.

