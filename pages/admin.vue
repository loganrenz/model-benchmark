<script setup lang="ts">
import type { Submission } from '~/types/submission'
import type { Project } from '~/types/prompt'

type TabType = 'submissions' | 'projects'

const activeTab = ref<TabType>('submissions')
const { showSuccess, showError, showInfo } = useNotifications()

// Submissions state
const { data: submissionsData, refresh: refreshSubmissions } = await useFetch<{
  submissions: Submission[]
  total: number
}>('/api/submissions?status=pending')

const selectedSubmission = ref<Submission | null>(null)
const reviewerNotes = ref('')
const isReviewing = ref(false)

// Projects state
const { data: projectsData, refresh: refreshProjects } = await useFetch<{
  projects: Project[]
  total: number
}>('/api/projects')

const showProjectModal = ref(false)
const editingProject = ref<Project | null>(null)
const projectForm = ref({
  id: '',
  label: '',
  folder: ''
})
const isSavingProject = ref(false)
const isInitializing = ref(false)
const isBackfilling = ref(false)
const isSeeding = ref(false)

// Submission functions
async function handleReviewSubmission(status: 'approved' | 'rejected', thumbnail?: string) {
  if (!selectedSubmission.value) return

  isReviewing.value = true
  try {
    await $fetch(`/api/submissions/${selectedSubmission.value.id}`, {
      method: 'PUT',
      body: {
        status,
        reviewerNotes: reviewerNotes.value || undefined,
        thumbnail: thumbnail || undefined
      }
    })

    showSuccess(`Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
    closeSubmissionModal()
    await refreshSubmissions()
  } catch (error: any) {
    showError(error.data?.statusMessage || 'Failed to update submission')
  } finally {
    isReviewing.value = false
  }
}

function openSubmission(submission: Submission) {
  selectedSubmission.value = submission
  reviewerNotes.value = submission.reviewerNotes || ''
}

function closeSubmissionModal() {
  selectedSubmission.value = null
  reviewerNotes.value = ''
}

// Project functions
function openCreateProject() {
  editingProject.value = null
  projectForm.value = {
    id: '',
    label: '',
    folder: ''
  }
  showProjectModal.value = true
}

function openEditProject(project: Project) {
  editingProject.value = project
  projectForm.value = {
    id: project.id,
    label: project.label,
    folder: project.folder
  }
  showProjectModal.value = true
}

function closeProjectModal() {
  showProjectModal.value = false
  editingProject.value = null
  projectForm.value = {
    id: '',
    label: '',
    folder: ''
  }
}

async function saveProject() {
  isSavingProject.value = true
  try {
    if (editingProject.value) {
      await $fetch(`/api/admin/projects/${editingProject.value.id}`, {
        method: 'PUT',
        body: {
          label: projectForm.value.label,
          folder: projectForm.value.folder
        }
      })
      showSuccess('Project updated successfully')
    } else {
      await $fetch('/api/admin/projects', {
        method: 'POST',
        body: projectForm.value
      })
      showSuccess('Project created successfully')
    }

    closeProjectModal()
    await refreshProjects()
  } catch (error: any) {
    showError(error.data?.statusMessage || 'Failed to save project')
  } finally {
    isSavingProject.value = false
  }
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

// Format date helper
function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="mt-2 text-gray-600">Manage submissions and projects</p>
      </div>

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
        <div class="mb-6 flex gap-3">
          <UButton
            @click="seedSubmissions"
            :disabled="isSeeding"
            color="green"
          >
            {{ isSeeding ? 'Seeding...' : 'Seed Test Submissions' }}
          </UButton>
          <UButton
            @click="backfillThumbnails"
            :disabled="isBackfilling"
            color="indigo"
          >
            {{ isBackfilling ? 'Backfilling...' : 'Backfill Thumbnails' }}
          </UButton>
        </div>
        <div v-if="!submissionsData" class="text-center py-12">
          <div class="text-gray-500">Loading submissions...</div>
        </div>

        <div v-else-if="submissionsData.submissions.length === 0" class="text-center py-12">
          <div class="text-gray-500 text-lg">No pending submissions</div>
        </div>

        <div v-else class="grid gap-4">
          <NuxtLink
            v-for="submission in submissionsData.submissions"
            :key="submission.id"
            :to="`/projects/${submission.projectId}/${submission.id}`"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer block"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ submission.label }}</h3>
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {{ submission.status }}
                  </span>
                </div>
                <div class="text-sm text-gray-600 space-y-1">
                  <div><span class="font-medium">Project:</span> {{ submission.projectId }}</div>
                  <div><span class="font-medium">Agent:</span> {{ submission.agentName }}</div>
                  <div><span class="font-medium">Submitted:</span> {{ formatDate(submission.submittedAt) }}</div>
                </div>
              </div>
              <UButton
                color="gray"
                variant="ghost"
                @click.stop="openSubmission(submission)"
              >
                Review
              </UButton>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Projects Tab -->
      <div v-if="activeTab === 'projects'">
        <div class="mb-6 flex gap-3">
          <UButton
            @click="openCreateProject"
            color="indigo"
          >
            + Create Project
          </UButton>
          <UButton
            @click="initializeDefaultProjects"
            :disabled="isInitializing"
            color="gray"
          >
            Initialize Defaults
          </UButton>
        </div>

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
                <UButton
                  @click="openEditProject(project)"
                  color="indigo"
                  variant="ghost"
                  size="sm"
                >
                  Edit
                </UButton>
                <UButton
                  @click="deleteProject(project)"
                  color="red"
                  variant="ghost"
                  size="sm"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submission Review Modal -->
    <AdminSubmissionReviewModal
      v-if="selectedSubmission"
      :submission="selectedSubmission"
      v-model:reviewer-notes="reviewerNotes"
      :is-reviewing="isReviewing"
      @close="closeSubmissionModal"
      @review="handleReviewSubmission"
    />

    <!-- Project Form Modal -->
    <AdminProjectFormModal
      :open="showProjectModal"
      :project="editingProject"
      v-model:form="projectForm"
      :is-saving="isSavingProject"
      @close="closeProjectModal"
      @save="saveProject"
    />
  </div>
</template>
