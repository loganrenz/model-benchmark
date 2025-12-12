<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

defineOptions({ name: 'ProjectViewerPage' })

const route = useRoute()
const router = useRouter()

const { data: manifest, error } = await useFetch<Manifest>('/api/manifest')

const drawerOpen = ref(false)

type Active = { key: string; src: string; label: string }
const active = ref<Active | null>(null)

function setActive(next: Active) {
  active.value = next
  router.replace({ query: { ...route.query, model: next.key } }).catch(() => {})
}

watch(
  manifest,
  (m) => {
    if (!m) return
    const q = typeof route.query.model === 'string' ? route.query.model : null

    // Try to restore from query, else default to first available model.
    let found: Active | null = null
    for (const p of m.projects) {
      for (const mod of p.models) {
        const key = `model:${p.id}/${mod.id}`
        if (q && q === key) {
          found = { key, src: `/projects/${p.folder}/${mod.file}`, label: mod.label }
          break
        }
      }
      if (found) break
    }

    if (!found) {
      const p0 = m.projects[0]
      const m0 = p0?.models?.[0]
      if (p0 && m0) {
        found = { key: `model:${p0.id}/${m0.id}`, src: `/projects/${p0.folder}/${m0.file}`, label: m0.label }
      }
    }

    if (found) active.value = found
  },
  { immediate: true }
)
</script>

<template>
  <div class="h-dvh w-full bg-white text-gray-900">
    <main class="h-full w-full overflow-hidden">
      <div v-if="error" class="mx-auto max-w-xl p-6">
        <UAlert color="red" variant="soft" title="Failed to load manifest">
          <template #description>
            <p class="text-sm text-gray-700">
              Ensure <code class="rounded bg-gray-100 px-1.5 py-0.5">public/data/manifest.json</code> exists and is valid JSON.
            </p>
          </template>
        </UAlert>
      </div>

      <div v-else-if="!active" class="mx-auto flex h-full max-w-md items-center justify-center p-6">
        <div class="text-center">
          <p class="text-sm text-gray-600">No model selected.</p>
          <button
            type="button"
            class="mt-3 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            @click="drawerOpen = true"
          >
            Open Project Explorer
          </button>
        </div>
      </div>

      <div v-else class="h-full w-full">
        <iframe
          :key="active.src"
          :src="active.src"
          class="h-full w-full border-0 bg-white"
          :title="active.label"
          loading="eager"
        />
      </div>
    </main>

    <ProjectExplorerDrawer
      v-if="manifest"
      v-model:open="drawerOpen"
      :manifest="manifest"
      :active-key="active?.key"
      @select="setActive"
    />
  </div>
</template>

