# Admin Guide

This guide explains how to manage the Model Benchmark application through the admin dashboard.

## Accessing the Admin Dashboard

Navigate to `/admin` in your browser to access the admin dashboard.

## Features

### 1. Submission Management

The **Submissions** tab shows all pending submissions that need review.

**Actions:**
- **View**: Click on any submission to open the review modal
- **Preview**: See the HTML implementation in an iframe
- **Approve**: Accept the submission to make it visible on the site
- **Reject**: Decline the submission
- **Add Notes**: Include reviewer feedback for any submission

**Workflow:**
1. Click on a pending submission
2. Review the implementation in the preview iframe
3. Add optional reviewer notes
4. Click "Approve" or "Reject"

### 2. Project Management

The **Projects** tab shows all projects in the database.

**Actions:**
- **Create**: Add a new project
- **Edit**: Update project label or folder
- **Delete**: Remove a project (only if it has no submissions)
- **Initialize Defaults**: Quick-add the 5 default projects

#### Creating a Project

1. Click "Create Project"
2. Fill in the form:
   - **ID**: Unique identifier (lowercase, hyphens only)
     - Example: `my-new-project`
     - Used in URLs and database
   - **Label**: Display name shown to users
     - Example: `My New Project`
   - **Folder**: Directory name in `public/projects/`
     - Usually same as ID
     - Example: `my-new-project`
3. Click "Create"

#### Editing a Project

1. Click "Edit" on any project
2. Update the label or folder (ID cannot be changed)
3. Click "Update"

#### Deleting a Project

1. Click "Delete" on any project
2. Confirm the deletion
3. Note: Projects with submissions cannot be deleted

#### Initialize Default Projects

Click "Initialize Defaults" to quickly add these 5 projects:
- Traffic Simulation
- Particle Gravity Simulation
- Wave Pattern Generator
- Conway's Game of Life
- Pathfinding Algorithm Visualizer

This is useful for first-time setup. Existing projects will not be affected.

## Database Structure

The application uses three main tables:

### Projects Table
- `id`: Unique identifier
- `label`: Display name
- `folder`: Directory in `public/projects/`
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Submissions Table
- `id`: Unique identifier
- `project_id`: Reference to project
- `agent_name`: Name of the AI agent
- `label`: Display label for the submission
- `file_path`: Path to the HTML file
- `html_content`: The actual HTML code
- `status`: pending, approved, or rejected
- `submitted_at`: Submission timestamp
- `reviewed_at`: Review timestamp
- `reviewer_notes`: Admin feedback

### Prompts Table (Coming Soon)
- `id`: Unique identifier
- `project_id`: Reference to project
- `difficulty`: small, medium, or advanced
- `title`: Prompt title
- `content`: Prompt text
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Best Practices

### Project Management
1. Use descriptive, clear project labels
2. Keep IDs lowercase with hyphens
3. Ensure the folder exists in `public/projects/` before creating the project
4. Don't delete projects that have historical submissions

### Submission Review
1. Test the implementation in the preview iframe
2. Check for:
   - Functionality (does it work?)
   - Mobile responsiveness
   - No external dependencies (should be self-contained)
3. Add reviewer notes explaining approval/rejection decisions
4. Be consistent with approval criteria

### Naming Conventions
- **Project IDs**: `traffic-simulation`, `wave-patterns`
- **Agent Names**: `agent-claude-sonnet-4`, `agent-gpt-4`
- **Labels**: `Claude Sonnet 4`, `GPT-4 Implementation`

## API Endpoints

The admin dashboard uses these API endpoints:

### Projects
- `GET /api/projects` - List all projects
- `POST /api/admin/projects` - Create a project
- `PUT /api/admin/projects/:id` - Update a project
- `DELETE /api/admin/projects/:id` - Delete a project
- `POST /api/admin/init-projects` - Initialize default projects

### Submissions
- `GET /api/submissions?status=pending` - List pending submissions
- `PUT /api/submissions/:id` - Update submission status

## Troubleshooting

### "Database not available"
- In development: Check that `.data/local.db` exists (auto-created on first run)
- In production: Verify D1 binding is configured in Cloudflare Pages settings
  - Go to Pages → Your Project → Settings → Functions → D1 database bindings
  - Ensure binding name is `DB` and points to `model-benchmark-db`

### "Project with this ID already exists"
- Choose a different ID or edit the existing project

### "Cannot delete project with N submissions"
- Delete or reassign submissions first
- Or keep the project for historical purposes

### Submissions not appearing
- Check the status filter (pending/approved/rejected)
- Refresh the page
- Check browser console for errors

## Development vs Production

### Development (Local)
- Uses local SQLite database via `better-sqlite3`
- Database file: `.data/local.db`
- Auto-initializes on first run
- No Cloudflare account needed
- Runs on `http://localhost:2029`

### Production (Cloudflare)
- Uses Cloudflare D1 (serverless SQLite)
- Hosted on Cloudflare Pages
- API runs on Cloudflare Workers
- D1 binding configured in `wrangler.toml`
- Database auto-initializes on first access
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup instructions

