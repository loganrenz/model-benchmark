<template>
  <div class="space-y-3 p-4">
    <div class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
      <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        <span>projects/</span>
        <span class="text-slate-500">{{ layout === 'sidebar' ? 'Pinned' : 'Drawer' }}</span>
      </div>
      <div class="mt-4 space-y-4">
        <div
          v-for="project in projects"
          :key="project.id"
          class="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-3 shadow-inner shadow-slate-900/5"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5 rounded-lg bg-white px-2 py-1 text-sky-600 shadow-sm ring-1 ring-slate-200">
              <UIcon name="i-heroicons-folder" class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900">{{ project.title }}</p>
              <p class="text-xs text-slate-500">{{ project.description || 'Models and experiments' }}</p>
            </div>
          </div>
          <div class="mt-3 space-y-1 pl-11">
            <button
              v-for="model in project.models"
              :key="model.id"
              type="button"
              class="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition"
              :class="
                model.id === selectedModelId
                  ? 'bg-white text-sky-700 ring-1 ring-sky-200'
                  : 'text-slate-800 hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-200'
              "
              @click="onSelect(project, model)"
            >
              <span
                class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm"
              >
                <UIcon name="i-heroicons-document-text" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <p class="font-medium leading-tight text-slate-900">{{ model.title }}</p>
                <p class="text-[12px] text-slate-500">{{ model.summary || 'Placeholder implementation' }}</p>
              </div>
              <span class="ml-auto text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">html</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelNode, ProjectNode } from '~/types/navigation';

withDefaults(
  defineProps<{
    projects: ProjectNode[];
    selectedModelId?: string;
    layout?: 'sidebar' | 'drawer';
  }>(),
  {
    layout: 'drawer'
  }
);

const emit = defineEmits<{
  (event: 'select', payload: { project: ProjectNode; model: ModelNode }): void;
}>();

const onSelect = (project: ProjectNode, model: ModelNode) => {
  emit('select', { project, model });
};
</script>
