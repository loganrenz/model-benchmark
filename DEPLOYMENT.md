# Deployment Guide

This application is designed to run on **Cloudflare Pages** with **Cloudflare D1** database.

## Quick Reference

```bash
# Development
npm install
npm run dev                    # Start dev server at http://localhost:2029

# Production Deployment
npm run deploy:pages           # Build and deploy to Cloudflare Pages

# Database Management
wrangler d1 list              # List D1 databases
wrangler d1 execute model-benchmark-db --remote --command "SELECT * FROM projects"
```

## Architecture

This application is built for **Cloudflare Pages** with:

- **Cloudflare Pages**: Static site hosting and serverless functions
- **Cloudflare Workers**: Edge runtime for API endpoints
- **Cloudflare D1**: SQLite-based serverless database

The app uses Nuxt 4 with the `cloudflare-pages` preset, which compiles server routes into Workers. In development, it uses a local SQLite database (`better-sqlite3`).

## Development Setup

For local development, no Cloudflare account is needed:

```bash
# Install dependencies
npm install

# Start development server (uses local SQLite)
npm run dev
```

The app will run at `http://localhost:2029` with a local SQLite database at `.data/local.db`.

## Prerequisites for Production

1. A Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated with Cloudflare: `wrangler login`

## Initial Setup

### 1. Create D1 Database

The database is already configured in `wrangler.toml`:

- Database name: `model-benchmark-db`
- Database ID: `6ac70ed1-1031-4f67-830d-4157c1d6b942`

If you need to create a new database:

```bash
wrangler d1 create model-benchmark-db
```

Then update the `database_id` in `wrangler.toml` with the ID from the output.

### 2. Initialize Database Schema

The database schema is automatically created when the application first runs. However, if you need to manually initialize it:

#### Option A: Via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **D1**
3. Select `model-benchmark-db`
4. Go to **Console** tab
5. Run the schema SQL from `server/database/migrate.ts`

#### Option B: Via Admin UI (Recommended)

1. Deploy your application first
2. Visit your site at `https://model-benchmark.pages.dev`
3. Navigate to `/admin`
4. Click "Initialize Projects" to create default projects
5. The database schema is created automatically on first access

### 3. Deploy to Cloudflare Pages

#### Option A: Connect GitHub Repository (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages**
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
6. Add environment bindings:
   - Go to **Settings** → **Functions** → **D1 database bindings**
   - Add binding: `DB` → `model-benchmark-db`
7. Click **Save and Deploy**

#### Option B: Deploy via Wrangler CLI

```bash
# Build and deploy in one command
npm run deploy:pages
```

Or manually:

```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=model-benchmark
```

**Note:** Make sure the D1 binding is configured in your Pages project settings (see Option A, step 6).

### 4. Seed Initial Data (Optional)

After deployment, you can seed the database with initial projects:

1. Go to your deployed site at `https://model-benchmark.pages.dev` (or your custom domain)
2. Navigate to `/admin`
3. Click **Initialize Projects** to create the default projects
4. Click **Seed Reference Submissions** to add reference implementations

## Environment Variables

### Required for Thumbnails (Optional)

To generate real screenshot thumbnails instead of placeholder images:

1. Get an API key from [Screenshotone](https://screenshotone.com)
2. Set the environment variable:

**For local development**, create a `.env` file:

```bash
NUXT_SCREENSHOTONE_API_KEY=your-api-key-here
```

**For production (Cloudflare Pages)**:

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to **Settings** → **Environment variables**
3. Add: `NUXT_SCREENSHOTONE_API_KEY` = `your-api-key`
4. Redeploy your application

If no API key is configured, the app will use colorful placeholder thumbnails instead.

### Other Configuration

- `wrangler.toml` for Cloudflare settings
- `nuxt.config.ts` for application settings

## Custom Domain

To add a custom domain:

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Click **Custom domains**
3. Add your domain
4. Update DNS records as instructed

## Troubleshooting

### Database Connection Issues

If you see database errors in production:

1. Verify D1 binding is configured: `wrangler pages deployment list`
2. Check binding name matches `DB` in `wrangler.toml`
3. Ensure database exists: `wrangler d1 list`

### Build Failures

Common issues:

- **Module not found**: Run `npm install` locally first
- **Type errors**: Run `npm run build` locally to check for TypeScript errors
- **Memory issues**: Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### 404 Errors

If the site shows 404:

1. Check that build output directory is `dist`
2. Verify the build completed successfully
3. Check Cloudflare Pages deployment logs

### “Workers-specific command in a Pages project”

If you see:

- `It looks like you've run a Workers-specific command in a Pages project.`

Then you’re running the wrong command.

- For **Pages**, use `wrangler pages deploy dist` (CLI deploy)
- If you’re deploying via the **Cloudflare Pages dashboard (Connect Git)**, you generally should **not** run any `wrangler ... deploy` as a custom deploy step — Pages will deploy automatically after the build. Just set the build output directory to `dist` and configure the D1 binding (`DB`) in Pages settings.

## Production Database Management

### Running Migrations

The database schema is automatically applied when you deploy. However, if you need to manually run migrations:

```bash
# View your D1 databases
wrangler d1 list

# Execute migrations manually (if needed)
wrangler d1 execute model-benchmark-db --remote --command "CREATE TABLE IF NOT EXISTS..."
```

### Checking Database Contents

```bash
# Query your production database
wrangler d1 execute model-benchmark-db --remote --command "SELECT * FROM projects"

# Or use the Cloudflare dashboard
# Go to Workers & Pages > D1 > model-benchmark-db > Console
```

### Backup and Recovery

```bash
# Export database to SQL
wrangler d1 export model-benchmark-db --remote --output=backup.sql

# Import from SQL
wrangler d1 execute model-benchmark-db --remote --file=backup.sql
```
