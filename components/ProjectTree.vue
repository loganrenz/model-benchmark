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
  <div v-if="manifest.projects.length > 0" class="relative space-y-4">
    <div 
      v-for="(project, projectIndex) in manifest.projects" 
      :key="project.id"
      class="group/card card-3d overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-200/60"
      :style="{ animationDelay: `${projectIndex * 50}ms` }"
    >
      <!-- Gradient Border Effect on Hover -->
      <div class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: xor; padding: 1px;"></div>
      
      <!-- Project Header -->
      <button
        class="group relative flex w-full items-center gap-4 px-5 py-4 text-left transition-all duration-300"
        @click="toggleProject(project.id)"
      >
        <!-- Hover Background -->
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-purple-50/60 to-pink-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        
        <!-- Icon Container -->
        <div class="relative">
          <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-40 blur transition-all duration-300 group-hover:opacity-60 group-hover:blur-md"></div>
          <div class="relative rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
            <UIcon 
              :name="expandedProjects.has(project.id) ? 'i-heroicons-folder-open' : 'i-heroicons-folder'" 
              class="size-5 text-white transition-transform duration-300"
            />
          </div>
        </div>
        
        <!-- Project Info -->
        <div class="relative flex-1">
          <span class="block font-bold text-gray-900 transition-colors group-hover:text-indigo-900">{{ project.label }}</span>
          <span class="text-xs text-gray-500">{{ project.models.length }} implementation{{ project.models.length !== 1 ? 's' : '' }}</span>
        </div>
        
        <!-- Count Badge & Chevron -->
        <div class="relative flex items-center gap-3">
          <span class="rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">
            {{ project.models.length }}
          </span>
          <div class="rounded-full bg-gray-100 p-1.5 transition-all duration-300 group-hover:bg-indigo-100 group-hover:shadow">
            <UIcon 
              :name="expandedProjects.has(project.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              class="size-4 text-gray-500 transition-all duration-300 group-hover:text-indigo-600"
            />
          </div>
        </div>
      </button>

      <!-- Models List -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="expandedProjects.has(project.id)"
          class="border-t border-gray-100/80 bg-gradient-to-b from-gray-50/50 to-white px-3 pb-3 pt-2"
        >
          <div class="space-y-1.5">
            <button
              v-for="(model, modelIndex) in project.models"
              :key="model.id"
              class="group/item relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300"
              :class="isActive(project.id, model.id) 
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25' 
                : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'"
              :style="{ transitionDelay: `${modelIndex * 30}ms` }"
              @click="selectModel(project, model)"
            >
              <!-- Shine Effect for Active -->
              <div 
                v-if="isActive(project.id, model.id)"
                class="absolute inset-0 overflow-hidden rounded-xl"
              >
                <div class="shimmer absolute inset-0"></div>
              </div>
              
              <!-- Icon -->
              <div 
                class="relative rounded-lg p-2 transition-all duration-300"
                :class="isActive(project.id, model.id) 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover/item:bg-indigo-100 group-hover/item:shadow-sm'"
              >
                <UIcon 
                  name="i-heroicons-cube" 
                  class="size-4 transition-all duration-300"
                  :class="isActive(project.id, model.id) 
                    ? 'text-white' 
                    : 'text-gray-500 group-hover/item:text-indigo-600 group-hover/item:scale-110'"
                />
              </div>
              
              <!-- Label -->
              <span 
                class="relative flex-1 text-sm font-medium transition-all duration-300"
                :class="isActive(project.id, model.id) 
                  ? 'font-semibold text-white' 
                  : 'text-gray-700 group-hover/item:text-indigo-900'"
              >
                {{ model.label }}
              </span>
              
              <!-- Active Indicator -->
              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="opacity-0 scale-0"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-200"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-0"
              >
                <div 
                  v-if="isActive(project.id, model.id)"
                  class="relative flex items-center gap-2"
                >
                  <span class="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90">
                    Active
                  </span>
                  <UIcon 
                    name="i-heroicons-check-circle-solid" 
                    class="size-5 text-white drop-shadow-sm"
                  />
                </div>
              </Transition>
              
              <!-- Hover Arrow -->
              <UIcon 
                v-if="!isActive(project.id, model.id)"
                name="i-heroicons-arrow-right" 
                class="size-4 text-gray-300 opacity-0 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:text-indigo-500 group-hover/item:opacity-100"
              />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
  
  <!-- Empty State -->
  <div v-else class="flex h-64 items-center justify-center">
    <div class="text-center">
      <div class="float relative mb-6 inline-block">
        <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 opacity-30 blur-xl"></div>
        <div class="relative rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-8">
          <UIcon name="i-heroicons-folder-open" class="size-12 text-gray-400" />
        </div>
      </div>
      <p class="text-base font-semibold text-gray-600">No projects available</p>
      <p class="mt-1 text-sm text-gray-400">Add projects to get started</p>
    </div>
  </div>
</template>
