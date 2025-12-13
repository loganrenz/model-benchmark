# Project Viewer

A mobile-first web app for comparing AI agent implementations of the same project specifications.

## What Is This?

This is an **AI agent benchmark/comparison tool**. Multiple AI agents (Claude, GPT-4, Gemini, etc.) each receive the same project prompt and create their own implementation. You can then browse and compare how different agents approached the same problem.

**Use Case:** Test how different AI models implement visual projects like simulations, animations, games, data visualizations, etc.

**How It Works:**
1. Each project has a `PROMPT.md` specification (≤100 words)
2. Different AI agents read the prompt and create their own implementation
3. All implementations are displayed in this app for easy side-by-side comparison
4. Each implementation is self-contained and runs in an iframe

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
- ✅ Read ONLY the `PROMPT.md` in the project directory
- ✅ Create new implementations in your own directory
- ✅ Always include an `index.html` entry point  
- ✅ Update the manifest with your implementation
- ❌ Never read other implementations (blind comparison)
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
