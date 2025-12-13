<script setup lang="ts">
import type { Submission } from '~/types/submission'
import type { Project } from '~/types/prompt'

type TabType = 'submissions' | 'projects'

const activeTab = ref<TabType>('submissions')
const { showSuccess, showError, showInfo } = useNotifications()

// Breadcrumbs
const breadcrumbs = [
  { label: 'Admin', icon: 'i-heroicons-cog-6-tooth' }
]

// Filter state for submissions
const statusFilter = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')
const projectFilter = ref<string>('')

// Build submissions query URL
const submissionsUrl = computed(() => {
  const params = new URLSearchParams()
  if (statusFilter.value !== 'all') {
    params.set('status', statusFilter.value)
  }
  if (projectFilter.value) {
    params.set('projectId', projectFilter.value)
  }
  params.set('limit', '100')
  return `/api/submissions?${params.toString()}`
})

// Submissions state
const { data: submissionsData, refresh: refreshSubmissions } = await useFetch<{
  submissions: Submission[]
  total: number
}>(submissionsUrl, { watch: [submissionsUrl] })

// Projects state
const { data: projectsData, refresh: refreshProjects } = await useFetch<{
  projects: Project[]
  total: number
}>('/api/projects')

// Modal state
const showProjectModal = ref(false)
const editingProject = ref<Project | null>(null)
const showReviewModal = ref(false)
const selectedSubmission = ref<Submission | null>(null)

// Other state
const isInitializing = ref(false)
const isBackfilling = ref(false)
const isSeeding = ref(false)
const generatingThumbnailFor = ref<string | null>(null)

// Quick approve (without modal)
async function quickApproveSubmission(submission: Submission) {
  try {
    await $fetch(`/api/submissions/${submission.id}`, {
      method: 'PUT',
      body: { status: 'approved' }
    })
    showSuccess('Submission approved successfully')
    await refreshSubmissions()
  } catch (error: any) {
    showError(error.data?.statusMessage || 'Failed to approve submission')
  }
}

function openReviewModal(submission: Submission) {
  selectedSubmission.value = submission
  showReviewModal.value = true
}

function openCreateProject() {
  editingProject.value = null
  showProjectModal.value = true
}

function openEditProject(project: Project) {
  editingProject.value = project
  showProjectModal.value = true
}

async function deleteProject(project: Project) {
  const confirmed = confirm(`Are you sure you want to delete "${project.label}"? This will also delete all associated prompts.`)
  if (!confirmed) return

  try {
    await $fetch(`/api/admin/projects/${project.id}`, {
      method: 'DELETE'
    })
    showSuccess('Project deleted successfully')
    await refreshProjects()
  } catch (error: any) {
    showError(error.data?.statusMessage || 'Failed to delete project')
  }
}

async function initializeDefaultProjects() {
  const confirmed = confirm('Initialize default projects? Existing projects will not be affected.')
  if (!confirmed) return

  isInitializing.value = true
  try {
    const result = await $fetch('/api/admin/init-projects', {
      method: 'POST'
    })

    const created = result.results.filter((r: any) => r.status === 'created').length
    const skipped = result.results.filter((r: any) => r.status === 'skipped').length

    showInfo(`${created} projects created, ${skipped} skipped`)
    await refreshProjects()
  } catch (error: any) {
    showError('Failed to initialize projects')
  } finally {
    isInitializing.value = false
  }
}

async function backfillThumbnails() {
  const confirmed = confirm('Generate thumbnails for all submissions that don\'t have them? This may take a while.')
  if (!confirmed) return

  isBackfilling.value = true
  try {
    const result = await $fetch('/api/admin/backfill-thumbnails', {
      method: 'POST'
    })

    let message = `Backfill complete: ${result.processed} processed, ${result.succeeded} succeeded, ${result.failed} failed`
    if ('errors' in result && result.errors && result.errors.length > 0) {
      message += `. ${result.errors.length} error(s) occurred`
    }
    showInfo(message)
    await refreshSubmissions()
  } catch (error: any) {
    showError(error.data?.statusMessage || 'Failed to backfill thumbnails')
  } finally {
    isBackfilling.value = false
  }
}

async function seedSubmissions() {
  const confirmed = confirm('Seed database with test submissions? This will add sample submissions for testing.')
  if (!confirmed) return

  isSeeding.value = true
  try {
    const result = await $fetch('/api/admin/seed-submissions', {
      method: 'POST'
    })

    showSuccess(`${result.submissionsCreated} test submissions created`)
    await refreshSubmissions()
    await refreshProjects()
  } catch (error: any) {
    showError(error.data?.statusMessage || 'Failed to seed submissions')
  } finally {
    isSeeding.value = false
  }
}

async function generateThumbnailForSubmission(submissionId: string, event: Event) {
  event.preventDefault()
  event.stopPropagation()

  generatingThumbnailFor.value = submissionId
  try {
    await $fetch(`/api/admin/submissions/${submissionId}/thumbnail`, {
      method: 'POST'
    })
    showSuccess('Thumbnail generated successfully')
    await refreshSubmissions()
  } catch (error: any) {
    showError(error.data?.statusMessage || 'Failed to generate thumbnail')
  } finally {
    generatingThumbnailFor.value = null
  }
}

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

async function onProjectSaved() {
  await refreshProjects()
}

