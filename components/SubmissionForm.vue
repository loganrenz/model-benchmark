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

// Field-level validation errors
const fieldErrors = ref<Record<string, string>>({})
const touchedFields = ref<Set<string>>(new Set())

// Refs for scrolling to errors
const projectSelectRef = ref<HTMLElement | null>(null)
const agentNameInputRef = ref<HTMLElement | null>(null)
const labelInputRef = ref<HTMLElement | null>(null)
const filePathInputRef = ref<HTMLElement | null>(null)
const htmlContentTextareaRef = ref<HTMLElement | null>(null)

const fieldRefs: Record<string, Ref<HTMLElement | null>> = {
  projectId: projectSelectRef,
  agentName: agentNameInputRef,
  label: labelInputRef,
  filePath: filePathInputRef,
  htmlContent: htmlContentTextareaRef
}

const selectedProject = computed(() => {
  return props.projects.find(p => p.id === formData.value.projectId)
})

// HTML content size
const htmlContentSize = computed(() => {
  return new Blob([formData.value.htmlContent]).size
})

const htmlContentSizeMB = computed(() => {
  return (htmlContentSize.value / (1024 * 1024)).toFixed(2)
})

const isHtmlContentLarge = computed(() => {
  return htmlContentSize.value > 1024 * 1024 // > 1MB
})

// Character count for HTML content
const htmlContentLength = computed(() => {
  return formData.value.htmlContent.length
})

// Validation functions
function validateProjectId(): string | null {
  if (!formData.value.projectId) {
    return 'Please select a project'
  }
  return null
}

function validateAgentName(): string | null {
  if (!formData.value.agentName.trim()) {
    return 'Agent name is required'
  }
  return null
}

function validateLabel(): string | null {
  if (!formData.value.label.trim()) {
    return 'Label is required'
  }
  return null
}

function validateFilePath(): string | null {
  if (!formData.value.filePath.trim()) {
    return 'File path is required'
  }
  if (!formData.value.filePath.endsWith('/index.html')) {
    return 'File path must end with /index.html'
  }
  return null
}

function validateHtmlContent(): string | null {
  if (!formData.value.htmlContent.trim()) {
    return 'HTML content is required'
  }
  if (isHtmlContentLarge.value) {
    return `HTML content is large (${htmlContentSizeMB}MB). This may take longer to process.`
  }
  return null
}

// Validate a single field
function validateField(fieldName: keyof SubmissionCreate): string | null {
  switch (fieldName) {
    case 'projectId':
      return validateProjectId()
    case 'agentName':
      return validateAgentName()
    case 'label':
      return validateLabel()
    case 'filePath':
      return validateFilePath()
    case 'htmlContent':
      return validateHtmlContent()
    default:
      return null
  }
}

// Validate all fields
function validateAllFields(): boolean {
  const errors: Record<string, string> = {}
  let isValid = true

  const fields: (keyof SubmissionCreate)[] = ['projectId', 'agentName', 'label', 'filePath', 'htmlContent']
  
  for (const field of fields) {
    const error = validateField(field)
    if (error) {
      errors[field] = error
      isValid = false
    }
  }

  fieldErrors.value = errors
  return isValid
}

// Handle field blur
function handleFieldBlur(fieldName: keyof SubmissionCreate) {
  touchedFields.value.add(fieldName)
  const error = validateField(fieldName)
  if (error) {
    fieldErrors.value[fieldName] = error
  } else {
    delete fieldErrors.value[fieldName]
  }
}

// Handle field change (for real-time validation)
function handleFieldChange(fieldName: keyof SubmissionCreate) {
  if (touchedFields.value.has(fieldName)) {
    const error = validateField(fieldName)
    if (error) {
      fieldErrors.value[fieldName] = error
    } else {
      delete fieldErrors.value[fieldName]
    }
  }
}

// Scroll to first error field
function scrollToFirstError() {
  const firstErrorField = Object.keys(fieldErrors.value)[0] as keyof SubmissionCreate
  if (firstErrorField && fieldRefs[firstErrorField]) {
    nextTick(() => {
      fieldRefs[firstErrorField].value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      fieldRefs[firstErrorField].value?.focus()
    })
  }
}

// Legacy validateForm for backward compatibility
function validateForm(): boolean {
  error.value = null
  // Mark all fields as touched
  const fields: (keyof SubmissionCreate)[] = ['projectId', 'agentName', 'label', 'filePath', 'htmlContent']
  fields.forEach(field => touchedFields.value.add(field))
  
  const isValid = validateAllFields()
  if (!isValid) {
    scrollToFirstError()
    // Set general error message
    const firstError = Object.values(fieldErrors.value)[0]
    if (firstError) {
      error.value = firstError
    }
  }
  return isValid
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
    fieldErrors.value = {}
    touchedFields.value.clear()

    emit('submitted')

    // Clear success message after 5 seconds (increased from 3)
    setTimeout(() => {
      success.value = false
    }, 5000)
  } catch (err: any) {
    const { getErrorMessage } = useErrorHandler()
    error.value = getErrorMessage(err)
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
      // Validate file path if it's been touched
      if (touchedFields.value.has('filePath')) {
        handleFieldChange('filePath')
      }
    }
  }
})

// Auto-format agent name (lowercase, hyphens)
watch(() => formData.value.agentName, (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    // Only auto-format if user is typing (not programmatic change)
    const formatted = newValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (formatted !== newValue && newValue.length > 0) {
      formData.value.agentName = formatted
    }
  }
})

