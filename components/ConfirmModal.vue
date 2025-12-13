<script setup lang="ts">
interface Props {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'warning'
})

const emit = defineEmits<{
  confirmed: []
  cancelled: []
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

function handleConfirm() {
  emit('confirmed')
  isOpen.value = false
}

function handleCancel() {
  emit('cancelled')
  isOpen.value = false
}

// Handle Escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    handleCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Focus management - UModal handles this automatically

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'danger':
      return {
        button: 'bg-red-600 hover:bg-red-700 text-white',
        icon: 'text-red-600',
        iconBg: 'bg-red-50'
      }
    case 'warning':
      return {
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-50'
      }
    default:
      return {
        button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-50'
      }
  }
})
</script>

<template>
  <UModal v-model:open="isOpen" :title="title" :ui="{ footer: 'justify-end' }">
    <template #body>
      <div class="space-y-4">
        <div class="flex items-start gap-4">
          <div :class="['flex size-12 items-center justify-center rounded-xl flex-shrink-0', variantClasses.iconBg]">
            <UIcon 
              :name="variant === 'danger' ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-information-circle'" 
              :class="['size-6', variantClasses.icon]"
            />
          </div>
          <p class="text-sm text-gray-700 leading-relaxed pt-1">{{ message }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton 
        color="neutral" 
        variant="outline" 
        @click="handleCancel"
        aria-label="Cancel"
      >
        {{ cancelText }}
      </UButton>
      <UButton 
        :color="variant === 'danger' ? 'error' : variant === 'warning' ? 'amber' : 'primary'"
        @click="handleConfirm"
        aria-label="Confirm"
      >
        {{ confirmText }}
      </UButton>
    </template>
  </UModal>
</template>

