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
    enter-active-class="transition-all duration-400 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
      @click="isOpen = false"
    />
  </Transition>

  <!-- Drawer -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 transition-all duration-500"
    :class="isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4.5rem)]'"
    :style="{ 
      transitionTimingFunction: isOpen ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)' 
    }"
  >
    <div 
      class="safe-bottom mx-auto flex max-w-4xl flex-col overflow-hidden rounded-t-[2rem] shadow-2xl" 
      style="height: 85dvh; max-height: 85vh;"
    >
      <!-- Frosted Glass Background -->
      <div class="absolute inset-0 bg-white/90 backdrop-blur-2xl"></div>
      
      <!-- Gradient Border Top -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
      
      <!-- Handle Bar -->
      <button
        class="group relative flex w-full items-center justify-between px-6 py-5 transition-colors"
        @click="isOpen = !isOpen"
      >
        <!-- Background hover effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-purple-50/50 to-pink-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        
        <div class="relative flex items-center gap-4">
          <!-- Drag Handle -->
          <div class="flex flex-col items-center gap-1">
            <div class="h-1 w-10 rounded-full bg-gray-300 transition-all duration-300 group-hover:w-12 group-hover:bg-indigo-400"></div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50 blur transition-opacity group-hover:opacity-75"></div>
              <div class="relative rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <UIcon name="i-heroicons-squares-2x2" class="size-5 text-white" />
              </div>
            </div>
            <div>
              <span class="text-base font-bold text-gray-900">Project Explorer</span>
              <p class="text-xs text-gray-500">{{ manifest.projects.length }} projects available</p>
            </div>
          </div>
        </div>
        
        <div class="relative flex items-center gap-3">
          <span class="hidden text-xs font-medium text-gray-400 sm:block">
            {{ isOpen ? 'Collapse' : 'Expand' }}
          </span>
          <div class="rounded-full bg-gray-100 p-2 transition-all duration-300 group-hover:bg-indigo-100 group-hover:shadow-md">
            <UIcon
              :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
              class="size-5 text-gray-500 transition-all duration-300 group-hover:text-indigo-600"
              :class="isOpen ? '' : 'animate-bounce'"
            />
          </div>
        </div>
      </button>

      <!-- Divider -->
      <div class="relative mx-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <!-- Content -->
      <div class="relative flex-1 overflow-y-auto scroll-smooth px-4 py-5 sm:px-6">
        <!-- Subtle gradient background -->
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-indigo-50/20 to-purple-50/30"></div>
        
        <ProjectTree
          v-if="manifest"
          :manifest="manifest"
          :active-key="activeKey"
          @select="handleSelect"
        />
        <div v-else class="flex h-64 items-center justify-center">
          <div class="text-center">
            <div class="float mb-4 inline-block">
              <div class="spinner-premium"></div>
            </div>
            <p class="text-sm font-medium text-gray-500">Loading projects...</p>
          </div>
        </div>
      </div>

      <!-- Bottom Safe Area Padding -->
      <div class="relative h-2 bg-gradient-to-b from-white/80 to-white/50"></div>
    </div>
  </div>
</template>
