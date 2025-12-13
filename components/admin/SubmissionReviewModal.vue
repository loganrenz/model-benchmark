<script setup lang="ts">
import type { Submission } from '~/types/submission'
import html2canvas from 'html2canvas'

interface Props {
  submission: Submission | null
  reviewerNotes: string
  isReviewing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  review: [status: 'approved' | 'rejected', thumbnail?: string]
  'update:reviewerNotes': [value: string]
}>()

const localNotes = computed({
  get: () => props.reviewerNotes,
  set: (value) => emit('update:reviewerNotes', value)
})

const isOpen = computed({
  get: () => !!props.submission,
  set: (value) => {
    if (!value) emit('close')
  }
})

const iframeRef = ref<HTMLIFrameElement | null>(null)
const isGeneratingThumbnail = ref(false)
const thumbnailDataUrl = ref<string | null>(null)

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

async function generateThumbnail() {
  if (!iframeRef.value?.contentWindow?.document.body) {
    console.error('Iframe not loaded')
    return null
  }

  isGeneratingThumbnail.value = true
  
  try {
    // Wait a moment for animations to settle
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Capture the iframe content
    const canvas = await html2canvas(iframeRef.value.contentWindow.document.body, {
      width: 800,
      height: 600,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    })
    
    // Convert to JPEG data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    thumbnailDataUrl.value = dataUrl
    return dataUrl
  } catch (error) {
    console.error('Failed to generate thumbnail:', error)
    return null
  } finally {
    isGeneratingThumbnail.value = false
  }
}

async function handleReview(status: 'approved' | 'rejected') {
  // Generate thumbnail when approving
  let thumbnail: string | undefined
  if (status === 'approved') {
    thumbnail = await generateThumbnail() || undefined
  }
  emit('review', status, thumbnail)
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold text-gray-900">Review Submission</h3>
            <UButton
              color="neutral"
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
              :rows="3"
              placeholder="Add notes about this submission..."
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">Preview</label>
              <UButton
                size="xs"
                color="neutral"
                variant="outline"
                :loading="isGeneratingThumbnail"
                @click="generateThumbnail"
              >
                {{ thumbnailDataUrl ? 'Regenerate' : 'Generate' }} Thumbnail
              </UButton>
            </div>
            <div class="border border-gray-300 rounded-lg overflow-hidden" style="height: 600px;">
              <iframe
                ref="iframeRef"
                :srcdoc="submission.htmlContent"
                class="w-full h-full"
                title="Submission Preview"
              />
            </div>
            <div v-if="thumbnailDataUrl" class="mt-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Generated Thumbnail</label>
              <img :src="thumbnailDataUrl" alt="Thumbnail preview" class="border border-gray-300 rounded" style="max-width: 200px;" />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="success"
              :disabled="isReviewing || isGeneratingThumbnail"
              :loading="isReviewing"
              @click="handleReview('approved')"
            >
              Approve
            </UButton>
            <UButton
              color="error"
              :disabled="isReviewing || isGeneratingThumbnail"
              :loading="isReviewing"
              @click="handleReview('rejected')"
            >
              Reject
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              :disabled="isReviewing || isGeneratingThumbnail"
              @click="emit('close')"
            >
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

