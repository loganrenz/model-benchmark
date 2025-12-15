<script setup lang="ts">
import type { Submission } from '~/types/submission'

const props = defineProps<{
  submission?: Submission | null
  open: boolean
}>()

const emit = defineEmits<{
  reviewed: []
  'update:open': [value: boolean]
}>()

// Expose props for template usage
const { submission, open } = toRefs(props)

const isOpen = computed({
  get: () => open.value,
  set: (value) => emit('update:open', value)
})

const reviewerNotes = ref('')
const isReviewing = ref(false)
const { showSuccess, showError } = useNotifications()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// Reset notes when modal opens
watch(open, (isOpenValue) => {
  if (isOpenValue && submission.value) {
    reviewerNotes.value = submission.value.reviewerNotes || ''
    iframeError.value = false
  } else if (!isOpenValue) {
    // Clean up when modal closes
    cleanupBlobUrl()
    iframeError.value = false
  }
})

// Reset iframe error when submission changes
watch(submission, () => {
  iframeError.value = false
})

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const safeHtmlContent = computed(() => {
  if (!submission.value?.htmlContent) return ''
  // Ensure the HTML content is properly formatted
  const content = submission.value.htmlContent.trim()

  // If content doesn't start with <, wrap it in a basic HTML structure
  if (!content.startsWith('<')) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`
  }

  // If content starts with < but doesn't have DOCTYPE or html tag, wrap it
  if (!content.toLowerCase().includes('<!doctype') && !content.toLowerCase().startsWith('<html')) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`
  }

  return content
})

const iframeSrc = ref<string | null>(null)
const iframeError = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

// Create blob URL from HTML content
function createBlobUrl(content: string): string | null {
  try {
    const blob = new Blob([content], { type: 'text/html; charset=utf-8' })
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error creating blob URL:', error)
    return null
  }
}

// Clean up existing blob URL
function cleanupBlobUrl() {
  if (iframeSrc.value) {
    URL.revokeObjectURL(iframeSrc.value)
    iframeSrc.value = null
  }
}

// Update blob URL when content changes
watch(() => safeHtmlContent.value, (content) => {
  cleanupBlobUrl()
  if (content) {
    iframeSrc.value = createBlobUrl(content)
  }
  iframeError.value = false
}, { immediate: true })

function handleIframeError() {
  iframeError.value = true
}

function handleIframeLoad() {
  iframeError.value = false
}

// Clean up blob URL when component unmounts
onUnmounted(() => {
  cleanupBlobUrl()
})

async function handleReview(status: 'approved' | 'rejected') {
  if (!submission.value) return

  isReviewing.value = true
  try {
    await $fetch(`/api/submissions/${submission.value.id}`, {
      method: 'PUT',
      body: {
        status,
        reviewerNotes: reviewerNotes.value || undefined
      }
    })

    showSuccess(`Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
    isOpen.value = false
    emit('reviewed')
  } catch (error: any) {
    const { getErrorMessage } = useErrorHandler()
    showError(getErrorMessage(error))
  } finally {
    isReviewing.value = false
  }
}

</script>

<template>
  <UModal v-if="isMounted" v-model:open="isOpen" :dismissible="false" title="Review Submission"
    description="Review and approve or reject this submission" :ui="{
      content: 'max-w-6xl',
      footer: 'justify-end'
    }">
    <template #body>
      <div v-if="submission" class="space-y-6">
        <!-- Review Mode Banner -->
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <UIcon name="i-heroicons-clipboard-document-check" class="size-6 text-amber-600" />
          <div class="flex-1">
            <div class="font-semibold text-amber-900">Review Mode</div>
            <div class="text-sm text-amber-700">Review the submission below and make your decision</div>
          </div>
          <UBadge color="warning" variant="soft" size="lg">Pending Review</UBadge>
        </div>

        <!-- Submission Info -->
        <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700">Project</label>
            <div class="mt-1 text-sm text-gray-900 font-medium">{{ submission.projectId }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Agent Name</label>
            <div class="mt-1 text-sm text-gray-900 font-medium">{{ submission.agentName }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Label</label>
            <div class="mt-1 text-sm text-gray-900 font-medium">{{ submission.label }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Submitted</label>
            <div class="mt-1 text-sm text-gray-900 font-medium">{{ formatDate(submission.submittedAt) }}</div>
          </div>
        </div>

        <!-- Preview Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Submission Preview</label>
          <div class="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm" style="height: 400px;">
            <div v-if="iframeError" class="flex items-center justify-center h-full bg-gray-50 text-gray-500">
              <div class="text-center">
                <UIcon name="i-heroicons-exclamation-triangle" class="size-8 mx-auto mb-2 text-amber-500" />
                <p class="text-sm">Error loading preview</p>
                <p class="text-xs text-gray-400 mt-1">The submission content may contain invalid JavaScript</p>
              </div>
            </div>
            <iframe v-else-if="iframeSrc" ref="iframeRef" :src="iframeSrc" class="w-full h-full border-0"
              title="Submission Preview" sandbox="allow-scripts allow-same-origin allow-forms"
              @error="handleIframeError" @load="handleIframeLoad" />
            <div v-else class="flex items-center justify-center h-full bg-gray-50 text-gray-500">
              <p class="text-sm">No preview available</p>
            </div>
          </div>
        </div>

        <!-- Reviewer Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Reviewer Notes</label>
          <UTextarea v-model="reviewerNotes" :rows="3" placeholder="Add notes about this submission (optional)..." />
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton color="neutral" variant="ghost" :disabled="isReviewing" @click="close">
        Cancel
      </UButton>
      <div class="flex gap-3">
        <UButton color="error" size="lg" :disabled="isReviewing" :loading="isReviewing"
          @click="handleReview('rejected')" class="min-w-[120px]">
          <UIcon name="i-heroicons-x-circle" class="size-5" />
          Reject
        </UButton>
        <UButton color="success" size="lg" :disabled="isReviewing" :loading="isReviewing"
          @click="handleReview('approved')" class="min-w-[120px]">
          <UIcon name="i-heroicons-check-circle" class="size-5" />
          Accept
        </UButton>
      </div>
    </template>
  </UModal>
</template>
