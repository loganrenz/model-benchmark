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
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 bg-black/30 cursor-pointer transition-opacity duration-300"
    @click="isOpen = false"
    aria-label="Close drawer"
  />

  <!-- Drawer -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4.5rem)]'"
    style="max-height: 90vh;"
  >
    <div class="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl" style="height: 90vh;">
      <!-- Handle -->
      <button
        class="group flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 transition-colors active:bg-gray-100"
        @click="isOpen = !isOpen"
        aria-label="Toggle project drawer"
      >
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-center justify-center">
            <div class="h-1 w-12 rounded-full bg-gray-300 transition-colors group-active:bg-gray-400" />
          </div>
          <span class="text-base font-semibold text-gray-900">Projects</span>
          <div
            v-if="activeKey"
            class="ml-1 flex h-2 w-2 rounded-full bg-blue-500"
          />
        </div>
        
        <UIcon
          :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
          class="h-5 w-5 text-gray-500 transition-transform duration-300"
          :class="isOpen ? 'rotate-180' : 'rotate-0'"
        />
      </button>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-5 py-6" style="-webkit-overflow-scrolling: touch;">
        <ProjectTree
          v-if="manifest"
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
        <div v-else class="flex items-center justify-center p-8">
          <p class="text-sm text-gray-500">Loading projects...</p>
        </div>
        <!-- Bottom spacing for safe area -->
        <div class="h-8" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>
