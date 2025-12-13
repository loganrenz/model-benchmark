<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

const props = defineProps<{
  manifest: Manifest
  activeKey?: string
}>()

const emit = defineEmits<{
  select: [{ key: string; src: string; label: string }]
}>()

const expandedProjects = ref<Set<string>>(new Set())

// Auto-expand all projects by default
onMounted(() => {
  props.manifest.projects.forEach(project => {
    expandedProjects.value.add(project.id)
  })
})

function toggleProject(projectId: string) {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId)
  } else {
    expandedProjects.value.add(projectId)
  }
}

function selectModel(project: any, model: any) {
  const key = `${project.id}/${model.id}`
  const src = `/projects/${project.folder}/${model.file}`
  emit('select', { key, src, label: model.label })
}

function isActive(projectId: string, modelId: string): boolean {
  return props.activeKey === `${projectId}/${modelId}`
}
</script>

<template>
  <div v-if="manifest.projects.length > 0" class="space-y-2">
    <div 
      v-for="project in manifest.projects" 
      :key="project.id"
      class="space-y-1"
    >
      <!-- Project Header -->
      <button
        class="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 active:bg-gray-100"
        @click="toggleProject(project.id)"
      >
        <UIcon 
          :name="expandedProjects.has(project.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
          class="h-4 w-4 shrink-0 text-gray-500 transition-transform"
        />
        <UIcon name="i-heroicons-folder" class="h-4 w-4 shrink-0 text-gray-500" />
        <span>{{ project.label }}</span>
      </button>

      <!-- Models List -->
      <div 
        v-if="expandedProjects.has(project.id)"
        class="ml-6 space-y-1"
      >
        <button
          v-for="model in project.models"
          :key="model.id"
          class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors"
          :class="isActive(project.id, model.id) 
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-900 font-semibold ring-2 ring-blue-200/50 shadow-sm' 
            : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'"
          @click="selectModel(project, model)"
        >
          <UIcon name="i-heroicons-cube" class="h-4 w-4 shrink-0" :class="isActive(project.id, model.id) ? 'text-blue-600' : 'text-gray-400'" />
          <span>{{ model.label }}</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center p-8">
    <p class="text-sm text-gray-500">No projects available</p>
  </div>
</template>
