<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

const props = defineProps<{
  manifest: Manifest
  activeKey?: string
  open?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', payload: { key: string; src: string; label: string }): void
}>()

const isOpen = computed({
  get: () => !!props.open,
  set: (v) => emit('update:open', v)
})

const { lock, unlock } = useBodyScrollLock()

watch(
  isOpen,
  (v) => {
    if (v) lock()
    else unlock()
  },
  { immediate: true }
)

onBeforeUnmount(() => unlock())

function toggle() {
  isOpen.value = !isOpen.value
}

function onSelect(payload: { key: string; src: string; label: string }) {
  emit('select', payload)
  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay (only when open) -->
    <div
      v-show="isOpen"
      class="fixed inset-0 z-40 bg-white/40 backdrop-blur-[1px]"
      aria-hidden="true"
      @click="isOpen = false"
    />

    <!-- Bottom sheet -->
    <section
      class="fixed inset-x-0 bottom-0 z-50"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
      aria-label="Project Explorer"
    >
      <div
        class="pv-sheet mx-auto flex w-full max-w-[720px] flex-col rounded-t-2xl border border-gray-200 bg-white shadow-[0_-10px_30px_rgba(17,24,39,0.08)]"
        :data-open="isOpen ? 'true' : 'false'"
        style="--pv-height: 75dvh; --pv-collapsed: 64px;"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 px-4 pt-3 pb-2"
          @click="toggle"
        >
          <span class="flex items-center gap-3">
            <span class="h-1.5 w-10 rounded-full bg-gray-300" aria-hidden="true" />
            <span class="text-sm font-medium text-gray-900">Project Explorer</span>
          </span>
          <UIcon
            :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
            class="h-5 w-5 text-gray-500"
            aria-hidden="true"
          />
        </button>

        <div class="h-px w-full bg-gray-200" />

        <div
          class="flex-1 overflow-auto px-3 pt-2 pb-6"
          :style="{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }"
        >
          <ProjectTree :manifest="manifest" :active-key="activeKey" @select="onSelect" />
        </div>
      </div>
    </section>
  </Teleport>
</template>

<style scoped>
.pv-sheet {
  height: var(--pv-height);
  transform: translateY(calc(var(--pv-height) - var(--pv-collapsed)));
  transition: transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

.pv-sheet[data-open='true'] {
  transform: translateY(0);
}
</style>

