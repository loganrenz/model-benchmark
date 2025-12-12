<template>
  <div class="min-h-screen bg-white text-slate-900">
    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <UContainer class="flex items-center justify-between gap-4 py-4">
        <div class="flex items-center gap-3">
          <UButton
            icon="i-heroicons-bars-3"
            variant="ghost"
            class="lg:hidden"
            aria-label="Open navigation"
            @click="isMobileMenuOpen = true"
          />
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Model Benchmark</p>
            <h1 class="text-xl font-semibold">Project Explorer</h1>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <UIcon name="i-heroicons-device-phone-mobile" />
          <span class="hidden sm:inline">Built with Nuxt UI</span>
        </div>
      </UContainer>
    </header>

    <div class="lg:grid lg:grid-cols-[300px_1fr]">
      <aside class="hidden lg:block border-r border-slate-200 min-h-[calc(100vh-80px)]">
        <SidebarTree
          :projects="projects"
          :selected-model-id="selectedModel?.id"
          @select="handleSelect"
        />
      </aside>
      <main class="min-h-[calc(100vh-80px)] bg-white">
        <MainContent :model="selectedModel" />
      </main>
    </div>

    <USlideover v-model="isMobileMenuOpen" side="left" class="lg:hidden" overlay>
      <template #title>Browse Projects</template>
      <SidebarTree
        :projects="projects"
        :selected-model-id="selectedModel?.id"
        @select="handleSelect"
      />
    </USlideover>
  </div>
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
const isMobileMenuOpen = ref(false);

const selectedProject = computed(() =>
  projects.value.find((project) => project.id === selectedProjectId.value) ?? null
);

const selectedModel = computed<ModelNode | null>(() => {
  if (!selectedProject.value) return null;
  return selectedProject.value.models.find((model) => model.id === selectedModelId.value) ?? null;
});

const handleSelect = ({ project, model }: { project: ProjectNode; model: ModelNode }) => {
  selectedProjectId.value = project.id;
  selectedModelId.value = model.id;
  isMobileMenuOpen.value = false;
};
</script>
