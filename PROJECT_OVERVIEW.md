# Project Overview - Mobile-First Project Viewer

## Purpose
A mobile-first Nuxt 4 application for comparing AI agent implementations. Displays different agent implementations of the same project in an iframe viewer with a bottom drawer navigation for easy comparison.

**Key Concept:** Multiple AI agents implement the same prompt, and this app lets users browse and compare the different approaches.

## Core Functionality

### 1. Main View (pages/index.vue)
- Displays an iframe showing the currently selected implementation
- Shows loading state while manifest loads
- Shows error state if manifest fails to load
- Handles query parameter `?model=` to restore selected implementation
- Full-screen iframe view when an implementation is active

### 2. Project Explorer (Bottom Drawer)
- Mobile-first bottom sheet that slides up from the bottom
- Collapsed by default (showing small handle)
- Expands to 75% viewport height when opened
- Contains a tree view of all projects and their agent implementations
- Highlights currently active implementation
- Body scroll lock when drawer is open

### 3. Data Structure
**Manifest Location**: `public/data/manifest.json`

Structure:
```json
{
  "version": 1,
  "root": "projects",
  "projects": [
    {
      "id": "traffic-simulation",
      "label": "Traffic Simulation",
      "folder": "traffic-simulation",
      "models": [
        {
          "id": "reference",
          "label": "Reference Implementation",
          "file": "reference/index.html"
        },
        {
          "id": "agent-claude",
          "label": "Claude Sonnet",
          "file": "agent-claude/index.html"
        }
      ]
    }
  ]
}
```

**Implementation Files**: Stored in `public/projects/<folder>/<implementation>/`
- Each implementation is in its own subdirectory
- Must have an `index.html` as the entry point
- Self-contained HTML files that can be iframed
- Accessed via URL: `/projects/<folder>/<implementation>/index.html`
- Note: "models" in the manifest refers to agent implementations (naming kept for backwards compatibility)

## Technical Architecture

### Components
1. **ProjectExplorerDrawer.vue**
   - Bottom sheet drawer with overlay
   - Teleports to body for proper z-index layering
   - Manages open/closed state
   - Locks body scroll when open
   - Safe area insets for mobile notches

2. **ProjectTree.vue**
   - Uses @nuxt/ui UTree component
   - Builds tree structure from manifest
   - Three node types: root, project, model
   - Only models are selectable
   - Auto-expands root and highlights active model

### Composables
1. **useBodyScrollLock.ts**
   - Prevents body scrolling when drawer is open
   - Preserves scroll position
   - Handles cleanup on unmount

### Styling
- Tailwind CSS via @nuxt/ui
- Light mode only (forced)
- Mobile-first responsive design
- Uses dvh units for proper mobile viewport handling
- Safe area insets for notched devices

### State Management
- Vue composition API with refs
- URL query params for model persistence
- Client-only manifest fetching to avoid SSR hydration issues

### Build & Deploy
- Nuxt 4 with Nitro
- Vercel preset for deployment
- Static public files served directly
- Server-side rendering with client-only data fetching

## Key Features
1. **Client-only manifest loading**: Avoids SSR/hydration mismatches on Vercel
2. **Query parameter persistence**: Restores selected model on page reload
3. **Mobile-optimized**: Bottom drawer, safe area insets, proper touch handling
4. **Zero external runtime dependencies**: All models are self-contained
5. **Simple data model**: Single JSON manifest drives entire UI

## User Flow
1. App loads → Fetches manifest.json (client-only)
2. If query param exists, restore that model
3. Otherwise, default to first project's first model
4. Display model in iframe
5. User can open drawer to browse and switch between models
6. URL updates as user selects different models
