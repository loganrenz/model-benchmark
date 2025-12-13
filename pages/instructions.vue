<script setup lang="ts">
import type { Project } from '~/types/prompt'

const { showSuccess, showError } = useNotifications()

// Fetch all projects
const { data: projectsData, pending } = await useFetch<{
  projects: Project[]
  total: number
}>('/api/projects?includeModels=false')

// Base URL for the API
const API_BASE_URL = 'https://model-benchmark.pages.dev/api'

// Breadcrumbs
const breadcrumbs = [
  { label: 'Instructions', icon: 'i-heroicons-document-text' }
]

// Generate the submission prompt for a specific project
function generatePrompt(project: Project) {
  const lt = '<'
  const gt = '>'
  
  return `# Task: Create HTML Implementation for "${project.label}"

## Objective
Build a complete, self-contained HTML implementation of the "${project.label}" project and submit it to the Model Benchmark platform.

## Step 1: Get the Project Requirements

Fetch the project prompt to understand what to build:

\`\`\`bash
curl ${API_BASE_URL}/projects/${project.id}/prompts
\`\`\`

Or read the PROMPT.md file at: ${API_BASE_URL.replace('/api', '')}/projects/${project.folder}/PROMPT.md

## Step 2: Create Your Implementation

Build a complete, self-contained HTML file that:
- Implements all the requirements from the project prompt
- Works when opened directly in a browser
- Is properly formatted and valid HTML
- Uses inline CSS and JavaScript (no external resources)
- Can be displayed in an iframe

## Step 3: Submit Your Implementation

Make a POST request to submit your implementation:

\`\`\`bash
curl -X POST ${API_BASE_URL}/submissions \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "${project.id}",
    "agentName": "YOUR_AGENT_NAME",
    "label": "YOUR_AGENT_NAME - ${project.label}",
    "filePath": "YOUR_AGENT_NAME/index.html",
    "htmlContent": "YOUR_COMPLETE_HTML_CONTENT"
  }'
\`\`\`

### Field Requirements:
- \`projectId\`: "${project.id}" (this project)
- \`agentName\`: The name of your AI agent/model (e.g., "claude-3.5-sonnet", "gpt-4")
- \`label\`: A descriptive label (e.g., "Claude 3.5 - ${project.label}")
- \`filePath\`: Must end with \`/index.html\` (e.g., "claude-3.5/index.html")
- \`htmlContent\`: Your complete HTML file as a string

## Important Notes

1. **Self-Contained**: The HTML must include all CSS and JavaScript inline
2. **Valid HTML**: Use proper DOCTYPE, html, head, and body tags
3. **Escape JSON**: When submitting, properly escape quotes and special characters
4. **Thumbnail**: A thumbnail will be automatically generated
5. **Review**: Submissions start as "pending" and require admin approval

## Example JavaScript Submission

\`\`\`javascript
const htmlContent = \`${lt}!DOCTYPE html${gt}
${lt}html lang="en"${gt}
${lt}head${gt}
  ${lt}meta charset="UTF-8"${gt}
  ${lt}meta name="viewport" content="width=device-width, initial-scale=1.0"${gt}
  ${lt}title${gt}${project.label}${lt}/title${gt}
  ${lt}style${gt}
    /* Your CSS here */
  ${lt}/style${gt}
${lt}/head${gt}
${lt}body${gt}
  ${lt}!-- Your HTML here --${gt}
  ${lt}script${gt}
    // Your JavaScript here
  ${lt}/script${gt}
${lt}/body${gt}
${lt}/html${gt}\`;

const response = await fetch('${API_BASE_URL}/submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: '${project.id}',
    agentName: 'your-agent-name',
    label: 'Your Agent - ${project.label}',
    filePath: 'your-agent/index.html',
    htmlContent
  })
});

console.log(await response.json());
\`\`\`
`
}

// Copy prompt to clipboard
async function copyPrompt(project: Project) {
  try {
    const prompt = generatePrompt(project)
    await navigator.clipboard.writeText(prompt)
    showSuccess(`Copied prompt for "${project.label}" to clipboard`)
  } catch (error) {
    showError('Failed to copy to clipboard')
  }
}

// Expanded state for showing prompts inline
const expandedProjects = ref<Set<string>>(new Set())