async function onSubmissionReviewed() {
  await refreshSubmissions()
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <template #header-actions>
      <!-- No default submit button on admin page -->
    </template>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button @click="activeTab = 'submissions'" :class="[
          'py-4 px-1 border-b-2 font-medium text-sm',
          activeTab === 'submissions'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]">
          Submissions
          <span v-if="submissionsData" class="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
            {{ submissionsData.total }}
          </span>
        </button>
        <button @click="activeTab = 'projects'" :class="[
          'py-4 px-1 border-b-2 font-medium text-sm',
          activeTab === 'projects'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]">
          Projects
          <span v-if="projectsData" class="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
            {{ projectsData.total }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Submissions Tab -->
    <div v-if="activeTab === 'submissions'">
      <!-- Filters and Actions Row -->
      <div class="mb-6 flex flex-wrap items-center gap-4">
        <!-- Status Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Status:</label>
          <select v-model="statusFilter"
            class="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Project Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Project:</label>
          <select v-model="projectFilter"
            class="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
            <option value="">All Projects</option>
            <option v-if="projectsData" v-for="project in projectsData.projects" :key="project.id" :value="project.id">
              {{ project.label }}
            </option>
          </select>
        </div>

        <div class="flex-1" />

        <!-- Actions -->
        <UButton @click="seedSubmissions" :disabled="isSeeding" color="success" size="sm">
          {{ isSeeding ? 'Seeding...' : 'Seed Test Submissions' }}
        </UButton>
        <UButton @click="backfillThumbnails" :disabled="isBackfilling" color="primary" size="sm">
          {{ isBackfilling ? 'Backfilling...' : 'Backfill Thumbnails' }}
        </UButton>
      </div>

      <div v-if="!submissionsData" class="text-center py-12">
        <div class="text-gray-500">Loading submissions...</div>
      </div>

      <div v-else-if="submissionsData.submissions.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">No {{ statusFilter === 'all' ? '' : statusFilter }} submissions{{
          projectFilter ? ' for this project' : '' }}</div>
      </div>

      <div v-else class="grid gap-4">
        <NuxtLink v-for="submission in submissionsData.submissions" :key="submission.id"
          :to="`/projects/${submission.projectId}/${submission.id}`"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer block">
          <div class="flex items-start gap-4">
            <!-- Thumbnail -->
            <div class="shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img v-if="submission.thumbnail" :src="submission.thumbnail" :alt="submission.label"
                class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <UIcon name="i-heroicons-photo" class="size-8" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900 truncate">{{ submission.label }}</h3>
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full shrink-0',
                  submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                ]">
                  {{ submission.status }}
                </span>
              </div>
              <div class="text-sm text-gray-600 space-y-0.5">
                <div><span class="font-medium">Project:</span> {{ submission.projectId }}</div>
                <div><span class="font-medium">Agent:</span> {{ submission.agentName }}</div>
                <div><span class="font-medium">Submitted:</span> {{ formatDate(submission.submittedAt) }}</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="shrink-0 flex flex-col gap-2">
              <UButton color="neutral" variant="ghost" size="sm" @click.stop="openReviewModal(submission)">
                Review
              </UButton>
              <UButton color="success" variant="ghost" size="sm" @click.stop="quickApproveSubmission(submission)">
                Approve
              </UButton>
              <UButton color="primary" variant="outline" size="sm" :loading="generatingThumbnailFor === submission.id"
                :disabled="generatingThumbnailFor !== null"
                @click="generateThumbnailForSubmission(submission.id!, $event)">
                {{ submission.thumbnail ? 'Regen' : 'Gen' }} Thumb
              </UButton>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Projects Tab -->
    <div v-if="activeTab === 'projects'">
      <div class="mb-6 flex gap-3">
        <UButton color="primary" @click="openCreateProject">+ Create Project</UButton>
        <UButton @click="initializeDefaultProjects" :disabled="isInitializing" color="neutral">
          Initialize Defaults
        </UButton>
      </div>

      <!-- Project Form Modal -->
      <ClientOnly>
        <AdminProjectFormModal :open="showProjectModal" @update:open="showProjectModal = $event" :project="editingProject" @saved="onProjectSaved" />
      </ClientOnly>

      <div v-if="!projectsData" class="text-center py-12">
        <div class="text-gray-500">Loading projects...</div>
      </div>

      <div v-else-if="projectsData.projects.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">No projects yet</div>
      </div>

      <div v-else class="grid gap-4">
        <div v-for="project in projectsData.projects" :key="project.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ project.label }}</h3>
              <div class="text-sm text-gray-600 space-y-1">
                <div><span class="font-medium">ID:</span> {{ project.id }}</div>
                <div><span class="font-medium">Folder:</span> {{ project.folder }}</div>
              </div>
            </div>
            <div class="flex gap-2">
              <UButton @click="openEditProject(project)" color="primary" variant="ghost" size="sm">
                Edit
              </UButton>
              <UButton @click="deleteProject(project)" color="error" variant="ghost" size="sm">
                Delete
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submission Review Modal -->
    <ClientOnly>
      <AdminSubmissionReviewModal :open="showReviewModal" @update:open="showReviewModal = $event" :submission="selectedSubmission"
        @reviewed="onSubmissionReviewed" />
    </ClientOnly>
  </AppLayout>
</template>
