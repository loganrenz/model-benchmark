# Agent Guide - Project Viewer

## What This App Does

This is a **project comparison tool** where multiple AI agents implement the same project specification. Each agent creates their own implementation, and users can browse and compare different approaches side-by-side in an iframe viewer.

## Quick Start for Agents

When you receive a task to implement a project:

1. **Read ONLY** `public/projects/<project-name>/PROMPT.md` - This is your specification
   - ⚠️ **DO NOT read other implementations** - Create your own from scratch
   - ⚠️ **DO NOT look at reference code** - Work independently
2. **Create** `public/projects/<project-name>/<your-agent-name>/` - Your implementation folder
3. **Write** `public/projects/<project-name>/<your-agent-name>/index.html` - Your entry point (required)
4. **Update** `public/data/manifest.json` - Register your implementation
5. **Test** locally with `npm run dev` and verify it displays correctly

**Important:** This is a blind comparison. Each agent should implement the project based solely on the PROMPT.md without seeing how others solved it. This ensures genuine comparison of different approaches.

---

## Project Structure

### Directory Organization

```
public/projects/
  <project-name>/
    PROMPT.md           # Project specification (100 words max)
    <implementation-name>/
      index.html        # Main entry point
      ...               # Any additional files
```

**Example:**
```
public/projects/
  traffic-simulation/
    PROMPT.md
    reference/
      index.html
    agent-claude/
      index.html
    agent-gpt4/
      index.html
```

### Implementation Names

Use descriptive names for implementations:
- `reference` - The original/canonical implementation
- `agent-<name>` - AI agent implementations (e.g., `agent-claude`, `agent-gpt4`, `agent-gemini`)
- `<username>` - Human implementations
- `v1`, `v2`, etc. - Versioned implementations

**For AI Agents:** Use `agent-<your-model-name>` format:
- Example: `agent-claude-sonnet`, `agent-gpt4o`, `agent-gemini-pro`
- This makes it easy to identify and compare agent implementations

---

## Rules for Agents

### ✅ ALLOWED
- Read `PROMPT.md` in the project directory
- Read `AGENT_GUIDE.md`, `README.md` for structure/guidelines
- Create NEW implementations in a new directory under the project
- Add files within your own implementation directory
- Update `public/data/manifest.json` to register your implementation

### ❌ FORBIDDEN - Critical Rules
- **DO NOT** read other implementations (reference, agent-*, etc.)
- **DO NOT** look at other agent's code or approaches
- **DO NOT** edit or delete other implementations
- **DO NOT** modify files in other implementation directories
- **DO NOT** change the project PROMPT.md after agents start implementing
- **DO NOT** modify shared resources that other implementations depend on
- **DO NOT** modify the Nuxt app code (components, pages, etc.) unless fixing bugs

**Why these restrictions?** This is a blind comparison. Each agent must work independently from the PROMPT.md only, without being influenced by existing solutions. This ensures an authentic comparison of different AI approaches.

---

## Files to Read (Before You Start)

**Required Reading:**
1. **`AGENT_GUIDE.md`** (this file) - Complete guidelines
2. **`README.md`** - Project overview and quick reference  
3. **`public/data/manifest.json`** - See how projects/implementations are registered
4. **`public/projects/<project>/PROMPT.md`** - Your specification (≤100 words)

**⚠️ DO NOT READ:**
- **Other implementations** (e.g., `reference/`, `agent-*/`) - Work independently!
- **Other agent's code** - This defeats the purpose of comparison
- **Any files outside the project structure docs**

**Why?** This is a blind comparison test. We want to see how different agents approach the same problem independently, without being influenced by existing solutions.

## Adding Your Implementation

### Step 1: Create Your Directory

Create a new directory for your implementation:
```
public/projects/<project-name>/<your-implementation-name>/
```

### Step 2: Create Your Files

All your files go in your directory. **ALWAYS** include an `index.html` as the main entry point:

```
public/projects/<project-name>/<your-implementation-name>/
  index.html          # REQUIRED - main file
  style.css           # optional
  script.js           # optional
  assets/             # optional
    ...
```

### Step 3: Make It Self-Contained

Your implementation should work standalone:
- ✅ Include all dependencies (or use CDN links)
- ✅ Use relative paths for local assets (`./assets/image.png`)
- ✅ Test that it works at its public URL: `/projects/<project>/<impl>/index.html`
- ❌ Don't rely on files outside your directory

### Step 4: Update the Manifest

