<script setup lang="ts">
import type { Project } from '~/types/prompt'
import type { Submission } from '~/types/submission'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.id as string)

// Get selected submission IDs from query params
const selectedIds = computed(() => {
  const ids = route.query.compare as string | string[]
  if (!ids) return []
  return Array.isArray(ids) ? ids : [ids]
})

const { data: projectData, error: projectError } = await useFetch<Project>(`/api/projects/${projectId.value}?includeModels=true`)

// Fetch all selected submissions
const submissionsData = await Promise.all(
  selectedIds.value.map(id => 
    $fetch<Submission>(`/api/submissions/${id}`).catch(() => null)
  )
)

const selectedSubmissions = computed(() => {
  return submissionsData.filter(s => s !== null) as Submission[]
})

const breadcrumbs = computed(() => [
  { label: projectData.value?.label || 'Project', to: `/projects/${projectId.value}`, icon: 'i-heroicons-cube-transparent' },
  { label: 'Compare', icon: 'i-heroicons-arrows-right-left' }
])

function removeSubmission(submissionId: string) {
  const newIds = selectedIds.value.filter(id => id !== submissionId)
  if (newIds.length === 0) {
    router.push(`/projects/${projectId.value}`)
  } else {
    router.push({ 
      path: `/projects/${projectId.value}/compare`,
      query: { compare: newIds }
    })
  }
}

function clearAll() {
  router.push(`/projects/${projectId.value}`)
}

// Get the iframe src for a submission
function getSubmissionSrc(submission: Submission) {
  // Use the filePath from the submission which is like "agent-name/index.html"
  return `/projects/${projectData.value?.folder}/${submission.filePath}`
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <!-- Error State -->
    <div v-if="projectError" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100/50">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-9 text-red-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Failed to load</h2>
        <p class="mt-3 text-sm text-gray-600">
          Could not load project. Please try again.
        </p>
      </div>
    </div>

    <!-- No selections -->
    <div v-else-if="selectedSubmissions.length === 0" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-md text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
          <UIcon name="i-heroicons-arrows-right-left" class="size-9 text-indigo-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">No submissions selected</h2>
        <p class="mt-3 text-sm text-gray-600">
          Select at least one submission to compare
        </p>
        <NuxtLink
          :to="`/projects/${projectId}`"
          class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Project
        </NuxtLink>
      </div>
    </div>

    <!-- Comparison View -->
    <div v-else>
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Comparing {{ selectedSubmissions.length }} {{ selectedSubmissions.length === 1 ? 'Submission' : 'Submissions' }}
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ projectData?.label }}
          </p>
        </div>
        <button
          @click="clearAll"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
        >
          <UIcon name="i-heroicons-x-mark" class="size-4" />
          Clear All
        </button>
      </div>

      <!-- Grid Layout (2 columns for 2 items, 1 column for 1 item, 2 rows for 3-4 items) -->
      <div 
        class="grid gap-6"
        :class="{
          'grid-cols-1': selectedSubmissions.length === 1,
          'grid-cols-1 lg:grid-cols-2': selectedSubmissions.length === 2,
          'grid-cols-1 md:grid-cols-2': selectedSubmissions.length >= 3
        }"
      >
        <div
          v-for="submission in selectedSubmissions"
          :key="submission.id"
          class="relative rounded-2xl bg-white/80 border border-gray-200/80 shadow-lg overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <UIcon name="i-heroicons-cube-transparent" class="size-5 text-white" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">{{ submission.label }}</h3>
                <p class="text-xs text-gray-600">{{ submission.agentName }}</p>
              </div>
            </div>
            <button
              @click="removeSubmission(submission.id!)"
              class="flex items-center justify-center size-8 rounded-lg hover:bg-white/50 transition-colors"
              aria-label="Remove from comparison"
            >
              <UIcon name="i-heroicons-x-mark" class="size-5 text-gray-600" />
            </button>
          </div>

          <!-- Preview -->
          <div class="aspect-video bg-gray-100">
            <iframe
              :src="getSubmissionSrc(submission)"
              class="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              :title="`Preview of ${submission.label}`"
            />
          </div>

          <!-- Actions -->
          <div class="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
            <NuxtLink
              :to="`/projects/${projectId}/${submission.id}`"
              class="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              <UIcon name="i-heroicons-eye" class="size-4" />
              View Details
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
