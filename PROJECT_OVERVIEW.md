# Project Overview - Mobile-First Project Viewer

## Purpose
A mobile-first Nuxt 4 application that displays project model outputs in an iframe viewer with a bottom drawer navigation.

## Core Functionality

### 1. Main View (pages/index.vue)
- Displays an iframe showing the currently selected model output
- Shows loading state while manifest loads
- Shows error state if manifest fails to load
- Handles query parameter `?model=` to restore selected model
- Full-screen iframe view when a model is active

### 2. Project Explorer (Bottom Drawer)
- Mobile-first bottom sheet that slides up from the bottom
- Collapsed by default (showing small handle)
- Expands to 75% viewport height when opened
- Contains a tree view of all projects and their models
- Highlights currently active model
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
      "id": "project-id",
      "label": "Project Name",
      "folder": "folder-name",
      "models": [
        {
          "id": "model-id",
          "label": "model-file.html",
          "file": "model-file.html"
        }
      ]
    }
  ]
}
```

**Model Files**: Stored in `public/projects/<folder>/<file>`
- Self-contained HTML files that can be iframed
- Accessed via URL: `/projects/<folder>/<file>`

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
