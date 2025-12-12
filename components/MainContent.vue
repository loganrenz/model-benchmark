<template>
  <UContainer class="py-8">
    <UCard v-if="model" class="shadow-sm border border-slate-200">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p class="text-sm uppercase tracking-wide text-slate-500">{{ model.id }}</p>
            <h2 class="text-2xl font-semibold text-slate-900">{{ model.title }}</h2>
            <p class="text-slate-600 mt-1">{{ model.summary }}</p>
          </div>
          <UBadge color="gray" variant="soft">Placeholder</UBadge>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-slate-700 text-sm sm:text-base">
          This area will load the selected model implementation. The preview below currently points to a static placeholder
          file so that the structure is ready for future work.
        </p>
        <div class="aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <iframe
            :src="model.path"
            title="Model preview"
            class="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </UCard>

    <UCard v-else class="shadow-sm border border-slate-200">
      <div class="text-center space-y-3 py-8">
        <UIcon name="i-heroicons-inbox-20-solid" class="w-10 h-10 mx-auto text-slate-300" />
        <p class="text-slate-600">Select a project model from the sidebar to view its placeholder.</p>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import type { ModelNode } from '~/types/navigation';

defineProps<{
  model: ModelNode | null;
}>();
</script>
