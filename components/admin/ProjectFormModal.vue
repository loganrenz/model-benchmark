<script setup lang="ts">
import type { Project } from '~/types/prompt'

const props = defineProps<{
  project?: Project | null
  open: boolean
}>()

const emit = defineEmits<{
  saved: []
  'update:open': [value: boolean]
}>()

// Expose props for template usage
const { project, open } = toRefs(props)

const isOpen = computed({
  get: () => open.value,
  set: (value) => emit('update:open', value)
})

const form = ref({
  id: '',
  label: '',
  folder: ''
})
const isSaving = ref(false)
const { showSuccess, showError } = useNotifications()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// Reset form when modal opens
watch(open, (isOpenValue) => {
  if (isOpenValue) {
    if (project.value) {
      form.value = {
        id: project.value.id,
        label: project.value.label,
        folder: project.value.folder
      }
    } else {
      form.value = { id: '', label: '', folder: '' }
    }
  }
})

const canSave = computed(() => {
  return !isSaving.value && form.value.id && form.value.label && form.value.folder
})

async function save() {
  isSaving.value = true
  try {
    if (project.value) {
      await $fetch(`/api/admin/projects/${project.value.id}`, {
        method: 'PUT',
        body: {
          label: form.value.label,
          folder: form.value.folder
        }
      })
      showSuccess('Project updated successfully')
    } else {
      await $fetch('/api/admin/projects', {
        method: 'POST',
        body: form.value
      })
      showSuccess('Project created successfully')
    }
    emit('saved')
    isOpen.value = false
  } catch (error: any) {
    const { getErrorMessage } = useErrorHandler()
    showError(getErrorMessage(error))
  } finally {
    isSaving.value = false
  }
}

</script>

<template>
  <UModal 
    v-if="isMounted"
    v-model:open="isOpen" 
    :title="project ? 'Edit Project' : 'Create Project'" 
    :description="project ? 'Update project details' : 'Create a new project'" 
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Project ID <span class="text-red-500">*</span>
          </label>
          <UInput v-model="form.id" :disabled="!!project" placeholder="e.g., my-new-project" />
          <p class="mt-1 text-xs text-gray-500">Lowercase letters, numbers, and hyphens only</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Label <span class="text-red-500">*</span>
          </label>
          <UInput v-model="form.label" placeholder="e.g., My New Project" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Folder <span class="text-red-500">*</span>
          </label>
          <UInput v-model="form.folder" placeholder="e.g., my-new-project" />
          <p class="mt-1 text-xs text-gray-500">Folder name in public/projects/</p>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton color="neutral" variant="outline" @click="close">Cancel</UButton>
      <UButton color="primary" :disabled="!canSave" :loading="isSaving" @click="save">
        {{ project ? 'Update' : 'Create' }}
      </UButton>
    </template>
  </UModal>
</template>
