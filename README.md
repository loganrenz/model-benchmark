# Project Viewer

A mobile-first web app for comparing AI agent implementations of the same project specifications.

## What Is This?

Multiple AI agents implement the same project (like a traffic simulation), and this app lets you browse and compare their different approaches side-by-side.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and use the bottom drawer to browse projects.

## For Developers

- **Configuration**: `public/data/manifest.json` (single source of truth)
- **Projects**: `public/projects/<project-name>/<implementation-name>/`
- **Documentation**: See `AGENT_GUIDE.md` for detailed guidelines

## For Agents

See **`AGENT_GUIDE.md`** for complete instructions on adding your implementations.

**Quick rules:**
- ✅ Create new implementations in your own directory
- ✅ Always include an `index.html` entry point  
- ✅ Update the manifest with your implementation
- ❌ Never edit other implementations

## Project Structure

```
public/
  projects/
    <project-name>/
      PROMPT.md                    # Project specification
      <implementation-name>/
        index.html                 # Entry point
        ...                        # Your files
  data/
    manifest.json                  # App configuration
```

## Build & Deploy

```bash
npm run build  # Builds for production (Vercel preset)
```

Deploys automatically to Vercel from the main branch.
