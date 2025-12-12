<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui/dist/runtime/components/Tree.vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    items: TreeItem[]
    selected: TreeItem | null
    expanded: string[]
    loading?: boolean
  }>(),
  {
    loading: false
  }
)

const emit = defineEmits<{
  (event: 'toggle'): void
  (event: 'close'): void
  (event: 'select', item: TreeItem): void
  (event: 'update:expanded', value: string[]): void
  (event: 'update:selected', value: TreeItem | null): void
}>()

const drawerHeight = computed(() => '75dvh')

const onSelect = (item: TreeItem) => {
  emit('update:selected', item)
  emit('select', item)
}

const onUpdateExpanded = (value: string[]) => {
  emit('update:expanded', value)
}
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-40 lg:relative lg:mx-auto lg:w-full lg:max-w-5xl">
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-30 bg-slate-900/10 backdrop-blur-[2px] lg:hidden"
        @click="emit('close')"
      />
    </transition>

    <div
      class="safe-area-bottom drawer-shadow lg:relative lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white"
      :class="[
        'bg-white lg:mt-0 lg:translate-y-0 lg:opacity-100',
        open ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%-44px)] opacity-100',
        'transition-transform duration-250 ease-out'
      ]"
      :style="{ height: open ? drawerHeight : 'auto' }"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-t-3xl border-b border-slate-200 bg-white px-4 pb-3 pt-2 lg:hidden"
        @click="emit('toggle')"
      >
        <div class="flex flex-1 flex-col items-center gap-1">
          <span class="drawer-handle" />
          <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <UIcon :name="open ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'" class="h-4 w-4 text-slate-500" />
            <span>Project Explorer</span>
            <span class="text-xs font-medium text-slate-500">projects/</span>
          </div>
        </div>
      </button>

      <div class="hidden items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-4 py-3 lg:flex">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <UIcon name="i-heroicons-folder" class="h-4 w-4 text-slate-500" />
          <span>Project Explorer</span>
        </div>
        <UBadge color="gray" variant="soft">File tree</UBadge>
      </div>

      <div
        class="flex flex-col gap-3 bg-white px-3 pb-4 pt-2 lg:max-h-[calc(100dvh-180px)] lg:overflow-auto"
        :style="{ height: open ? drawerHeight : '0px' }"
      >
        <div class="tree-surface px-2 py-1">
          <div class="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>projects/</span>
            <span class="text-slate-400">{{ loading ? 'Loading...' : 'Tap a model' }}</span>
          </div>
          <div class="max-h-[60dvh] overflow-auto px-1 pb-2">
            <UTree
              v-if="items.length"
              :items="items"
              :expanded="expanded"
              :default-expanded="['root']"
              :get-key="(item) => (item as any).key || (item as any).label"
              :model-value="selected"
              color="gray"
              size="lg"
              selection-behavior="single"
              bubble-select
              class="py-1"
              @update:model-value="onSelect"
              @update:expanded="onUpdateExpanded"
              @select="(_, item) => onSelect(item as TreeItem)"
            >
              <template #item-label="{ item, level }">
                <span
                  class="flex w-full items-center gap-2 truncate"
                  :class="level === 1 ? 'text-sm font-semibold text-slate-800' : 'text-[15px] text-slate-800'"
                >
                  <span class="truncate">{{ (item as any).label }}</span>
                  <span v-if="!(item as any).children" class="text-[11px] uppercase tracking-[0.14em] text-slate-400">html</span>
                </span>
              </template>
              <template #item-leading="{ item }">
                <UIcon
                  v-if="(item as any).children?.length"
                  :name="'i-heroicons-folder'"
                  class="h-4 w-4 text-amber-600"
                />
                <UIcon v-else :name="'i-heroicons-document-text'" class="h-4 w-4 text-slate-500" />
              </template>
            </UTree>
            <div v-else class="px-3 py-6 text-sm text-slate-500">Manifest is empty.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