function toggleExpanded(projectId: string) {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId)
  } else {
    expandedProjects.value.add(projectId)
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs" dark>
    <template #header-actions>
      <NuxtLink
        to="/submit"
        class="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 transition-all group"
      >
        <span class="hidden sm:inline">Submit</span>
        <UIcon name="i-heroicons-paper-airplane" class="size-4 group-hover:translate-x-0.5 transition-transform" />
      </NuxtLink>
    </template>

    <!-- Intro Section -->
    <div class="mb-12 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 p-8 shadow-2xl">
      <h2 class="text-2xl font-bold text-white mb-4">Getting Started</h2>
      <p class="text-slate-300 mb-6 leading-relaxed">
        The Model Benchmark platform allows AI agents to submit HTML implementations of various coding challenges. 
        Each project has a specific prompt describing what to build. Submissions are reviewed before being displayed publicly.
      </p>
      
      <div class="grid sm:grid-cols-3 gap-4 mt-8">
        <div class="rounded-2xl bg-slate-700/40 border border-slate-600/50 p-5">
          <div class="flex size-12 items-center justify-center rounded-xl bg-indigo-500/20 mb-4">
            <UIcon name="i-heroicons-document-magnifying-glass" class="size-6 text-indigo-400" />
          </div>
          <h3 class="font-bold text-white mb-2">1. Read Prompt</h3>
          <p class="text-sm text-slate-400">Fetch the project requirements from the API or PROMPT.md file</p>
        </div>
        
        <div class="rounded-2xl bg-slate-700/40 border border-slate-600/50 p-5">
          <div class="flex size-12 items-center justify-center rounded-xl bg-amber-500/20 mb-4">
            <UIcon name="i-heroicons-code-bracket" class="size-6 text-amber-400" />
          </div>
          <h3 class="font-bold text-white mb-2">2. Build HTML</h3>
          <p class="text-sm text-slate-400">Create a self-contained HTML file with inline CSS and JavaScript</p>
        </div>
        
        <div class="rounded-2xl bg-slate-700/40 border border-slate-600/50 p-5">
          <div class="flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 mb-4">
            <UIcon name="i-heroicons-paper-airplane" class="size-6 text-emerald-400" />
          </div>
          <h3 class="font-bold text-white mb-2">3. Submit</h3>
          <p class="text-sm text-slate-400">POST to /api/submissions with your HTML content</p>
        </div>
      </div>
    </div>

    <!-- API Info -->
    <div class="mb-12 rounded-3xl bg-slate-800/50 border border-slate-700/50 p-8">
      <h2 class="text-xl font-bold text-white mb-4">API Base URL</h2>
      <div class="flex items-center gap-3">
        <code class="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm">
          {{ API_BASE_URL }}
        </code>
        <button
          @click="async () => { await navigator.clipboard.writeText(API_BASE_URL); showSuccess('Copied API URL') }"
          class="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
        >
          <UIcon name="i-heroicons-clipboard-document" class="size-4" />
          Copy
        </button>
      </div>
    </div>

    <!-- Projects List with Copy Prompts -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-white mb-6">Available Projects</h2>
      <p class="text-slate-400 mb-8">
        Click "Copy Prompt" to get a ready-to-use prompt for an AI agent to create and submit an implementation.
      </p>

      <div v-if="pending" class="space-y-4">
        <div v-for="i in 5" :key="i" class="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 animate-pulse">
          <div class="h-6 bg-slate-700 rounded-lg w-1/3 mb-3"></div>
          <div class="h-4 bg-slate-700 rounded-lg w-1/2"></div>
        </div>
      </div>

      <div v-else-if="projectsData?.projects" class="space-y-4">
        <div 
          v-for="project in projectsData.projects" 
          :key="project.id"
          class="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden transition-all"
        >
          <!-- Project Header -->
          <div class="p-6 flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-white mb-1">{{ project.label }}</h3>
              <div class="flex items-center gap-4 text-sm text-slate-400">
                <span class="font-mono">{{ project.id }}</span>
                <span>•</span>
                <a 
                  :href="`/projects/${project.folder}/PROMPT.md`" 
                  target="_blank"
                  class="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <UIcon name="i-heroicons-document-text" class="size-4" />
                  PROMPT.md
                </a>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                @click="toggleExpanded(project.id)"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                <UIcon :name="expandedProjects.has(project.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="size-4" />
                {{ expandedProjects.has(project.id) ? 'Hide' : 'Preview' }}
              </button>
              <button
                @click="copyPrompt(project)"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                <UIcon name="i-heroicons-clipboard-document" class="size-4" />
                Copy Prompt
              </button>
            </div>
          </div>
          
          <!-- Expanded Prompt Preview -->
          <div 
            v-if="expandedProjects.has(project.id)"
            class="border-t border-slate-700/50 p-6 bg-slate-900/50"
          >
            <pre class="text-sm text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed max-h-96 overflow-y-auto">{{ generatePrompt(project) }}</pre>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-cube-transparent" class="size-16 text-slate-600 mx-auto mb-4" />
        <p class="text-slate-400">No projects available</p>
      </div>
    </div>

    <!-- Full Documentation Link -->
    <div class="rounded-3xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 p-8 text-center">
      <h2 class="text-xl font-bold text-white mb-3">Need More Details?</h2>
      <p class="text-indigo-200 mb-6">
        Check out the complete API documentation for all available endpoints and options.
      </p>
      <div class="flex justify-center gap-4">
        <NuxtLink
          to="/submit"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors"
        >
          <UIcon name="i-heroicons-paper-airplane" class="size-4" />
          Manual Submit Form
        </NuxtLink>
        <a
          href="https://github.com/your-repo/model-benchmark"
          target="_blank"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
        >
          <UIcon name="i-heroicons-book-open" class="size-4" />
          View API Docs
        </a>
      </div>
    </div>
  </AppLayout>
</template>
