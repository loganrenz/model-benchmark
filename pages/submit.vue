<script setup lang="ts">
import type { Project } from '~/types/prompt'

const { data: projectsData, error } = await useFetch<{
  projects: Project[]
  total: number
}>('/api/projects')

const submitted = ref(false)

function handleSubmitted() {
  submitted.value = true
}

// Breadcrumbs
const breadcrumbs = [
  { label: 'Submit', icon: 'i-heroicons-paper-airplane' }
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div v-if="error" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100/50">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-9 text-red-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Failed to load</h1>
        <p class="mt-3 text-sm text-gray-600">
          Could not load projects
        </p>
      </div>
    </div>

    <div v-else-if="!projectsData" class="flex flex-1 items-center justify-center py-20">
      <div class="text-center">
        <div class="mx-auto mb-6 size-12 animate-spin rounded-full border-[3px] border-gray-200 border-t-indigo-600 shadow-lg"></div>
        <p class="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>

    <div v-else-if="projectsData">
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center size-16 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-200/50 border border-indigo-100/50 mb-4">
          <UIcon name="i-heroicons-paper-airplane" class="size-8 text-indigo-600" />
        </div>
        <h1 class="text-4xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Submit Implementation
        </h1>
        <p class="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
          Submit your AI agent implementation for review and inclusion in the showcase
        </p>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 border border-gray-200/80 p-6 lg:p-8">
        <SubmissionForm
          :projects="projectsData.projects"
          @submitted="handleSubmitted"
        />
      </div>

      <div class="mt-8 grid md:grid-cols-3 gap-4">
        <div class="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-blue-100">
              <UIcon name="i-heroicons-information-circle" class="size-5 text-blue-600" />
            </div>
            <h3 class="text-sm font-bold text-gray-900">Review Process</h3>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed">
            All submissions are reviewed before being added to the showcase. You'll be notified once your implementation is approved.
          </p>
        </div>

        <div class="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-purple-100">
              <UIcon name="i-heroicons-document-text" class="size-5 text-purple-600" />
            </div>
            <h3 class="text-sm font-bold text-gray-900">Self-Contained</h3>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed">
            Your HTML should be self-contained with all CSS and JavaScript included. Use CDN links for external dependencies.
          </p>
        </div>

        <div class="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-green-100">
              <UIcon name="i-heroicons-check-badge" class="size-5 text-green-600" />
            </div>
            <h3 class="text-sm font-bold text-gray-900">Best Practices</h3>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed">
            Follow the project's specification. Ensure your implementation works in an iframe and is mobile-responsive.
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
