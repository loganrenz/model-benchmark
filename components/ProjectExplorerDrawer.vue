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
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      @click="isOpen = false"
    />
  </Transition>

  <!-- Drawer -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-5rem)]'"
  >
    <div class="mx-auto flex max-w-4xl flex-col rounded-t-3xl border border-gray-200 bg-white shadow-2xl" style="height: 85vh;">
      <!-- Handle Bar -->
      <button
        class="group flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 transition-colors hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-3">
          <div class="h-1.5 w-12 rounded-full bg-gray-300 transition-colors group-hover:bg-blue-400" />
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-squares-2x2" class="size-5 text-gray-600 transition-colors group-hover:text-blue-600" />
            <span class="text-base font-bold text-gray-900">Project Explorer</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-500">{{ isOpen ? 'Tap to collapse' : 'Tap to expand' }}</span>
          <div class="rounded-full bg-gray-100 p-1.5 transition-all group-hover:bg-blue-100">
            <UIcon
              :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
              class="size-5 text-gray-600 transition-all group-hover:text-blue-600"
            />
          </div>
        </div>
      </button>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-6">
        <ProjectTree
          v-if="manifest"
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
        <div v-else class="flex h-64 items-center justify-center">
          <div class="text-center">
            <div class="mb-4 inline-block animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 size-10"></div>
            <p class="text-sm font-medium text-gray-500">Loading projects...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
