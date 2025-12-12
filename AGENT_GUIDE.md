# Model Project Viewer

A Nuxt UI 4-powered viewer for project outputs. Each project is a folder of static assets served directly from `/public/projects`, with metadata defined in `data/projects.ts`.

## Structure

```
model-benchmark/
├── app.vue                 # Main Nuxt UI layout
├── data/projects.ts        # Project, model, and task definitions
├── public/projects/        # Project outputs, organized by project and model
│   └── traffic-simulator/
│       └── reference/
│           └── index.html  # Self-contained output file
└── nuxt.config.ts          # Nuxt configuration (modules, theme, head)
```

## Adding results

1. Create a folder at `public/projects/<project>/<model>/`.
2. Drop in an `index.html` containing the model’s output (include any CSS/JS inline or as sibling files).
3. Add a matching project entry in `data/projects.ts` with a `path` that points to the new HTML.

## Development

- Install dependencies: `npm install`
- Run locally: `npm run dev`
- Build for production: `npm run build`

## Deployment

The project is optimized for static hosting and Vercel. The `vercel.json` file is already configured for Nuxt output.
