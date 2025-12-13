<script setup lang="ts">
import type { Model } from '~/types/prompt'

interface Props {
  model: Model
  projectId: string
}

const props = defineProps<Props>()

const isLoading = ref(true)
const hasError = ref(false)

const submissionUrl = computed(() => {
  if (props.model.submissionId) {
    return `/projects/${props.projectId}/${props.model.submissionId}`
  }
  return null
})

function handleImageLoad() {
  isLoading.value = false
}

function handleImageError() {
  isLoading.value = false
  hasError.value = true
}
</script>

<template>
  <NuxtLink v-if="submissionUrl" :to="submissionUrl"
    class="group relative w-full rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden active:scale-[0.98] aspect-video block">
    <div v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 pointer-events-none">
      <div class="text-center">
        <div class="mx-auto mb-2 size-8 animate-spin rounded-full border-[3px] border-gray-300 border-t-indigo-600">
        </div>
        <p class="text-xs font-medium text-gray-500">Loading...</p>
      </div>
    </div>

    <div v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 pointer-events-none">
      <div class="text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="size-8 text-gray-400 mx-auto mb-2" />
        <p class="text-xs font-medium text-gray-500">Failed to load</p>
      </div>
    </div>

    <img v-if="!hasError && model.thumbnail" :src="model.thumbnail" :alt="model.label"
      class="absolute inset-0 w-full h-full object-cover pointer-events-none" @load="handleImageLoad"
      @error="handleImageError" loading="lazy" />
    <div v-else-if="!hasError && !model.thumbnail"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 pointer-events-none">
      <div class="text-center">
        <UIcon name="i-heroicons-photo" class="size-8 text-gray-400 mx-auto mb-2" />
        <p class="text-xs font-medium text-gray-500">No thumbnail</p>
      </div>
    </div>

    <div
      class="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20 pointer-events-none">
      <p class="text-xs font-semibold text-white">
        {{ model.label }}
      </p>
    </div>
  </NuxtLink>
  <div v-else
    class="group relative w-full rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-lg shadow-black/5 opacity-50 cursor-not-allowed aspect-video block">
    <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div class="text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="size-8 text-gray-400 mx-auto mb-2" />
        <p class="text-xs font-medium text-gray-500">No submission linked</p>
      </div>
    </div>
  </div>
</template>
