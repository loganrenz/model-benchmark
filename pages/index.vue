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

function selectModel(model: ActiveModel) {
  active.value = model
  router.replace({ query: { model: model.key } })
  drawerOpen.value = false
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
  <div class="h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Error State -->
    <div v-if="error" class="flex h-full items-center justify-center p-6">
      <div class="max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
        <div class="mb-3 flex items-center justify-center">
          <div class="rounded-full bg-red-100 p-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="size-6 text-red-600" />
          </div>
        </div>
        <h2 class="text-center text-xl font-bold text-gray-900">Failed to load manifest</h2>
        <p class="mt-3 text-center text-sm text-gray-600">
          Ensure <code class="rounded bg-red-50 px-2 py-1 text-red-700">public/data/manifest.json</code> exists and is valid.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!manifest" class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="mb-4 inline-block animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 size-12"></div>
        <p class="text-lg font-medium text-gray-700">Loading projects...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="flex h-full flex-col">
      <!-- Top Header Bar -->
      <header class="relative z-30 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
              <UIcon name="i-heroicons-cube" class="size-5 text-white" />
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">AI Agent Showcase</h1>
              <p v-if="active" class="text-xs text-gray-500">{{ active.label }}</p>
            </div>
          </div>
          <button
            class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            @click="drawerOpen = true"
          >
            <UIcon name="i-heroicons-squares-2x2" class="size-4" />
            <span>Browse</span>
          </button>
        </div>
      </header>

      <!-- Iframe Viewer -->
      <div class="flex-1 overflow-hidden">
        <iframe
          v-if="active"
          :key="active.src"
          :src="active.src"
          :title="active.label"
          class="size-full border-0"
        />
        <div v-else class="flex h-full items-center justify-center p-6">
          <div class="text-center">
            <div class="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-8">
              <UIcon name="i-heroicons-cube-transparent" class="size-20 text-blue-600" />
            </div>
            <h2 class="mb-2 text-2xl font-bold text-gray-900">Welcome to AI Agent Showcase</h2>
            <p class="mb-6 text-gray-600">Select a project to compare different AI implementations</p>
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
              @click="drawerOpen = true"
            >
              <UIcon name="i-heroicons-rocket-launch" class="size-5" />
              Get Started
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
