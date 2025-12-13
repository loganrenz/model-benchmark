<script setup lang="ts">
import type { Project } from '~/types/prompt'
import type { SubmissionCreate } from '~/types/submission'

interface Props {
  projects: Project[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submitted: []
}>()

const formData = ref<SubmissionCreate>({
  projectId: '',
  agentName: '',
  label: '',
  filePath: '',
  htmlContent: ''
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const selectedProject = computed(() => {
  return props.projects.find(p => p.id === formData.value.projectId)
})

function validateForm(): boolean {
  if (!formData.value.projectId) {
    error.value = 'Please select a project'
    return false
  }
  if (!formData.value.agentName.trim()) {
    error.value = 'Agent name is required'
    return false
  }
  if (!formData.value.label.trim()) {
    error.value = 'Label is required'
    return false
  }
  if (!formData.value.filePath.trim()) {
    error.value = 'File path is required'
    return false
  }
  if (!formData.value.htmlContent.trim()) {
    error.value = 'HTML content is required'
    return false
  }
  
  // Validate file path format
  if (!formData.value.filePath.endsWith('/index.html')) {
    error.value = 'File path must end with /index.html'
    return false
  }

  return true
}

async function handleSubmit() {
  error.value = null
  success.value = false

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/submissions', {
      method: 'POST',
      body: formData.value
    })

    success.value = true
    
    // Reset form
    formData.value = {
      projectId: '',
      agentName: '',
      label: '',
      filePath: '',
      htmlContent: ''
    }

    emit('submitted')

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to submit. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Auto-generate file path when project and agent name change
watch([() => formData.value.projectId, () => formData.value.agentName], ([projectId, agentName]) => {
  if (projectId && agentName) {
    const project = props.projects.find(p => p.id === projectId)
    if (project) {
      // Convert agent name to folder-friendly format
      const folderName = agentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      formData.value.filePath = `${folderName}/index.html`
    }
  }
})
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div
        v-if="success"
        class="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 flex items-center gap-3"
      >
        <UIcon name="i-heroicons-check-circle" class="size-5 text-green-600 flex-shrink-0" />
        <p class="text-sm font-medium text-green-800">
          Submission successful! Your implementation is pending review.
        </p>
      </div>

      <div
        v-if="error"
        class="rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 p-4 flex items-center gap-3"
      >
        <UIcon name="i-heroicons-exclamation-circle" class="size-5 text-red-600 flex-shrink-0" />
        <p class="text-sm font-medium text-red-800">{{ error }}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Project <span class="text-red-500">*</span>
        </label>
        <select
          v-model="formData.projectId"
          required
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          <option value="">Select a project...</option>
          <option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Agent Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.agentName"
          type="text"
          required
          placeholder="e.g., agent-claude-sonnet-4"
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400"
        />
        <p class="mt-1.5 text-xs text-gray-500">
          Use format: agent-&lt;model-name&gt; (e.g., agent-gpt-5, agent-gemini-pro)
        </p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Display Label <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.label"
          type="text"
          required
          placeholder="e.g., Claude Sonnet 4"
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400"
        />
        <p class="mt-1.5 text-xs text-gray-500">
          Human-readable name shown in the UI
        </p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          File Path <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-2">
          <span
            v-if="selectedProject"
            class="text-sm text-gray-500 font-medium whitespace-nowrap"
          >
            {{ selectedProject.folder }}/
          </span>
          <input
            v-model="formData.filePath"
            type="text"
            required
            placeholder="agent-name/index.html"
            class="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400"
          />
        </div>
        <p class="mt-1.5 text-xs text-gray-500">
          Must end with /index.html. Auto-generated from agent name.
        </p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          HTML Content <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="formData.htmlContent"
          required
          rows="15"
          placeholder="Paste your complete HTML implementation here..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400 resize-y"
        />
        <p class="mt-1.5 text-xs text-gray-500">
          Your complete HTML file content. Should be self-contained.
        </p>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span v-if="isSubmitting">Submitting...</span>
        <span v-else>Submit Implementation</span>
        <UIcon
          v-if="isSubmitting"
          name="i-heroicons-arrow-path"
          class="size-4 animate-spin"
        />
        <UIcon
          v-else
          name="i-heroicons-paper-airplane"
          class="size-4"
        />
      </button>
    </form>
  </div>
</template>

