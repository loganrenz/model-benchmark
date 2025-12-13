<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

const route = useRoute()
const router = useRouter()

// Fetch manifest client-only to avoid SSR issues
const { data: manifest, error } = await useFetch<Manifest>('/data/manifest.json', { 
  server: false 
})

const drawerOpen = ref(false)

interface ActiveModel {
  key: string
  src: string
  label: string
}

const active = ref<ActiveModel | null>(null)
const iframeLoading = ref(false)

function selectModel(model: ActiveModel) {
  iframeLoading.value = true
  active.value = model
  router.replace({ query: { model: model.key } })
  drawerOpen.value = false
}

function handleIframeLoad() {
  iframeLoading.value = false
}

// Initialize active model from query or default to first
watchEffect(() => {
  if (!manifest.value) return
  
  const queryModel = route.query.model as string | undefined
  let found: ActiveModel | null = null

  // Try to find model from query
  if (queryModel) {
    for (const project of manifest.value.projects) {
      for (const model of project.models) {
        const key = `${project.id}/${model.id}`
        if (key === queryModel) {
          found = {
            key,
            src: `/projects/${project.folder}/${model.file}`,
            label: model.label
          }
          break
        }
      }
      if (found) break
    }
  }

  // Default to first model
  if (!found && manifest.value.projects.length > 0) {
    const project = manifest.value.projects[0]
    const model = project.models[0]
    if (project && model) {
      found = {
        key: `${project.id}/${model.id}`,
        src: `/projects/${project.folder}/${model.file}`,
        label: model.label
      }
    }
  }

  if (found && active.value?.key !== found.key) {
    active.value = found
  }
})
</script>

<template>
  <div class="h-screen w-full bg-gray-50">
    <!-- Error State -->
    <div v-if="error" class="flex h-full items-center justify-center p-6">
      <div class="max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-6 w-6 text-red-600" />
        </div>
        <h2 class="text-xl font-bold text-gray-900">Failed to load manifest</h2>
        <p class="mt-3 text-sm text-gray-600">
          Ensure <code class="rounded bg-red-50 px-2 py-1 font-mono text-xs text-red-700">public/data/manifest.json</code> exists and is properly formatted.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!manifest" class="flex h-full items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        <p class="text-sm font-medium text-gray-600">Loading projects...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="flex h-full flex-col">
      <!-- Top Header Bar -->
      <div
        v-if="active"
        class="border-b border-gray-200 bg-white px-4 py-3 shadow-sm"
      >
        <div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
              <UIcon name="i-heroicons-cube" class="h-4 w-4 text-white" />
            </div>
            <div class="min-w-0 flex-1">
              <h1 class="truncate text-sm font-semibold text-gray-900">
                {{ active.label }}
              </h1>
            </div>
          </div>
          <button
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors active:bg-gray-100"
            @click="drawerOpen = true"
            aria-label="Open project drawer"
          >
            <UIcon name="i-heroicons-bars-3" class="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Iframe Viewer -->
      <div class="relative flex-1 pb-[8vh]">
        <!-- Loading Overlay -->
        <div
          v-if="iframeLoading && active"
          class="absolute inset-0 z-10 flex items-center justify-center bg-white"
        >
          <div class="flex flex-col items-center gap-4">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
            <p class="text-sm font-medium text-gray-600">Loading model...</p>
          </div>
        </div>

        <iframe
          v-if="active"
          :key="active.src"
          :src="active.src"
          :title="active.label"
          class="h-full w-full border-0 bg-white"
          @load="handleIframeLoad"
        />
        <div v-else class="flex h-full items-center justify-center p-6">
          <div class="flex flex-col items-center gap-6 text-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 shadow-lg">
              <UIcon name="i-heroicons-cube" class="h-10 w-10 text-white" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900">No Model Selected</h3>
              <p class="text-sm text-gray-600">Choose a 3D model from the projects below</p>
            </div>
            <button
              class="rounded-xl bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all active:bg-blue-600"
              @click="drawerOpen = true"
            >
              Browse Projects
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Drawer -->
      <ProjectExplorerDrawer
        v-model:open="drawerOpen"
        :manifest="manifest"
        :active-key="active?.key"
        @select="selectModel"
      />
    </div>
  </div>
</template>
