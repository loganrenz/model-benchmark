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
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm cursor-pointer"
        @click="isOpen = false"
        aria-label="Close drawer"
      />
    </Transition>
  </Teleport>

  <!-- Drawer -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out will-change-transform"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4.5rem)]'"
    style="max-height: 92vh; touch-action: pan-y;"
  >
    <div class="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-t-3xl border-x border-t border-gray-200/80 bg-white shadow-2xl backdrop-blur-xl" style="height: 92vh;">
      <!-- Handle -->
      <button
        class="group relative flex w-full items-center justify-between border-b border-gray-200/60 bg-gradient-to-b from-white via-gray-50/30 to-gray-50/50 px-6 py-4 transition-all hover:bg-gray-50/80 active:scale-[0.99]"
        @click="isOpen = !isOpen"
        aria-label="Toggle project drawer"
      >
        <!-- Subtle gradient overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 transition-opacity group-hover:opacity-5" />
        
        <div class="relative flex items-center gap-3">
          <div class="flex flex-col items-center justify-center">
            <div class="h-1 w-12 rounded-full bg-gray-300 shadow-sm transition-all group-hover:w-14 group-hover:bg-gray-400 group-active:w-10" />
          </div>
          <span class="text-base font-semibold tracking-tight text-gray-900">Projects</span>
          <div
            v-if="activeKey"
            class="ml-1 flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm"
          />
        </div>
        
        <UIcon
          :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
          class="relative h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-gray-700"
          :class="isOpen ? 'rotate-180' : 'rotate-0'"
        />
      </button>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-6 pb-safe" style="-webkit-overflow-scrolling: touch;">
        <ProjectTree
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
        <!-- Bottom spacing for safe area -->
        <div class="h-6" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>
