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
  <div class="gradient-mesh h-screen w-full overflow-hidden">
    <!-- Background Ambient Effects -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl"></div>
      <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl"></div>
      <div class="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="relative flex h-full items-center justify-center p-6">
      <div class="glass-strong card-3d max-w-md rounded-3xl p-8 shadow-xl">
        <div class="mb-4 flex items-center justify-center">
          <div class="rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-4 shadow-lg">
            <UIcon name="i-heroicons-exclamation-triangle" class="size-8 text-white" />
          </div>
        </div>
        <h2 class="text-center text-2xl font-bold text-gray-900">Failed to load manifest</h2>
        <p class="mt-4 text-center text-sm leading-relaxed text-gray-600">
          Ensure <code class="mx-1 rounded-lg bg-red-50 px-2 py-1 font-mono text-xs text-red-700">public/data/manifest.json</code> exists and is valid.
        </p>
        <button 
          class="btn-press mt-6 w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 font-semibold text-white shadow-lg"
          @click="$router.go(0)"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!manifest" class="relative flex h-full items-center justify-center">
      <div class="text-center">
        <div class="float mb-6 inline-block">
          <div class="spinner-premium"></div>
        </div>
        <p class="text-lg font-semibold tracking-wide text-gray-700">Loading projects</p>
        <p class="mt-1 text-sm text-gray-500">Preparing your showcase...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="relative flex h-full flex-col">
      <!-- Premium Header -->
      <header class="safe-top glass-strong relative z-30 border-b border-white/30 shadow-sm">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <!-- Logo & Title -->
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="group relative">
              <!-- Glow effect behind logo -->
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50 blur-lg transition-opacity group-hover:opacity-75"></div>
              <div class="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 shadow-lg transition-transform duration-300 group-hover:scale-105 sm:p-3">
                <UIcon name="i-heroicons-sparkles" class="size-5 text-white sm:size-6" />
              </div>
            </div>
            <div>
              <h1 class="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                <span class="gradient-text">AI Showcase</span>
              </h1>
              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
                mode="out-in"
              >
                <p v-if="active" :key="active.key" class="text-xs font-medium text-gray-500 sm:text-sm">
                  {{ active.label }}
                </p>
              </Transition>
            </div>
          </div>

          <!-- Browse Button -->
          <button
            class="btn-press group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:px-5 sm:py-3"
            @click="drawerOpen = true"
          >
            <!-- Button Shine Effect -->
            <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
            <UIcon name="i-heroicons-squares-2x2" class="relative size-4 sm:size-5" />
            <span class="relative hidden sm:inline">Browse Projects</span>
            <span class="relative sm:hidden">Browse</span>
          </button>
        </div>
      </header>

      <!-- Iframe Viewer -->
      <div class="relative flex-1 overflow-hidden">
        <!-- Subtle inner shadow for depth -->
        <div class="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_2px_20px_rgba(0,0,0,0.06)]"></div>
        
        <iframe
          v-if="active"
          :key="active.src"
          :src="active.src"
          :title="active.label"
          class="size-full border-0 bg-white"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        
        <!-- Empty State -->
        <div v-else class="flex h-full items-center justify-center p-6">
          <div class="text-center">
            <!-- Floating Icon Container -->
            <div class="float relative mb-8 inline-block">
              <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-30 blur-2xl"></div>
              <div class="relative rounded-3xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-10 shadow-xl">
                <UIcon name="i-heroicons-cube-transparent" class="size-20 text-indigo-600 sm:size-24" />
              </div>
            </div>
            
            <h2 class="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome to <span class="gradient-text">AI Showcase</span>
            </h2>
            <p class="mb-8 max-w-md text-gray-600">
              Explore and compare different AI implementations side-by-side
            </p>
            
            <button
              class="btn-press group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-xl"
              @click="drawerOpen = true"
            >
              <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
              <UIcon name="i-heroicons-rocket-launch" class="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span class="relative">Get Started</span>
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
