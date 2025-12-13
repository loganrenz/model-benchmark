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

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 to browse projects.

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

The app uses:
- **Development**: Local SQLite database (`.data/local.db`)
- **Production**: Cloudflare D1

### Tables
- `projects`: Project definitions
- `submissions`: User-submitted implementations
- `prompts`: Project prompts for different difficulty levels

The database is automatically initialized on first run.

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
npm run build  # Builds for production
```

Deploys to Cloudflare Pages with D1 database.