// Preview HTML content
function previewHtml() {
  if (!formData.value.htmlContent.trim()) return
  
  const blob = new Blob([formData.value.htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

// Auto-focus first field on mount
onMounted(() => {
  nextTick(() => {
    projectSelectRef.value?.focus()
  })
})
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Success Message -->
      <div
        v-if="success"
        class="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-check-circle" class="size-5 text-green-600 flex-shrink-0" />
          <p class="text-sm font-medium text-green-800">
            Submission successful! Your implementation is pending review.
          </p>
        </div>
        <button
          @click="success = false"
          class="text-green-600 hover:text-green-700 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] text-lg font-bold leading-none"
          aria-label="Dismiss"
          title="Dismiss"
        >
          ×
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 p-4 flex items-center gap-3"
      >
        <UIcon name="i-heroicons-exclamation-circle" class="size-5 text-red-600 flex-shrink-0" />
        <p class="text-sm font-medium text-red-800">{{ error }}</p>
      </div>

      <!-- Project Selection -->
      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Project <span class="text-red-500">*</span>
        </label>
        <select
          ref="projectSelectRef"
          v-model="formData.projectId"
          @blur="handleFieldBlur('projectId')"
          @change="handleFieldChange('projectId')"
          required
          :class="[
            'w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all',
            fieldErrors.projectId ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
          ]"
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
        <p v-if="fieldErrors.projectId" class="mt-1.5 text-xs text-red-600">
          {{ fieldErrors.projectId }}
        </p>
      </div>

      <!-- Agent Name -->
      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Agent Name <span class="text-red-500">*</span>
        </label>
        <input
          ref="agentNameInputRef"
          v-model="formData.agentName"
          type="text"
          @blur="handleFieldBlur('agentName')"
          @input="handleFieldChange('agentName')"
          required
          placeholder="e.g., agent-claude-sonnet-4"
          :class="[
            'w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400',
            fieldErrors.agentName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
          ]"
        />
        <div class="mt-1.5 flex items-center justify-between">
          <p class="text-xs text-gray-500">
            Use format: agent-&lt;model-name&gt; (e.g., agent-gpt-5, agent-gemini-pro)
          </p>
          <span v-if="formData.agentName" class="text-xs text-gray-400">
            {{ formData.agentName.length }} chars
          </span>
        </div>
        <p v-if="fieldErrors.agentName" class="mt-1.5 text-xs text-red-600">
          {{ fieldErrors.agentName }}
        </p>
      </div>

      <!-- Label -->
      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Display Label <span class="text-red-500">*</span>
        </label>
        <input
          ref="labelInputRef"
          v-model="formData.label"
          type="text"
          @blur="handleFieldBlur('label')"
          @input="handleFieldChange('label')"
          required
          placeholder="e.g., Claude Sonnet 4"
          :class="[
            'w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400',
            fieldErrors.label ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
          ]"
        />
        <div class="mt-1.5 flex items-center justify-between">
          <p class="text-xs text-gray-500">
            Human-readable name shown in the UI
          </p>
          <span v-if="formData.label" class="text-xs text-gray-400">
            {{ formData.label.length }} chars
          </span>
        </div>
        <p v-if="fieldErrors.label" class="mt-1.5 text-xs text-red-600">
          {{ fieldErrors.label }}
        </p>
      </div>

      <!-- File Path -->
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
            ref="filePathInputRef"
            v-model="formData.filePath"
            type="text"
            @blur="handleFieldBlur('filePath')"
            @input="handleFieldChange('filePath')"
            required
            placeholder="agent-name/index.html"
            :class="[
              'flex-1 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400',
              fieldErrors.filePath ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
            ]"
          />
        </div>
        <div class="mt-1.5 flex items-center justify-between">
          <p class="text-xs text-gray-500">
            Must end with /index.html. Auto-generated from agent name.
          </p>
          <span v-if="formData.filePath" class="text-xs" :class="formData.filePath.endsWith('/index.html') ? 'text-green-600' : 'text-amber-600'">
            {{ formData.filePath.endsWith('/index.html') ? '✓ Valid' : 'Must end with /index.html' }}
          </span>
        </div>
        <p v-if="fieldErrors.filePath" class="mt-1.5 text-xs text-red-600">
          {{ fieldErrors.filePath }}
        </p>
      </div>

      <!-- HTML Content -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-semibold text-gray-900">
            HTML Content <span class="text-red-500">*</span>
          </label>
          <button
            v-if="formData.htmlContent.trim()"
            type="button"
            @click="previewHtml"
            class="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-3" />
            Preview
          </button>
        </div>
        <textarea
          ref="htmlContentTextareaRef"
          v-model="formData.htmlContent"
          @blur="handleFieldBlur('htmlContent')"
          @input="handleFieldChange('htmlContent')"
          required
          rows="15"
          placeholder="Paste your complete HTML implementation here..."
          :class="[
            'w-full rounded-xl border bg-white px-4 py-3 text-sm font-mono text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400 resize-y',
            fieldErrors.htmlContent && !isHtmlContentLarge ? 'border-red-500 focus:border-red-500' : isHtmlContentLarge ? 'border-amber-500 focus:border-amber-500' : 'border-gray-300 focus:border-indigo-500'
          ]"
        />
        <div class="mt-1.5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <p class="text-xs text-gray-500">
              Your complete HTML file content. Should be self-contained.
            </p>
            <span v-if="isHtmlContentLarge" class="text-xs text-amber-600 font-medium">
              ⚠ Large file ({{ htmlContentSizeMB }}MB)
            </span>
          </div>
          <span class="text-xs" :class="isHtmlContentLarge ? 'text-amber-600' : 'text-gray-400'">
            {{ htmlContentLength.toLocaleString() }} chars ({{ htmlContentSizeMB }}MB)
          </span>
        </div>
        <p v-if="fieldErrors.htmlContent" class="mt-1.5 text-xs" :class="isHtmlContentLarge ? 'text-amber-600' : 'text-red-600'">
          {{ fieldErrors.htmlContent }}
        </p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
