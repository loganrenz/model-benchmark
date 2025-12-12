<script setup lang="ts">
import type { ManifestModel } from '../lib/manifest'

const props = defineProps<{
  model: ManifestModel | null
  loading?: boolean
  error?: string | null
}>
</script>

<template>
  <section class="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-lg shadow-slate-900/5">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Model output</p>
        <h2 class="text-xl font-semibold text-slate-900">{{ model ? model.label : 'Select a model' }}</h2>
      </div>
      <UBadge v-if="model" color="gray" variant="soft">HTML</UBadge>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center text-slate-500">
      <ULoader size="lg" />
    </div>

    <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-600">
      <UIcon name="i-heroicons-exclamation-triangle" class="h-7 w-7 text-amber-600" />
      <p class="text-sm">{{ error }}</p>
    </div>

    <div v-else class="preview-surface flex min-h-[320px] flex-1 flex-col overflow-hidden">
      <div v-if="!model" class="flex flex-1 flex-col items-center justify-center gap-2 text-slate-500">
        <UIcon name="i-heroicons-arrow-down-tray" class="h-6 w-6" />
        <p class="text-sm">Open the project explorer to load a model preview.</p>
      </div>
      <iframe
        v-else
        key="preview"
        :src="model.path"
        title="Model preview"
        class="h-full w-full flex-1 border-0 bg-white"
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  </section>
</template>
