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

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const reviewerNotes = ref('')
const isReviewing = ref(false)
const { showSuccess, showError } = useNotifications()

// Reset notes when modal opens
watch(() => props.open, (isOpenValue) => {
  if (isOpenValue && props.submission) {
    reviewerNotes.value = props.submission.reviewerNotes || ''
  }
})

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

async function handleReview(status: 'approved' | 'rejected') {
  if (!props.submission) return

  isReviewing.value = true
  try {
    await $fetch(`/api/submissions/${props.submission.id}`, {
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

function closeModal() {
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Review Submission" :ui="{ footer: 'justify-end' }">
    <template #body>
      <div v-if="submission" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Project</label>
            <div class="mt-1 text-sm text-gray-900">{{ submission.projectId }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Agent Name</label>
            <div class="mt-1 text-sm text-gray-900">{{ submission.agentName }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Label</label>
            <div class="mt-1 text-sm text-gray-900">{{ submission.label }}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Submitted</label>
            <div class="mt-1 text-sm text-gray-900">{{ formatDate(submission.submittedAt) }}</div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Reviewer Notes</label>
          <UTextarea v-model="reviewerNotes" :rows="3" placeholder="Add notes about this submission..." />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
          <div class="border border-gray-300 rounded-lg overflow-hidden" style="height: 300px;">
            <iframe :srcdoc="submission.htmlContent" class="w-full h-full" title="Submission Preview" />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="outline" :disabled="isReviewing" @click="closeModal">
        Cancel
      </UButton>
      <UButton color="error" variant="soft" :disabled="isReviewing" :loading="isReviewing" @click="handleReview('rejected')">
        Reject
      </UButton>
      <UButton color="success" :disabled="isReviewing" :loading="isReviewing" @click="handleReview('approved')">
        Approve
      </UButton>
    </template>
  </UModal>
</template>

