<template>
  <div class="p-4 space-y-4">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 px-2">Projects</p>
    <div
      v-for="project in projects"
      :key="project.id"
      class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <UIcon name="i-heroicons-folder" class="text-sky-500" />
        <div class="min-w-0">
          <p class="font-semibold text-slate-900 truncate">{{ project.title }}</p>
          <p class="text-sm text-slate-500 truncate">{{ project.description || 'Models and experiments' }}</p>
        </div>
      </div>
      <div class="divide-y divide-slate-100">
        <button
          v-for="model in project.models"
          :key="model.id"
          type="button"
          class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition"
          :class="model.id === selectedModelId ? 'bg-sky-50 text-sky-700' : 'text-slate-800'"
          @click="onSelect(project, model)"
        >
          <UIcon name="i-heroicons-document-text" class="text-slate-400" />
          <div class="min-w-0">
            <p class="font-medium truncate">{{ model.title }}</p>
            <p class="text-sm text-slate-500 truncate">{{ model.summary || 'Placeholder implementation' }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelNode, ProjectNode } from '~/types/navigation';

const props = defineProps<{
  projects: ProjectNode[];
  selectedModelId?: string;
}>();

const emit = defineEmits<{
  (event: 'select', payload: { project: ProjectNode; model: ModelNode }): void;
}>();

const onSelect = (project: ProjectNode, model: ModelNode) => {
  emit('select', { project, model });
};
</script>
