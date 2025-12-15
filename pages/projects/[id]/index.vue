<script setup lang="ts">
import type { Project, Model } from '~/types/prompt'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const { data: project, error, pending } = await useFetch<Project>(
  `/api/projects/${projectId}?includeModels=true`
)

// Breadcrumbs
const breadcrumbs = computed(() => {
  if (!project.value) return []
  return [
    { label: project.value.label }
  ]
})

// Filter state - initialize from URL query params
const searchQuery = ref(route.query.search as string || '')
const selectedAgent = ref<string>((route.query.agent as string) || '')

// Comparison mode
const comparisonMode = ref(false)
const selectedForComparison = ref<Set<string>>(new Set())

function toggleComparisonMode() {
  comparisonMode.value = !comparisonMode.value
  if (!comparisonMode.value) {
    selectedForComparison.value.clear()
  }
}

function toggleSubmissionSelection(submissionId: string) {
  if (selectedForComparison.value.has(submissionId)) {
    selectedForComparison.value.delete(submissionId)
  } else {
    selectedForComparison.value.add(submissionId)
  }
}

function startComparison() {
  if (selectedForComparison.value.size > 0) {
    router.push({
      path: `/projects/${projectId}/compare`,
      query: { compare: Array.from(selectedForComparison.value) }
    })
  }
}

// Get unique agent names from models
const uniqueAgents = computed(() => {
  if (!project.value?.models) return []
  const agents = new Set(project.value.models.map(m => {
    // Extract agent name from label (usually "AgentName - Project")
    const parts = m.label.split(' - ')
    return parts.length > 1 ? parts[0].trim() : m.label
  }))
  return Array.from(agents).sort()
})

// Filtered models
const filteredModels = computed(() => {
  if (!project.value?.models) return []
  
  let models = [...project.value.models]
  
  // Filter by agent
  if (selectedAgent.value) {
    models = models.filter(m => {
      const parts = m.label.split(' - ')
      const agentName = parts.length > 1 ? parts[0].trim() : m.label
      return agentName === selectedAgent.value
    })
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    models = models.filter(m => 
      m.label.toLowerCase().includes(query)
    )
  }
  
  return models
})

const submissionCount = computed(() => project.value?.models?.length || 0)
const filteredCount = computed(() => filteredModels.value.length)
const hasFilters = computed(() => searchQuery.value.trim() || selectedAgent.value)

// Update URL when filters change
function updateUrlFilters() {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim()
  }
  if (selectedAgent.value) {
    query.agent = selectedAgent.value
  }
  
  router.replace({
    query: Object.keys(query).length > 0 ? query : {}
  })
}

// Debounced search update
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateUrlFilters()
  }, 300) // 300ms debounce
})

watch(selectedAgent, () => {
  updateUrlFilters()
})

