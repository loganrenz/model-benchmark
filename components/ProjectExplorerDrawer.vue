<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

const props = defineProps<{
  manifest: Manifest
  activeKey?: string
  open?: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  select: [{ key: string; src: string; label: string }]
}>()

const isOpen = computed({
  get: () => props.open ?? false,
  set: (v) => emit('update:open', v)
})

const { lock, unlock } = useBodyScrollLock()

watch(isOpen, (open) => {
  if (open) lock()
  else unlock()
})

onUnmounted(() => unlock())

function handleSelect(payload: { key: string; src: string; label: string }) {
  emit('select', payload)
}
</script>

<template>
  <!-- Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      @click="isOpen = false"
    />
  </Transition>

  <!-- Drawer -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'"
  >
    <div 
      class="mx-auto flex max-w-2xl flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl"
      style="height: 80vh;"
    >
      <!-- Handle -->
      <button
        class="flex w-full items-center justify-between px-6 py-4"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-4">
          <div class="h-1 w-8 rounded-full bg-gray-300"></div>
          <span class="text-base font-semibold text-gray-900">Projects</span>
          <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {{ manifest.projects.length }}
          </span>
        </div>
        
        <div class="flex items-center gap-2 text-gray-400">
          <span class="hidden text-xs sm:inline">{{ isOpen ? 'Close' : 'Open' }}</span>
          <UIcon
            :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
            class="size-5"
          />
        </div>
      </button>

      <!-- Divider -->
      <div class="h-px bg-gray-100"></div>

      <!-- Content -->
      <div class="safe-bottom flex-1 overflow-y-auto p-4">
        <ProjectTree
          v-if="manifest"
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
        
        <div v-else class="flex h-48 items-center justify-center">
          <div class="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"></div>
        </div>
      </div>
    </div>
  </div>
</template>