Edit `public/data/manifest.json` to add your implementation:

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
          "id": "your-impl-name",
          "label": "Your Implementation Name",
          "file": "your-impl-name/index.html"
        }
      ]
    }
  ]
}
```

**Key fields:**
- `id` - Unique identifier (no spaces, lowercase with hyphens)
- `label` - Human-readable name shown in UI
- `file` - Path relative to project folder (always end with `/index.html`)

---

## Implementation Guidelines

### 1. Read ONLY the PROMPT.md

Each project has a `PROMPT.md` file (max 100 words) describing what to build. This is your ONLY specification.

**Work independently:** Do not reference other implementations. Create your solution based solely on the prompt. This ensures genuine comparison of different agent approaches.

### 2. Keep It Simple

- Single HTML file is often best
- Inline CSS and JavaScript are fine
- Use CDN links for libraries if needed

### 3. Make It Visual

- These projects are displayed in iframes
- Assume viewport width of 800-1200px
- Make it responsive if possible
- No need for external UI controls unless specified

### 4. Test Your Implementation

Before finishing, verify your implementation works:

**Local Development Test:**
```bash
npm run dev
```
- Open http://localhost:3000
- Open the bottom drawer (tap/click the handle)
- Select your implementation from the list
- Verify it displays correctly in the iframe

**Production Build Test:**
```bash
npm run build
npm run preview
```
- Verify your implementation still works in production mode
- Check that all assets load correctly

**Direct File Test:**
- Open your `index.html` directly in a browser
- Ensure it works standalone (all dependencies load)

---

## Project Prompt Guidelines

When creating a new project, write a `PROMPT.md` that:

1. **Is concise** - Maximum 100 words
2. **Specifies the core requirements** - What must be built
3. **Leaves room for creativity** - Don't over-specify implementation details
4. **Defines success criteria** - What makes a good implementation
5. **Is technology-agnostic** - Don't mandate specific frameworks unless necessary

**Good prompt example:**
> Create a traffic light simulation showing cars on a one-way street. Cars must stop at red lights and proceed on green. Include multiple cars and reasonable timing cycles (3-5 seconds). Visual-only output, no UI controls needed.

**Bad prompt example:**
> Use React and Three.js to create a 3D traffic simulation with exactly 5 red cars and 3 blue cars, green light duration of 4.2 seconds, using TypeScript and Tailwind CSS...

---

## Validation Checklist

Before submitting your implementation:

- [ ] Read the project `PROMPT.md` specification
- [ ] Created a new directory under the project (e.g., `agent-yourname/`)
- [ ] Included `index.html` as main entry point
- [ ] All assets are in my directory or loaded via CDN
- [ ] Updated `public/data/manifest.json` with correct paths
- [ ] Tested with `npm run dev` - implementation displays in app
- [ ] Tested with `npm run build && npm run preview` - works in production mode
- [ ] Tested `index.html` directly in browser - works standalone
- [ ] Did NOT modify other implementations
- [ ] Did NOT edit the project PROMPT.md
- [ ] Did NOT modify the Nuxt app code (unless fixing bugs)

---

## Troubleshooting

### My implementation doesn't show up in the app
- Check `manifest.json` syntax is valid JSON
- Verify the `file` path is correct: `<your-folder>/index.html`
- Ensure `id` is unique and matches your folder name
- Restart the dev server after manifest changes

### My implementation shows a blank page
- Check browser console for errors
- Verify all assets use correct paths (relative or CDN)
- Test the `index.html` file directly in a browser
- Ensure no dependencies on files outside your directory

### CSS/Styles not loading in production
- The app uses Tailwind CSS via `@nuxt/ui`
- Your implementation is in an iframe - it needs its own styles
- Include all CSS inline or in your own files
- Don't depend on the parent app's styles

### Images/Assets not loading
- Use relative paths: `./assets/image.png` 
- Or use absolute paths from your directory: `/projects/<project>/<impl>/assets/image.png`
- Or use CDN URLs: `https://...`
- Verify files are actually in your directory

---

## Tips for Great Implementations

1. **Be creative** - Different approaches make comparisons interesting
2. **Comment your code** - Help others understand your approach
3. **Optimize for visibility** - Clear visuals matter in side-by-side comparisons
4. **Handle edge cases** - Make it robust
5. **Keep it performant** - Smooth animations, efficient rendering

---

## Example: Adding a Traffic Simulation Implementation

Let's say you want to add your implementation of the traffic simulation:

1. Create directory:
   ```
   public/projects/traffic-simulation/agent-yourname/
   ```

2. Create your HTML:
   ```html
   <!-- public/projects/traffic-simulation/agent-yourname/index.html -->
   <!DOCTYPE html>
   <html>
   <head>
     <title>Traffic Simulation</title>
     <style>/* your styles */</style>
   </head>
   <body>
     <canvas id="canvas"></canvas>
     <script>/* your code */</script>
   </body>
   </html>
   ```

3. Update manifest:
   ```json
   {
     "id": "agent-yourname",
     "label": "Agent YourName Implementation", 
     "file": "agent-yourname/index.html"
   }
   ```

4. Test and commit!

---

## Questions?

- Check existing implementations for examples
- Ensure your directory structure matches the guidelines
- Test thoroughly before committing
- Keep implementations isolated and self-contained