function clearFilters() {
  searchQuery.value = ''
  selectedAgent.value = ''
  updateUrlFilters()
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <!-- Error State -->
    <div v-if="error" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100/50">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-9 text-red-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Project not found</h2>
        <p class="mt-3 text-sm text-gray-600">
          The project you're looking for doesn't exist or may have been removed.
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            class="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/25 active:scale-95 transition-all hover:shadow-xl hover:shadow-gray-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="$router.go(0)"
            aria-label="Retry loading project"
          >
            Try again
          </button>
          <NuxtLink
            to="/"
            class="rounded-2xl bg-white border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 active:scale-95 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Go to home page"
          >
            Go home
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="pending" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="aspect-video rounded-2xl bg-white/80 border border-gray-200/80 animate-pulse">
          <div class="h-full bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    </div>

    <!-- Submissions Grid -->
    <div v-else-if="project">
      <!-- Page title and count -->
      <div class="mb-6">
        <h1 class="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
          {{ project.label }}
        </h1>
        <p class="text-sm text-gray-600 font-medium mt-1">
          {{ submissionCount }} {{ submissionCount === 1 ? 'submission' : 'submissions' }}
        </p>
      </div>

      <!-- Filters -->
      <div v-if="project.models && project.models.length > 0" class="mb-6 space-y-4">
        <!-- Top action bar -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4 flex-1">
            <!-- Search -->
            <div class="relative flex-1 min-w-[200px] max-w-md">
              <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search submissions..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                aria-label="Search submissions"
              />
            </div>
            
            <!-- Agent Filter -->
            <div v-if="uniqueAgents.length > 1" class="relative">
              <select
                v-model="selectedAgent"
                class="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">All Agents ({{ submissionCount }})</option>
                <option v-for="agent in uniqueAgents" :key="agent" :value="agent">
                  {{ agent }}
                </option>
              </select>
              <UIcon name="i-heroicons-chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
            
            <!-- Clear filters -->
            <button
              v-if="hasFilters"
              @click="clearFilters"
              class="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
              aria-label="Clear all filters"
            >
              <UIcon name="i-heroicons-x-mark" class="size-4" aria-hidden="true" />
              Clear
            </button>
            
            <!-- Result count -->
            <div v-if="hasFilters" class="text-sm text-gray-500">
              {{ filteredCount }} of {{ submissionCount }} submissions
            </div>
          </div>

          <!-- Comparison mode toggle -->
          <div class="flex items-center gap-3">
            <button
              v-if="!comparisonMode && filteredModels.length >= 2"
              @click="toggleComparisonMode"
              class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all"
            >
              <UIcon name="i-heroicons-arrows-right-left" class="size-4" />
              Compare
            </button>
          </div>
        </div>

        <!-- Comparison mode toolbar -->
        <div v-if="comparisonMode" class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-indigo-600">
              <UIcon name="i-heroicons-arrows-right-left" class="size-5 text-white" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">Comparison Mode</p>
              <p class="text-xs text-gray-600">
                {{ selectedForComparison.size }} selected
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="startComparison"
              :disabled="selectedForComparison.size === 0"
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UIcon name="i-heroicons-check" class="size-4" />
              Compare ({{ selectedForComparison.size }})
            </button>
            <button
              @click="toggleComparisonMode"
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredModels.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="model in filteredModels"
          :key="model.id"
          class="relative"
        >
          <!-- Comparison checkbox overlay -->
          <div
            v-if="comparisonMode && model.submissionId"
            class="absolute top-3 right-3 z-10"
          >
            <button
              @click.prevent="toggleSubmissionSelection(model.submissionId)"
              class="flex items-center justify-center size-8 rounded-lg shadow-lg transition-all"
              :class="selectedForComparison.has(model.submissionId)
                ? 'bg-indigo-600 text-white'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'"
            >
              <UIcon 
                :name="selectedForComparison.has(model.submissionId) ? 'i-heroicons-check' : 'i-heroicons-plus'" 
                class="size-5"
              />
            </button>
          </div>
          
          <SubmissionThumbnail
            :model="model"
            :project-id="project.id"
          />
        </div>
      </div>
      
      <!-- No results from filter -->
      <div v-else-if="hasFilters && project.models && project.models.length > 0" class="flex flex-1 items-center justify-center p-8">
        <div class="w-full max-w-sm text-center">
          <UIcon name="i-heroicons-magnifying-glass" class="size-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No matching submissions</h3>
          <p class="text-gray-600 text-sm mb-4">Try adjusting your search or filter criteria</p>
          <button
            @click="clearFilters"
            class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>
      
      <div v-else-if="!project.models || project.models.length === 0" class="flex flex-1 items-center justify-center p-8">
        <div class="w-full max-w-md text-center">
          <div class="relative mx-auto mb-8">
            <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-3xl animate-pulse"></div>
            <div class="relative flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl shadow-indigo-200/50 border border-indigo-100/50">
              <UIcon name="i-heroicons-cube-transparent" class="size-14 text-indigo-600" />
            </div>
          </div>
          <h2 class="text-3xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            No submissions yet
          </h2>
          <p class="text-gray-600 text-lg font-medium mb-8">
            This project doesn't have any approved submissions yet.
          </p>
          <NuxtLink
            to="/submit"
            class="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 group"
          >
            <span>Submit Implementation</span>
            <UIcon name="i-heroicons-paper-airplane" class="size-5 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
