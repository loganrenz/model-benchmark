<template>
  <div class="w-full">
    <UContainer class="py-8 lg:py-12">
      <div class="mx-auto max-w-4xl space-y-6">
        <UCard
          v-if="model"
          class="border border-slate-200/80 bg-white/90 shadow-md shadow-slate-900/5 ring-1 ring-slate-100"
        >
          <template #header>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="space-y-1">
                <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{{ model.id }}</p>
                <h2 class="text-2xl font-semibold text-slate-900">{{ model.title }}</h2>
                <p class="text-slate-600">{{ model.summary }}</p>
              </div>
              <UBadge color="gray" variant="soft" class="self-start">Placeholder</UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-slate-700 text-sm sm:text-base">
              This view is intentionally minimal. Loadouts from the project explorer appear here with ample padding and a clean
              frame so that model UIs can shine without distraction.
            </p>
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner shadow-slate-900/5">
              <iframe
                :src="model.path"
                title="Model preview"
                class="h-[320px] w-full border-0 bg-white sm:h-[420px]"
                loading="lazy"
              />
            </div>
          </div>
        </UCard>

        <UCard v-else class="border border-slate-200/80 bg-white/90 shadow-md shadow-slate-900/5 ring-1 ring-slate-100">
          <div class="space-y-4 py-10 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <UIcon name="i-heroicons-inbox-20-solid" class="h-6 w-6 text-slate-300" />
            </div>
            <div class="space-y-1">
              <p class="text-lg font-semibold text-slate-900">No model selected</p>
              <p class="text-sm text-slate-600">Open the Project Explorer to pick a model placeholder and load it here.</p>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { ModelNode } from '~/types/navigation';

defineProps<{
  model: ModelNode | null;
}>();
</script>
