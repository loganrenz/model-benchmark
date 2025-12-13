# Deployment Guide

This application is designed to run on **Cloudflare Pages** with **Cloudflare D1** database.

## Why Cloudflare Pages?

The application uses Cloudflare D1 (SQLite-based database) which is only available on Cloudflare's platform. While the app can run locally with better-sqlite3, production deployment requires Cloudflare Pages.

## Prerequisites

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

### 2. Run Migrations

Apply database schema to your D1 database:

```bash
# Generate SQL from migrations
wrangler d1 execute model-benchmark-db --remote --file=<(node -e "
const fs = require('fs');
const path = require('path');
const migrations = require('./server/database/migrate.ts');
// Output migration SQL
")
```

Or use the Cloudflare dashboard to run the migrations manually.

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
# Build the application
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=model-benchmark
```

### 4. Seed Initial Data (Optional)

After deployment, you can seed the database with initial projects:

1. Go to your deployed site at `https://model-benchmark.pages.dev` (or your custom domain)
2. Navigate to `/admin`
3. Click **Initialize Projects** to create the default projects
4. Click **Seed Reference Submissions** to add reference implementations

## Environment Variables

The application doesn't require environment variables for basic operation. All configuration is done through:

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

## Vercel Deployment (Not Recommended)

This application is **not compatible with Vercel** because it uses Cloudflare D1 database. To deploy on Vercel, you would need to:

1. Replace D1 with a Vercel-compatible database (Vercel Postgres, Turso, etc.)
2. Update `server/utils/database.ts` to use the new database
3. Change `nuxt.config.ts` preset to `vercel`
4. Update all database queries to work with the new database

This would be a significant refactoring effort.
