<script setup lang="ts">
import type { Submission } from '~/types/submission'

interface Props {
  submission: Submission | null
  reviewerNotes: string
  isReviewing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  review: [status: 'approved' | 'rejected']
  'update:reviewerNotes': [value: string]
}>()

const localNotes = computed({
  get: () => props.reviewerNotes,
  set: (value) => emit('update:reviewerNotes', value)
})

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <UModal :model-value="!!submission" @update:model-value="(val) => !val && emit('close')">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-900">Review Submission</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="emit('close')"
          />
        </div>
      </template>

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
          <UTextarea
            v-model="localNotes"
            rows="3"
            placeholder="Add notes about this submission..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
          <div class="border border-gray-300 rounded-lg overflow-hidden" style="height: 600px;">
            <iframe
              :srcdoc="submission.htmlContent"
              class="w-full h-full"
              title="Submission Preview"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="green"
            :disabled="isReviewing"
            @click="emit('review', 'approved')"
          >
            Approve
          </UButton>
          <UButton
            color="red"
            :disabled="isReviewing"
            @click="emit('review', 'rejected')"
          >
            Reject
          </UButton>
          <UButton
            color="gray"
            variant="ghost"
            :disabled="isReviewing"
            @click="emit('close')"
          >
            Cancel
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

