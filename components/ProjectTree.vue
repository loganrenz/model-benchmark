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
  <div v-if="manifest.projects.length > 0" class="space-y-3">
    <div 
      v-for="project in manifest.projects" 
      :key="project.id"
      class="overflow-hidden rounded-xl border border-neutral-200 bg-white"
    >
      <!-- Project Header -->
      <button
        class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
        @click="toggleProject(project.id)"
      >
        <div class="flex size-9 items-center justify-center rounded-lg bg-neutral-100">
          <UIcon 
            :name="expandedProjects.has(project.id) ? 'i-heroicons-folder-open' : 'i-heroicons-folder'" 
            class="size-5 text-neutral-600"
          />
        </div>
        
        <div class="flex-1">
          <span class="font-medium text-neutral-900">{{ project.label }}</span>
        </div>
        
        <span class="mr-2 text-xs text-neutral-400">
          {{ project.models.length }}
        </span>
        
        <UIcon 
          :name="expandedProjects.has(project.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="size-4 text-neutral-400"
        />
      </button>

      <!-- Models List -->
      <div v-if="expandedProjects.has(project.id)" class="border-t border-neutral-100 bg-neutral-50/50">
        <div class="p-2">
          <button
            v-for="model in project.models"
            :key="model.id"
            class="press flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
            :class="isActive(project.id, model.id) 
              ? 'bg-neutral-900 text-white' 
              : 'text-neutral-700 hover:bg-white'"
            @click="selectModel(project, model)"
          >
            <div 
              class="flex size-8 items-center justify-center rounded-md"
              :class="isActive(project.id, model.id) 
                ? 'bg-white/10' 
                : 'bg-neutral-100'"
            >
              <UIcon 
                name="i-heroicons-cube" 
                class="size-4"
                :class="isActive(project.id, model.id) 
                  ? 'text-white' 
                  : 'text-neutral-500'"
              />
            </div>
            
            <span class="flex-1 text-sm font-medium">
              {{ model.label }}
            </span>
            
            <UIcon 
              v-if="isActive(project.id, model.id)"
              name="i-heroicons-check" 
              class="size-4 text-white"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Empty State -->
  <div v-else class="flex h-48 items-center justify-center">
    <div class="text-center">
      <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-neutral-100">
        <UIcon name="i-heroicons-folder-open" class="size-7 text-neutral-400" />
      </div>
      <p class="text-sm text-neutral-500">No projects</p>
    </div>
  </div>
</template>
