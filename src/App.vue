<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ModelPreview from './components/ModelPreview.vue'
import ProjectExplorerDrawer from './components/ProjectExplorerDrawer.vue'
import type { ManifestModel, ManifestProject } from './lib/manifest'
import { loadManifest } from './lib/manifest'
import type { TreeItem } from '@nuxt/ui/dist/runtime/components/Tree.vue'

const projects = ref<ManifestProject[]>([])
const drawerOpen = ref(false)
const expandedKeys = ref<string[]>(['root'])
const selectedTreeItem = ref<TreeItem | null>(null)
const selectedProjectId = ref<string | null>(null)
const selectedModelId = ref<string | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)

const selectedProject = computed(() =>
  projects.value.find((project) => project.id === selectedProjectId.value) || null
)

const selectedModel = computed<ManifestModel | null>(() => {
  if (!selectedProject.value) return null
  return selectedProject.value.models.find((model) => model.id === selectedModelId.value) || null
})

const treeItems = computed<TreeItem[]>(() => {
  return [
    {
      key: 'root',
      label: 'projects/',
      defaultExpanded: true,
      icon: 'i-heroicons-home-modern',
      ui: {
        link: 'font-semibold text-slate-800',
        linkLabel: 'text-sm'
      },
      children: projects.value.map((project) => ({
        key: `project-${project.id}`,
        label: project.title || project.id,
        icon: 'i-heroicons-folder',
        defaultExpanded: project.id === selectedProjectId.value,
        ui: {
          link: 'text-slate-800 font-semibold',
          item: 'py-1'
        },
        children: project.models.map((model) => ({
          key: `model-${project.id}-${model.id}`,
          label: model.label || model.id,
          icon: 'i-heroicons-document-text',
          projectId: project.id,
          modelId: model.id,
          path: model.path,
          ui: {
            link: 'text-sm text-slate-800',
            linkLabel: 'text-[15px] font-medium'
          }
        }))
      }))
    }
  ]
})

const findModelItem = (projectId: string, modelId: string): TreeItem | null => {
  const root = treeItems.value[0]
  const projectNode = root.children?.find((child) => child.key === `project-${projectId}`)
  return projectNode?.children?.find((child) => child.key === `model-${projectId}-${modelId}`) || null
}

const ensureExpansionForSelection = () => {
  if (!selectedProjectId.value) return
  const projectKey = `project-${selectedProjectId.value}`
  if (!expandedKeys.value.includes(projectKey)) {
    expandedKeys.value = [...expandedKeys.value, projectKey]
  }
  if (!expandedKeys.value.includes('root')) {
    expandedKeys.value = ['root', ...expandedKeys.value]
  }
}

const handleSelect = (item: TreeItem) => {
  if ((item as any).children?.length) {
    return
  }
  const projectId = (item as any).projectId as string
  const modelId = (item as any).modelId as string
  selectedProjectId.value = projectId
  selectedModelId.value = modelId
  selectedTreeItem.value = item
  drawerOpen.value = false
  ensureExpansionForSelection()
}

const handleExpandedChange = (keys: string[]) => {
  expandedKeys.value = keys
}

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}

const closeDrawer = () => {
  drawerOpen.value = false
}

const initializeSelection = () => {
  const firstProject = projects.value[0]
  const firstModel = firstProject?.models[0]
  if (firstProject && firstModel) {
    selectedProjectId.value = firstProject.id
    selectedModelId.value = firstModel.id
    expandedKeys.value = ['root', `project-${firstProject.id}`]
    const item = findModelItem(firstProject.id, firstModel.id)
    if (item) {
      selectedTreeItem.value = item
    }
  }
}

onMounted(async () => {
  try {
    const manifest = await loadManifest()
    projects.value = manifest.projects || []
    initializeSelection()
  } catch (error: any) {
    loadError.value = error?.message || 'Unable to load manifest'
  } finally {
    loading.value = false
  }
})

watch(drawerOpen, (open) => {
  const target = document.body
  if (open) {
    target.classList.add('no-scroll')
  } else {
    target.classList.remove('no-scroll')
  }
})
</script>

<template>
  <div class="app-shell">
    <header class="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <UIcon name="i-heroicons-cube-transparent" class="h-4 w-4 text-slate-500" />
          </span>
          <div class="leading-tight">
            <p class="text-[11px] uppercase tracking-[0.18em] text-slate-500">Model Benchmark</p>
            <p class="text-base font-semibold text-slate-900">Project Viewer</p>
          </div>
        </div>
        <div class="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
          <UIcon name="i-heroicons-device-phone-mobile" class="h-4 w-4" />
          <span>Mobile-first layout</span>
        </div>
      </div>
    </header>

    <main class="flex-1 bg-slate-50">
      <div class="mx-auto flex h-[calc(100dvh-56px)] max-w-5xl flex-col gap-4 px-4 py-4 lg:h-[calc(100dvh-64px)]">
        <ModelPreview :model="selectedModel" :loading="loading" :error="loadError" />
      </div>
    </main>

    <ProjectExplorerDrawer
      :open="drawerOpen"
      :items="treeItems"
      :selected="selectedTreeItem"
      :expanded="expandedKeys"
      :loading="loading"
      @toggle="toggleDrawer"
      @close="closeDrawer"
      @select="handleSelect"
      @update:expanded="handleExpandedChange"
      @update:selected="(item) => handleSelect(item)"
    />
  </div>
</template>
