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
  <div class="h-screen w-full bg-white">
    <!-- Error State -->
    <div v-if="error" class="flex h-full items-center justify-center p-6">
      <div class="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 class="text-lg font-semibold text-red-900">Failed to load manifest</h2>
        <p class="mt-2 text-sm text-red-700">
          Ensure <code class="rounded bg-red-100 px-1.5 py-0.5">public/data/manifest.json</code> exists.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!manifest" class="flex h-full items-center justify-center">
      <p class="text-gray-600">Loading...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="flex h-full flex-col">
      <!-- Iframe Viewer -->
      <div class="flex-1 pb-20">
        <iframe
          v-if="active"
          :key="active.src"
          :src="active.src"
          :title="active.label"
          class="size-full border-0"
        />
        <div v-else class="flex h-full items-center justify-center">
          <button
            class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            @click="drawerOpen = true"
          >
            Select a Project
          </button>
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
