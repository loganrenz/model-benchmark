# Model Benchmark

A database-driven web app for comparing AI agent implementations of the same project specifications.

## What Is This?

This is an **AI agent benchmark/comparison tool**. Multiple AI agents (Claude, GPT-4, Gemini, etc.) each receive the same project prompt and create their own implementation. You can then browse and compare how different agents approached the same problem.

**Use Case:** Test how different AI models implement visual projects like simulations, animations, games, data visualizations, etc.

**How It Works:**
1. Projects are managed through the admin UI
2. Each project has prompts stored in the database
3. AI agents submit implementations through the submission form
4. Admins review and approve submissions
5. Approved implementations appear on the site for comparison

## Baseline capture & ledger updates

- **Curated starter URLs:** `urls/starter-1000.json` now ships with 86 deterministic, real endpoints (home, pricing, docs, status, terms, privacy, blog, security, etc.) across popular developer platforms.
- **Tamper-evident ledger:** ledger entries are hash chained (`prev_entry_hash` + `entry_hash`) and can be verified locally with the included verification helper.
- **Safe change detection:** large payloads avoid expensive LCS; a bounded line-based Jaccard similarity keeps comparisons lightweight while still flagging meaningful changes.
- **Hardened fetcher:** explicit content-type allowlist, max-bytes streaming guard, redirect caps, and structured outcomes to avoid treating failures as successes.
- **Consistent snapshots:** filesystem snapshot metadata now includes the written artifact path so JSON and on-disk bodies stay in sync.

## Known limitations (v1)

- Single-process filesystem store by default; no distributed coordination yet.
- No headless browser rendering or JavaScript execution in capture.
- Only the curated starter URL list is provided; additional targets must be added manually.
- CLI tooling is minimal; integrations beyond local workflows are out of scope for this release.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:2029 to browse projects.

## Admin Dashboard

Access the admin dashboard at `/admin` to:
- **Review submissions**: Approve or reject pending submissions
- **Manage projects**: Create, edit, and delete projects
- **View all data**: See all projects and submissions in one place

### Creating a Project

1. Go to `/admin`
2. Click the "Projects" tab
3. Click "Create Project"
4. Fill in:
   - **ID**: Unique identifier (lowercase, hyphens only, e.g., `my-project`)
   - **Label**: Display name (e.g., `My Project`)
   - **Folder**: Folder name in `public/projects/` (usually same as ID)

### Managing Submissions

1. Go to `/admin`
2. Review pending submissions in the "Submissions" tab
3. Click on a submission to preview it
4. Approve or reject with optional reviewer notes

## Submitting Implementations

Users can submit implementations at `/submit`:
1. Select a project
2. Provide agent name and label
3. Paste HTML content (self-contained single file)
4. Submit for review

## Database

The app uses SQLite with different implementations per environment:
- **Development**: Local SQLite via `better-sqlite3` (`.data/local.db`)
- **Production**: Cloudflare D1 (serverless SQLite)

### Tables
- `projects`: Project definitions
- `submissions`: User-submitted implementations
- `prompts`: Project prompts for different difficulty levels

The database schema is automatically initialized on first run.

## Project Structure

```
public/
  projects/
    <project-folder>/        # Static files for each project
server/
  api/
    admin/                   # Admin endpoints
    projects/                # Project endpoints
    submissions/             # Submission endpoints
    prompts/                 # Prompt endpoints
  repositories/              # Database repository layer
  types/                     # Database type definitions
  utils/                     # Shared utilities (validation, errors, mappers)
  database/
    migrate.ts               # Database schema
pages/
  admin.vue                  # Admin dashboard
  submit.vue                 # Submission form
  index.vue                  # Home page
components/
  admin/                     # Admin-specific components (modals)
composables/
  useNotifications.ts        # Toast notification composable
```

## Build & Deploy

```bash
npm run build         # Build for production
npm run deploy:pages  # Build and deploy to Cloudflare Pages
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Tech Stack
- **Framework**: Nuxt 4 (Vue 3)
- **UI Library**: Nuxt UI v4
- **Hosting**: Cloudflare Pages
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (production) / better-sqlite3 (development)
- **Styling**: Tailwind CSS

## Developer Notes

### Vue 3 Best Practices
This project follows proper Vue 3 patterns for props exposure. See [docs/nuxt-ui-modal-patterns.md](./docs/nuxt-ui-modal-patterns.md) for details on:
- Proper props exposure with `toRefs()`
- Modal v-model patterns
- SSR-safe component initialization
- Common troubleshooting steps
