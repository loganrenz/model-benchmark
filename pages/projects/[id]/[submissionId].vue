<script setup lang="ts">
import type { Submission } from '~/types/submission'
import type { Project } from '~/types/prompt'

const route = useRoute()
const projectId = route.params.id as string
const submissionId = route.params.submissionId as string

// Fetch project info with models to find the submission
const { data: project } = await useFetch<Project>(
  `/api/projects/${projectId}?includeModels=true`
)

// Fetch submission info
const { data: submission, error: submissionError } = await useFetch<Submission>(
  `/api/submissions/${submissionId}`
)

const backUrl = computed(() => `/projects/${projectId}`)

const submissionSrc = computed(() => {
  if (submission.value && submission.value.status === 'approved') {
    return `/api/submissions/${submissionId}/content`
  }
  return null
})

const submissionHtmlContent = computed(() => {
  if (submission.value && submission.value.htmlContent) {
    return submission.value.htmlContent
  }
  return null
})

const submissionLabel = computed(() => {
  if (submission.value) {
    return submission.value.label
  }
  return 'Submission'
})

const hasError = computed(() => {
  return !!submissionError.value
})

function openInNewTab() {
  if (submissionSrc.value) {
    window.open(submissionSrc.value, '_blank')
  } else if (submissionHtmlContent.value) {
    const blob = new Blob([submissionHtmlContent.value], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // Clean up the URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
}
</script>

<template>
  <div class="min-h-screen h-dvh w-full bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-sm flex-shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <NuxtLink
              :to="backUrl"
              class="flex size-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 flex-shrink-0"
            >
              <UIcon name="i-heroicons-arrow-left" class="size-5 text-gray-600" />
            </NuxtLink>
            
            <div class="flex-1 min-w-0">
              <h1 v-if="project" class="text-lg lg:text-xl font-bold text-gray-900 truncate">
                {{ project.label }} - {{ submissionLabel }}
              </h1>
              <div v-else class="h-6 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          <button
            v-if="submissionSrc || submissionHtmlContent"
            @click="openInNewTab"
            class="flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all active:scale-95 flex-shrink-0"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4" />
            <span class="hidden sm:inline">Open in new tab</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Error State -->
    <div v-if="hasError" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100/50">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-9 text-red-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Submission not found</h2>
        <p class="mt-3 text-sm text-gray-600">
          The submission you're looking for doesn't exist or isn't approved.
        </p>
        <NuxtLink
          :to="backUrl"
          class="mt-8 inline-block rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/25 active:scale-95 transition-all hover:shadow-xl hover:shadow-gray-900/30"
        >
          Go back
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!submissionSrc && !submissionHtmlContent" class="flex flex-1 items-center justify-center">
      <div class="text-center">
        <div class="mx-auto mb-6 size-12 animate-spin rounded-full border-[3px] border-gray-200 border-t-indigo-600 shadow-lg"></div>
        <p class="text-sm font-medium text-gray-600">Loading submission...</p>
      </div>
    </div>

    <!-- Iframe Viewer -->
    <div v-else class="flex-1 overflow-hidden bg-white shadow-2xl shadow-black/10 relative">
      <iframe
        v-if="submissionSrc"
        :src="submissionSrc"
        :title="submissionLabel"
        class="size-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      <iframe
        v-else-if="submissionHtmlContent"
        :srcdoc="submissionHtmlContent"
        :title="submissionLabel"
        class="size-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  </div>
</template>

