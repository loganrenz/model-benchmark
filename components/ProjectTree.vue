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
  <div v-if="manifest.projects.length > 0" class="space-y-4">
    <div 
      v-for="project in manifest.projects" 
      :key="project.id"
      class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <!-- Project Header -->
      <button
        class="group flex w-full items-center gap-3 bg-gradient-to-r from-slate-50 to-white px-4 py-3 text-left transition-colors hover:from-blue-50 hover:to-indigo-50"
        @click="toggleProject(project.id)"
      >
        <div class="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-sm transition-transform group-hover:scale-110">
          <UIcon name="i-heroicons-folder-open" class="size-4 text-white" />
        </div>
        <span class="flex-1 font-bold text-gray-900">{{ project.label }}</span>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
            {{ project.models.length }}
          </span>
          <div class="rounded-full bg-gray-100 p-1 transition-all group-hover:bg-blue-100">
            <UIcon 
              :name="expandedProjects.has(project.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
              class="size-4 text-gray-600 transition-all group-hover:text-blue-600"
            />
          </div>
        </div>
      </button>

      <!-- Models List -->
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-screen"
        leave-active-class="transition-all duration-300"
        leave-from-class="opacity-100 max-h-screen"
        leave-to-class="opacity-0 max-h-0"
      >
        <div 
          v-if="expandedProjects.has(project.id)"
          class="border-t border-gray-100 bg-white p-2"
        >
          <div class="space-y-1">
            <button
              v-for="model in project.models"
              :key="model.id"
              class="group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all"
              :class="isActive(project.id, model.id) 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md scale-[1.02]' 
                : 'text-gray-700 hover:bg-gray-50 hover:pl-5'"
              @click="selectModel(project, model)"
            >
              <div 
                class="rounded-md p-1.5 transition-colors"
                :class="isActive(project.id, model.id) ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-blue-100'"
              >
                <UIcon 
                  name="i-heroicons-cube" 
                  class="size-4 transition-colors"
                  :class="isActive(project.id, model.id) ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'"
                />
              </div>
              <span 
                class="flex-1 text-sm font-medium transition-all"
                :class="isActive(project.id, model.id) ? 'font-bold' : ''"
              >
                {{ model.label }}
              </span>
              <UIcon 
                v-if="isActive(project.id, model.id)"
                name="i-heroicons-check-circle-solid" 
                class="size-5 text-white"
              />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
  <div v-else class="flex h-64 items-center justify-center">
    <div class="text-center">
      <div class="mb-3 inline-flex items-center justify-center rounded-full bg-gray-100 p-6">
        <UIcon name="i-heroicons-folder-open" class="size-10 text-gray-400" />
      </div>
      <p class="text-sm font-medium text-gray-500">No projects available</p>
    </div>
  </div>
</template>
