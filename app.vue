<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-white text-slate-900">
      <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <UContainer class="flex items-center justify-between py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <UIcon name="i-heroicons-cube-transparent" class="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Model Benchmark</p>
              <h1 class="text-xl font-semibold text-slate-900">Project Explorer</h1>
            </div>
          </div>
          <div class="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <UIcon name="i-heroicons-device-phone-mobile" />
            <span class="hidden sm:inline">Optimized for mobile</span>
          </div>
        </UContainer>
      </header>

      <div class="flex-1 pb-28 lg:grid lg:grid-cols-[320px_1fr] lg:pb-0">
        <aside class="hidden border-r border-slate-200 bg-white/70 lg:block">
          <div class="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto px-2 py-6">
            <SidebarTree
              :projects="projects"
              :selected-model-id="selectedModel?.id"
              layout="sidebar"
              @select="handleSelect"
            />
          </div>
        </aside>
        <main class="bg-white">
          <MainContent :model="selectedModel" />
        </main>
      </div>

      <div class="lg:hidden">
        <transition name="fade">
          <div
            v-if="isExplorerOpen"
            class="fixed inset-0 z-30 bg-slate-900/5 backdrop-blur-[2px]"
            @click="isExplorerOpen = false"
          />
        </transition>
        <div class="fixed inset-x-0 bottom-0 z-40">
          <div class="mx-auto w-full max-w-screen-sm px-3 pb-3">
            <button
              type="button"
              class="mx-auto flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur"
              @click="toggleExplorer"
            >
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <UIcon :name="isExplorerOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'" />
              </span>
              <span>Project Explorer</span>
              <span class="text-xs font-medium text-slate-400">projects/</span>
            </button>

            <transition name="slide-up">
              <div
                v-if="isExplorerOpen"
                class="mt-3 max-h-[80vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
              >
                <div class="px-4 pb-1 pt-3">
                  <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span>Browse</span>
                    <span class="text-slate-500">Swipe down to close</span>
                  </div>
                </div>
                <div class="max-h-[70vh] overflow-y-auto px-1 pb-4">
                  <SidebarTree
                    :projects="projects"
                    :selected-model-id="selectedModel?.id"
                    @select="handleSelect"
                  />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import type { ModelNode, ProjectNode } from '~/types/navigation';

const projects = ref<ProjectNode[]>([
  {
    id: 'traffic-stoplight',
    title: 'Traffic Stoplight',
    description: 'Intersection traffic pattern demo with timed lights.',
    models: [
      {
        id: 'stoplight-placeholder',
        title: 'Stoplight Placeholder',
        path: '/projects/traffic-stoplight/placeholder/index.html',
        summary: 'Starter HTML scaffold ready for the traffic stoplight model.'
      }
    ]
  },
  {
    id: 'template-showcase',
    title: 'Template Showcase',
    description: 'Reserved for upcoming benchmark templates.',
    models: [
      {
        id: 'coming-soon',
        title: 'Coming Soon',
        path: '/projects/template-showcase/placeholder.html',
        summary: 'A lightweight placeholder to verify routing into new models.'
      }
    ]
  }
]);

const selectedProjectId = ref(projects.value[0]?.id ?? null);
const selectedModelId = ref(projects.value[0]?.models[0]?.id ?? null);
const isExplorerOpen = ref(false);

const selectedProject = computed(() =>
  projects.value.find((project) => project.id === selectedProjectId.value) ?? null
);

const selectedModel = computed<ModelNode | null>(() => {
  if (!selectedProject.value) return null;
  return selectedProject.value.models.find((model) => model.id === selectedModelId.value) ?? null;
});

const toggleExplorer = () => {
  isExplorerOpen.value = !isExplorerOpen.value;
};

const handleSelect = ({ project, model }: { project: ProjectNode; model: ModelNode }) => {
  selectedProjectId.value = project.id;
  selectedModelId.value = model.id;
  isExplorerOpen.value = false;
};
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(8px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
