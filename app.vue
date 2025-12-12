<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'

type ModelFile = {
  id: string
  name: string
  path: string
  description?: string
}

type ProjectEntry = {
  id: string
  name: string
  models: ModelFile[]
}

type Manifest = {
  projects: ProjectEntry[]
}

const drawerOpen = ref(false)
const selectedModel = ref<ModelFile | null>(null)

const { data: manifest } = await useAsyncData<Manifest>('manifest', () =>
  $fetch('/data/manifest.json')
)

const treeItems = computed<TreeItem[]>(() => {
  if (!manifest.value) return []

  return [
    {
      label: 'projects/',
      icon: 'i-lucide-folders',
      defaultExpanded: true,
      children: manifest.value.projects.map((project) => ({
        label: `${project.name}/`,
        icon: 'i-lucide-folder',
        defaultExpanded: true,
        children: project.models.map((model) => ({
          label: model.name,
          icon: 'i-lucide-file-text',
          meta: model
        }))
      }))
    }
  ]
})

const currentPath = computed(() => selectedModel.value?.path ?? '')

const treeHeader = computed(() =>
  selectedModel.value ? 'Selected model' : 'Choose a model file to preview'
)

function onItemClick(item: TreeItem) {
  const model = (item as TreeItem & { meta?: ModelFile }).meta
  if (model) {
    selectedModel.value = model
    drawerOpen.value = false
  }
}

if (import.meta.client) {
  watch(
    drawerOpen,
    (open) => {
      document.body.style.overflow = open ? 'hidden' : ''
    },
    { immediate: true }
  )
}
</script>

<template>
  <div>
    <main>
      <section class="hero">
        <div class="selection-pill">
          <UIcon name="i-lucide-smartphone" />
          iPhone-first project viewer
        </div>
        <p class="hero-title">Browse project artifacts and preview model outputs</p>
        <p class="hero-subtitle">
          Use the Project Explorer drawer to open a model file. The explorer is collapsed by default to
          keep the content focused for mobile screens.
        </p>
      </section>

      <section class="selection-card">
        <header class="flex items-center gap-2 mb-3">
          <UIcon name="i-lucide-sparkles" class="text-primary" />
          <span class="font-semibold text-slate-800">{{ treeHeader }}</span>
        </header>
        <div v-if="currentPath" class="space-y-3">
          <div class="flex flex-col gap-1">
            <p class="text-sm uppercase text-slate-500 tracking-wide">Model file</p>
            <p class="font-semibold text-slate-800">{{ selectedModel?.name }}</p>
            <p class="text-sm text-slate-600">{{ selectedModel?.description }}</p>
          </div>
          <iframe
            :src="currentPath"
            title="Model output preview"
            class="model-frame"
            allow="accelerometer; ambient-light-sensor; autoplay; camera; microphone"
          />
        </div>
        <div v-else class="text-slate-600">
          <p class="mb-2">No model selected yet.</p>
          <p class="text-sm">Open the Project Explorer drawer below and tap a model file to load its output.</p>
        </div>
      </section>
    </main>

    <div class="drawer-shell">
      <div class="drawer" :class="{ open: drawerOpen }">
        <button class="drawer-handle" type="button" @click="drawerOpen = !drawerOpen">
          <span class="handle-bar" />
          <span>{{ drawerOpen ? 'Close Project Explorer' : 'Open Project Explorer' }}</span>
          <UIcon :name="drawerOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" />
        </button>
        <div class="drawer-content">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="font-semibold text-slate-800">Project Explorer</p>
              <p class="text-xs text-slate-500">Rooted at projects/ — tap a model file to preview.</p>
            </div>
            <div class="text-xs text-slate-500">Pulls from manifest.json</div>
          </div>
          <div class="tree-card">
            <div class="tree-scroll">
              <UTree :items="treeItems" :get-key="(item) => (item as any).meta?.id ?? item.label">
                <template #item="{ item }">
                  <div
                    class="tree-item-row"
                    :class="{ 'tree-leaf': !(item.children && item.children.length) }"
                    @click="onItemClick(item)"
                  >
                    <UIcon v-if="item.icon" :name="item.icon" />
                    <span>{{ item.label }}</span>
                  </div>
                </template>
              </UTree>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
