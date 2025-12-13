<script setup lang="ts">
import type { Project } from '~/types/prompt'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const submissionCount = computed(() => props.project.models?.length || 0)

const projectUrl = computed(() => `/projects/${props.project.id}`)

const firstModelThumbnail = computed(() => {
  if (props.project.models && props.project.models.length > 0) {
    return props.project.models[0].thumbnail
  }
  return null
})
</script>

<template>
  <NuxtLink
    :to="projectUrl"
    class="group relative w-full rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden active:scale-[0.98] block"
  >
    <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-indigo-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/20 transition-all duration-500"></div>
    
    <div class="relative p-6 lg:p-8">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-xl lg:text-2xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
            {{ project.label }}
          </h3>
        </div>
        
        <div class="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-4">
          <span class="text-sm font-bold text-white">
            {{ submissionCount }}
          </span>
        </div>
      </div>

      <div class="relative aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border border-gray-200/50 group-hover:border-indigo-200 transition-colors duration-300">
        <img
          v-if="submissionCount > 0 && firstModelThumbnail"
          :src="firstModelThumbnail"
          :alt="project.models![0].label"
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center">
            <UIcon name="i-heroicons-cube-transparent" class="size-12 text-gray-400 mx-auto mb-2" />
            <p class="text-xs font-medium text-gray-500">No submissions yet</p>
          </div>
        </div>
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-600 group-hover:text-indigo-600 transition-colors duration-300">
          {{ submissionCount }} {{ submissionCount === 1 ? 'submission' : 'submissions' }}
        </span>
        <UIcon 
          name="i-heroicons-arrow-right" 
          class="size-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300"
        />
      </div>
    </div>
  </NuxtLink>
</template>

