<script setup lang="ts">
import type { Project } from '~/types/prompt'

interface Props {
  open: boolean
  project: Project | null
  form: {
    id: string
    label: string
    folder: string
  }
  isSaving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
  'update:form': [value: { id: string; label: string; folder: string }]
}>()

const localForm = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const canSave = computed(() => {
  return !props.isSaving && localForm.value.id && localForm.value.label && localForm.value.folder
})
</script>

<template>
  <UModal :model-value="open" @update:model-value="(val) => !val && emit('close')">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">
            {{ project ? 'Edit Project' : 'Create Project' }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="emit('close')"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Project ID
            <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="localForm.id"
            :disabled="!!project"
            placeholder="e.g., my-new-project"
          />
          <p class="mt-1 text-xs text-gray-500">Lowercase letters, numbers, and hyphens only</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Label
            <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="localForm.label"
            placeholder="e.g., My New Project"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Folder
            <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="localForm.folder"
            placeholder="e.g., my-new-project"
          />
          <p class="mt-1 text-xs text-gray-500">Folder name in public/projects/</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="indigo"
            :disabled="!canSave"
            @click="emit('save')"
          >
            {{ project ? 'Update' : 'Create' }}
          </UButton>
          <UButton
            color="gray"
            variant="ghost"
            :disabled="isSaving"
            @click="emit('close')"
          >
            Cancel
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

