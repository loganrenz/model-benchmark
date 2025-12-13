# Migration Guide

This document explains the current architecture and recent refactoring changes.

## Current Architecture

The application uses a **database-driven architecture** with:
- Projects managed through admin UI
- Submissions stored in database
- Approved submissions served dynamically
- Single source of truth in database
- Repository pattern for database access
- Type-safe database operations

## Removed Files

The following files have been removed:
- `AGENT_GUIDE.md`
- `API_REFERENCE.md`
- `CONWAYS_GAME_OF_LIFE_IMPLEMENTATION.md`
- `PATHFINDING_VISUALIZER_IMPLEMENTATION.md`
- `PROJECT_OVERVIEW.md`
- `SEEDING.md`
- `SUBMISSION_PROMPT.md`
- `cloudflare-setup.md`
- `public/data/manifest.json`
- `server/database/seed-*.ts` (all seed files)
- `server/api/admin/seed-*.post.ts` (all seed endpoints)

## New Files

- `ADMIN_GUIDE.md` - Admin dashboard documentation
- `README.md` - Updated with new workflow
- `MIGRATION.md` - This file
- `server/api/admin/projects.post.ts` - Create projects
- `server/api/admin/projects/[id].put.ts` - Update projects
- `server/api/admin/projects/[id].delete.ts` - Delete projects
- `server/api/admin/init-projects.post.ts` - Initialize defaults
- `pages/admin.vue` - Enhanced admin dashboard

## Migration Steps

If you're migrating from the old system:

### 1. Initialize the Database

The database will auto-initialize on first run in development. For production:

```bash
# Deploy to Cloudflare Pages
# D1 database will be created automatically
```

### 2. Add Projects

Option A: Use the admin UI
1. Go to `/admin`
2. Click "Projects" tab
3. Click "Initialize Defaults" to add the 5 default projects

Option B: Create projects manually
1. Go to `/admin`
2. Click "Projects" tab
3. Click "Create Project" for each project

### 3. Migrate Existing Implementations

If you have existing HTML implementations in `public/projects/`:

1. Go to `/submit`
2. For each implementation:
   - Select the project
   - Enter the agent name (e.g., `agent-claude-sonnet-4`)
   - Enter a label (e.g., `Claude Sonnet 4`)
   - Copy/paste the HTML content
   - Submit
3. Go to `/admin` to review and approve submissions

### 4. Clean Up Old Files

The old files have already been removed. If you have local changes:

```bash
# Remove old manifest
rm -f public/data/manifest.json

# Remove old documentation
rm -f AGENT_GUIDE.md API_REFERENCE.md CONWAYS_GAME_OF_LIFE_IMPLEMENTATION.md
rm -f PATHFINDING_VISUALIZER_IMPLEMENTATION.md PROJECT_OVERVIEW.md SEEDING.md
rm -f SUBMISSION_PROMPT.md cloudflare-setup.md
```

## New Workflow

### For Admins

1. **Create Projects**: Use admin UI at `/admin`
2. **Review Submissions**: Approve/reject at `/admin`
3. **Manage Projects**: Edit/delete at `/admin`

### For Users

1. **Browse Projects**: Visit homepage
2. **Submit Implementation**: Use `/submit` form
3. **Wait for Review**: Admin will approve/reject

### For Developers

1. **Database**: Auto-initialized, no manual setup
2. **API**: RESTful endpoints for all operations
3. **Admin UI**: Full CRUD for projects and submissions

## API Changes

### Removed Endpoints
- `POST /api/admin/seed-projects`
- `POST /api/admin/seed-prompts`
- `POST /api/admin/seed-submissions`

### New Endpoints
- `POST /api/admin/projects` - Create project
- `PUT /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project
- `POST /api/admin/init-projects` - Initialize defaults

### Unchanged Endpoints
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/:id` - Update submission

## Benefits of New System

1. **No Manual File Management**: Everything through UI
2. **Better Organization**: Database is single source of truth
3. **Easier Collaboration**: Multiple admins can manage content
4. **Audit Trail**: Track who approved/rejected submissions
5. **Scalability**: Database handles growth better than files
6. **Flexibility**: Easy to add new features (tags, categories, etc.)

## Troubleshooting

### "No projects found"
- Click "Initialize Defaults" in admin UI
- Or create projects manually

### "Old manifest.json still exists"
- Delete it: `rm public/data/manifest.json`
- It's no longer used

### "Submissions not showing"
- Check they're approved in admin UI
- Pending submissions don't appear on public site

### "Database not initialized"
- Run `npm run dev` once
- Database auto-initializes on first run

## Support

For questions or issues:
1. Check `ADMIN_GUIDE.md` for admin instructions
2. Check `README.md` for general information
3. Review API endpoints in `server/api/`

