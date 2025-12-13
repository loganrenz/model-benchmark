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
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      @click="isOpen = false"
    />
  </Teleport>

  <!-- Drawer -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 max-h-screen transition-transform duration-300 md:max-h-[90vh]"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-5rem)]'"
  >
    <div class="mx-auto flex max-w-3xl flex-col rounded-t-2xl border border-gray-200 bg-white shadow-xl" style="height: 90vh; max-height: 100vh;">
      <!-- Handle -->
      <button
        class="flex w-full items-center justify-between border-b-2 border-gray-300 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 hover:from-blue-100 hover:to-purple-100"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-3">
          <div class="h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          <span class="text-base font-bold text-gray-900">Projects</span>
        </div>
        <UIcon
          :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
          class="h-6 w-6 text-gray-700"
        />
      </button>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto border-t border-gray-200 p-4">
        <ProjectTree
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
      </div>
    </div>
  </div>
</template>
