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
    class="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'"
  >
    <div class="mx-auto max-w-3xl rounded-t-2xl border border-gray-200 bg-white shadow-xl">
      <!-- Handle -->
      <button
        class="flex w-full items-center justify-between px-6 py-4 hover:bg-gray-50"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-3">
          <div class="h-1 w-12 rounded-full bg-gray-300" />
          <span class="text-sm font-semibold text-gray-900">Projects</span>
        </div>
        <UIcon
          :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
          class="h-5 w-5 text-gray-500"
        />
      </button>

      <!-- Content -->
      <div class="max-h-[calc(75vh-4rem)] overflow-y-auto border-t border-gray-200 p-4">
        <ProjectTree
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
      </div>
    </div>
  </div>
</template>
