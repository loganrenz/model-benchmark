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
  <div class="h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100/50">
    <!-- Error State -->
    <div v-if="error" class="flex h-full items-center justify-center p-6 safe-area-inset">
      <div class="max-w-md rounded-2xl border border-red-200/80 bg-white p-8 shadow-xl backdrop-blur-sm">
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-red-50 shadow-sm">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-7 w-7 text-red-600" />
        </div>
        <h2 class="text-xl font-bold tracking-tight text-gray-900">Failed to load manifest</h2>
        <p class="mt-3 text-sm leading-relaxed text-gray-600">
          Ensure <code class="rounded-lg bg-red-50 px-2.5 py-1 font-mono text-xs text-red-700 ring-1 ring-red-200">public/data/manifest.json</code> exists and is properly formatted.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!manifest" class="flex h-full items-center justify-center">
      <div class="flex flex-col items-center gap-5">
        <div class="relative">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
          <div class="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-blue-400 opacity-20" />
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-gray-900">Loading projects</p>
          <p class="mt-1 text-xs text-gray-500">Please wait...</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="flex h-full flex-col">
      <!-- Top Header Bar -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="active"
          class="safe-area-inset border-b border-gray-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl pt-safe"
        >
          <div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md ring-2 ring-blue-100">
                <UIcon name="i-heroicons-cube" class="h-4 w-4 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="truncate text-sm font-semibold leading-tight text-gray-900">
                  {{ active.label }}
                </h1>
              </div>
            </div>
            <button
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow active:bg-gray-100 active:scale-95"
              @click="drawerOpen = true"
              aria-label="Open project drawer"
            >
              <UIcon name="i-heroicons-bars-3" class="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- Iframe Viewer -->
      <div class="relative flex-1 pb-[8vh] safe-area-inset">
        <!-- Loading Overlay -->
        <Transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="iframeLoading && active"
            class="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-50/95 to-gray-100/95 backdrop-blur-sm"
          >
            <div class="flex flex-col items-center gap-5">
              <div class="relative">
                <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 shadow-sm" />
                <div class="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-blue-400 opacity-20" />
              </div>
              <div class="text-center">
                <p class="text-sm font-semibold text-gray-900">Loading model</p>
                <p class="mt-1 text-xs text-gray-500">{{ active.label }}</p>
              </div>
            </div>
          </div>
        </Transition>

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
            <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <UIcon name="i-heroicons-cube" class="h-10 w-10 text-white" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900">No Model Selected</h3>
              <p class="text-sm text-gray-600">Choose a 3D model from the projects below</p>
            </div>
            <button
              class="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
              @click="drawerOpen = true"
            >
              <span class="relative z-10 flex items-center gap-2">
                Browse Projects
                <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
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
