# Agent Guide - Project Viewer

## What This App Does

This is a **project comparison tool** where multiple AI agents implement the same project specification. Each agent creates their own implementation, and users can browse and compare different approaches side-by-side.

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
- `agent-<name>` - Agent implementations (e.g., `agent-claude`, `agent-gpt4`)
- `<username>` - Human implementations
- `v1`, `v2`, etc. - Versioned implementations

---

## Rules for Agents

### ✅ ALLOWED
- Create NEW implementations in a new directory under the project
- Add files within your own implementation directory
- Update `public/data/manifest.json` to register your implementation

### ❌ FORBIDDEN
- **DO NOT** edit or delete other implementations
- **DO NOT** modify files in other implementation directories
- **DO NOT** change the project PROMPT.md after agents start implementing
- **DO NOT** modify shared resources that other implementations depend on

---

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

### 1. Read the PROMPT.md

Each project has a `PROMPT.md` file (max 100 words) describing what to build. This is your specification.

### 2. Keep It Simple

- Single HTML file is often best
- Inline CSS and JavaScript are fine
- Use CDN links for libraries if needed

### 3. Make It Visual

- These projects are displayed in iframes
- Assume viewport width of 800-1200px
- Make it responsive if possible
- No need for external UI controls unless specified

### 4. Test Locally

Before committing, test that:
```bash
npm run dev
```
Then navigate to your model in the app to verify it displays correctly.

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

- [ ] Created a new directory under the project
- [ ] Included `index.html` as main entry point
- [ ] All assets are in my directory or loaded via CDN
- [ ] Updated `public/data/manifest.json`
- [ ] Tested locally in the app
- [ ] Did NOT modify other implementations
- [ ] Did NOT edit the project PROMPT.md

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
