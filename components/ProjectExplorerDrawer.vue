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
    class="fixed inset-0 z-40 bg-black/30"
    @click="isOpen = false"
  />

  <!-- Drawer -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'"
  >
    <div class="mx-auto flex max-w-3xl flex-col rounded-t-2xl border border-gray-200 bg-white shadow-xl" style="height: 80vh;">
      <!-- Handle -->
      <button
        class="flex w-full items-center justify-between border-b border-gray-200 px-4 py-3 hover:bg-gray-50"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-2">
          <div class="h-1 w-10 rounded-full bg-gray-300" />
          <span class="text-sm font-medium">Projects</span>
        </div>
        <UIcon
          :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
          class="size-5"
        />
      </button>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <ProjectTree
          v-if="manifest"
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
        <div v-else class="p-8 text-center text-sm text-gray-500">
          Loading...
        </div>
      </div>
    </div>
  </div>
</template>
