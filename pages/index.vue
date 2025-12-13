<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

const route = useRoute()
const router = useRouter()

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

watchEffect(() => {
  if (!manifest.value) return
  
  const queryModel = route.query.model as string | undefined
  let found: ActiveModel | null = null

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
  <div class="flex h-[100dvh] w-full flex-col bg-neutral-50">
    <!-- Error State -->
    <div v-if="error" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm text-center">
        <div class="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-50">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-7 text-red-500" />
        </div>
        <h1 class="text-xl font-semibold text-neutral-900">Failed to load</h1>
        <p class="mt-2 text-sm text-neutral-500">
          Could not load manifest.json
        </p>
        <button 
          class="press mt-6 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white"
          @click="$router.go(0)"
        >
          Try again
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!manifest" class="flex flex-1 items-center justify-center">
      <div class="text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-sm text-neutral-400">Loading...</p>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Header -->
      <header class="safe-top relative z-30 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl">
        <div class="flex items-center justify-between px-5 py-4">
          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-semibold tracking-tight text-neutral-900">
              Showcase
            </h1>
            <p v-if="active" class="truncate text-sm text-neutral-500">
              {{ active.label }}
            </p>
          </div>
          
          <button
            class="press ml-4 flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            @click="drawerOpen = true"
          >
            <UIcon name="i-heroicons-squares-2x2" class="size-4" />
            <span class="hidden sm:inline">Browse</span>
          </button>
        </div>
      </header>

      <!-- Viewer -->
      <main class="relative flex-1 overflow-hidden bg-white">
        <iframe
          v-if="active"
          :key="active.src"
          :src="active.src"
          :title="active.label"
          class="size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        
        <!-- Empty State -->
        <div v-else class="flex h-full items-center justify-center p-8">
          <div class="max-w-md text-center">
            <div class="mx-auto mb-8 flex size-20 items-center justify-center rounded-2xl bg-neutral-100">
              <UIcon name="i-heroicons-cube-transparent" class="size-10 text-neutral-400" />
            </div>
            <h2 class="text-2xl font-semibold tracking-tight text-neutral-900">
              Welcome
            </h2>
            <p class="mt-3 text-neutral-500">
              Compare different AI implementations side by side
            </p>
            <button
              class="press mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white"
              @click="drawerOpen = true"
            >
              <span>Browse projects</span>
              <UIcon name="i-heroicons-arrow-right" class="size-4" />
            </button>
          </div>
        </div>
      </main>

      <!-- Drawer -->
      <ProjectExplorerDrawer
        v-model:open="drawerOpen"
        :manifest="manifest"
        :active-key="active?.key"
        @select="selectModel"
      />
    </template>
  </div>
</template>
