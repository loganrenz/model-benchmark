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

// Expose props for template usage
const { open, title, message, confirmText, cancelText, variant } = toRefs(props)

const isOpen = computed({
  get: () => open.value,
  set: (value) => emit('update:open', value)
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

function handleConfirm() {
  emit('confirmed')
  isOpen.value = false
}

function handleCancel() {
  emit('cancelled')
  isOpen.value = false
}

const variantClasses = computed(() => {
  switch (variant.value) {
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
  <UModal v-if="isMounted" v-model:open="isOpen" :title="title" :description="message" :ui="{ footer: 'justify-end' }">
    <template #body>
      <div class="flex items-start gap-4">
        <div :class="['flex size-12 items-center justify-center rounded-xl shrink-0', variantClasses.iconBg]">
          <UIcon :name="variant === 'danger' ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-information-circle'"
            :class="['size-6', variantClasses.icon]" />
        </div>
        <p class="text-sm text-gray-700 leading-relaxed pt-1">{{ message }}</p>
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="outline" @click="handleCancel" aria-label="Cancel">
        {{ cancelText }}
      </UButton>
      <UButton :color="variant === 'danger' ? 'error' : variant === 'warning' ? 'warning' : 'primary'"
        @click="handleConfirm" aria-label="Confirm">
        {{ confirmText }}
      </UButton>
    </template>
  </UModal>
</template>
