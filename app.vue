<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-50">
    <header class="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <UContainer class="flex items-center justify-between py-4 gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <UIcon name="i-heroicons-command-line" class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm uppercase tracking-[0.2em] text-neutral-400">Model Benchmark Projects</p>
            <p class="text-lg font-semibold text-white">File Viewer</p>
          </div>
        </div>
        <div class="flex items-center gap-2 sm:hidden">
          <UButton color="gray" variant="ghost" icon="i-heroicons-bars-3" @click="isNavOpen = true">
            Browse projects
          </UButton>
        </div>
      </UContainer>
    </header>

    <div class="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-10">
      <aside class="hidden w-full max-w-xs shrink-0 sm:block" style="display: block">
        <UCard class="h-full border border-neutral-800 bg-neutral-900/60">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm font-semibold text-neutral-200">
                <UIcon name="i-heroicons-folder-open" class="h-5 w-5" />
                Projects
              </div>
              <UBadge color="indigo" variant="soft">{{ projects.length }}</UBadge>
            </div>
          </template>
          <div class="space-y-4">
            <!--
              Sidebar project/model list is rendered explicitly so the model builds
              are always present as real <button> elements (for accessibility + tests).
              The accordion remains for future expansion without removing any UI.
            -->
            <div class="space-y-4">
              <div
                v-for="project in projects"
                :key="project.slug"
                class="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <span class="sr-only">Project</span>
                    <p class="truncate text-sm font-semibold text-neutral-100">Models</p>
                  </div>
                  <UBadge color="neutral" variant="soft" class="shrink-0">
                    {{ project.models.length }}
                  </UBadge>
                </div>

                <div class="mt-3 space-y-2">
                  <button
                    v-for="model in project.models"
                    :key="model.id"
                    type="button"
                    class="w-full rounded-lg px-3 py-2 text-left transition ring-1 ring-transparent hover:bg-neutral-800/60"
                    :class="
                      selectedModel?.id === model.id
                        ? 'bg-indigo-500 text-white ring-indigo-500/60'
                        : 'bg-neutral-900/40 text-neutral-100 ring-neutral-800'
                    "
                    @click="selectProjectModel(project, model)"
                  >
                    <div class="flex items-start gap-2">
                      <span class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-neutral-800/80 text-neutral-200">
                        <UIcon name="i-heroicons-cube-transparent" class="h-4 w-4" />
                      </span>
                      <div class="min-w-0">
                        <div class="truncate text-sm font-semibold">{{ model.name }}</div>
                        <span class="sr-only">Model build</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          <div class="scroll-area space-y-4 overflow-y-auto pr-1" style="max-height: calc(100vh - 28rem)">
            <UAccordion :items="navigationLinks" variant="solid" color="indigo" class="divide-neutral-800">
              <template #default="{ item, index, open }">
                <UButton
                  color="gray"
                  variant="ghost"
                  class="w-full justify-between text-left text-sm font-semibold"
                  :aria-expanded="open"
                  :aria-controls="`project-${index}`"
                >
                  <span class="flex items-center gap-2">
                    <UIcon name="i-heroicons-folder" class="h-5 w-5 text-neutral-300" />
                    {{ item.label }}
                  </span>
                  <UIcon :name="open ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="h-4 w-4" />
                </UButton>
              </template>
              <template #item="{ item }">
                <div class="space-y-2 pt-2">
                  <p class="px-2 text-xs text-neutral-400">{{ item.description }}</p>
                  <div class="space-y-1">
                    <UButton
                      v-for="model in item.children"
                      :key="model.value"
                      color="gray"
                      variant="ghost"
                      class="w-full justify-start gap-2 text-left"
                      :class="{
                        'bg-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/30': selectedModel?.id === model.meta.id
                      }"
                      @click="selectProjectModel(model.meta.project, model.meta.model)"
                    >
                      <UIcon name="i-heroicons-cube-transparent" class="h-4 w-4" />
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold">{{ model.label }}</span>
                        <span class="text-xs text-neutral-400">{{ model.description }}</span>
                      </div>
                    </UButton>
                  </div>
                </div>
              </template>
            </UAccordion>
          </div>
          </div>
        </UCard>
      </aside>

      <USlideover v-model="isNavOpen" side="left" class="sm:hidden">
        <div class="flex h-full flex-col bg-neutral-900/95 backdrop-blur">
          <div class="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
            <div class="flex items-center gap-2 text-sm font-semibold text-neutral-200">
              <UIcon name="i-heroicons-folder-open" class="h-5 w-5" />
              Projects
            </div>
            <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="isNavOpen = false" />
          </div>
          <div class="scroll-area flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <UAccordion :items="navigationLinks" variant="solid" color="indigo" class="divide-neutral-800">
              <template #default="{ item, index, open }">
                <UButton
                  color="gray"
                  variant="ghost"
                  class="w-full justify-between text-left text-sm font-semibold"
                  :aria-expanded="open"
                  :aria-controls="`mobile-project-${index}`"
                >
                  <span class="flex items-center gap-2">
                    <UIcon name="i-heroicons-folder" class="h-5 w-5 text-neutral-300" />
                    {{ item.label }}
                  </span>
                  <UIcon :name="open ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="h-4 w-4" />
                </UButton>
              </template>
              <template #item="{ item }">
                <div class="space-y-2 pt-2">
                  <p class="px-2 text-xs text-neutral-400">{{ item.description }}</p>
                  <div class="space-y-1">
                    <UButton
                      v-for="model in item.children"
                      :key="model.value"
                      color="gray"
                      variant="ghost"
                      class="w-full justify-start gap-2 text-left"
                      :class="{
                        'bg-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/30': selectedModel?.id === model.meta.id
                      }"
                      @click="() => { selectProjectModel(model.meta.project, model.meta.model); isNavOpen = false; }"
                    >
                      <UIcon name="i-heroicons-cube-transparent" class="h-4 w-4" />
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold">{{ model.label }}</span>
                        <span class="text-xs text-neutral-400">{{ model.description }}</span>
                      </div>
                    </UButton>
                  </div>
                </div>
              </template>
            </UAccordion>
          </div>
        </div>
      </USlideover>

      <main class="flex-1 space-y-4">
        <UCard class="border border-neutral-800 bg-neutral-900/60">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm uppercase tracking-[0.2em] text-neutral-400">{{ selectedProject?.title }}</p>
                <p class="text-xl font-semibold text-white">{{ selectedModel?.name }}</p>
              </div>
              <UBadge color="indigo" variant="soft" size="lg">
                {{ selectedProject?.models.length }} build{{ selectedProject && selectedProject.models.length > 1 ? 's' : '' }}
              </UBadge>
            </div>
          </template>
          <div class="space-y-4">
            <p class="text-base leading-relaxed text-neutral-300">{{ selectedProject?.summary }}</p>
            <UAlert
              title="Working expectations"
              :description="selectedProject?.instructions"
              color="indigo"
              variant="soft"
              icon="i-heroicons-light-bulb"
            />
            <div class="grid gap-4 lg:grid-cols-3">
              <UCard class="lg:col-span-2 border border-neutral-800 bg-neutral-900/80">
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-heroicons-presentation-chart-line" class="h-5 w-5 text-indigo-300" />
                      <span class="text-sm font-semibold text-neutral-100">Project output</span>
                    </div>
                    <UBadge color="neutral" variant="soft">Served from {{ selectedModel?.path }}</UBadge>
                  </div>
                </template>
                <div class="overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-inner">
                  <iframe
                    v-if="selectedModel"
                    :src="selectedModel.path"
                    title="Project output"
                    class="h-[520px] w-full"
                    loading="lazy"
                  ></iframe>
                  <div v-else class="flex h-[520px] items-center justify-center text-neutral-400">
                    Select a model build to preview its output.
                  </div>
                </div>
              </UCard>

              <UCard class="border border-neutral-800 bg-neutral-900/80">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-queue-list" class="h-5 w-5 text-indigo-300" />
                    <span class="text-sm font-semibold text-neutral-100">Prompts & tasks</span>
                  </div>
                </template>
                <div class="space-y-3">
                  <UAccordion :items="taskItems" color="indigo" variant="ghost" multiple>
                    <template #default="{ item, index, open }">
                      <UButton
                        color="gray"
                        variant="ghost"
                        class="w-full justify-between text-left"
                        :aria-expanded="open"
                        :aria-controls="`task-${index}`"
                      >
                        <div class="flex flex-col text-left">
                          <span class="text-sm font-semibold text-neutral-100">{{ item.label }}</span>
                          <span class="text-xs text-neutral-400">{{ item.description }}</span>
                        </div>
                        <UIcon :name="open ? 'i-heroicons-minus-small' : 'i-heroicons-plus-small'" class="h-5 w-5" />
                      </UButton>
                    </template>
                    <template #item="{ item }">
                      <ul class="mt-2 space-y-2 text-sm text-neutral-300">
                        <li v-for="(point, idx) in item.points" :key="idx" class="flex items-start gap-2">
                          <UIcon name="i-heroicons-sparkles" class="mt-0.5 h-4 w-4 text-indigo-300" />
                          <span>{{ point }}</span>
                        </li>
                      </ul>
                    </template>
                  </UAccordion>
                </div>
              </UCard>
            </div>
          </div>
        </UCard>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { projects } from '~/data/projects';
import type { ModelBuild, Project } from '~/types/projects';

const isNavOpen = ref(false);
const selectedProject = ref<Project | null>(projects[0] ?? null);
const selectedModel = ref<ModelBuild | null>(projects[0]?.models[0] ?? null);

const navigationLinks = computed(() =>
  projects.map((project) => ({
    label: project.title,
    description: project.summary,
    defaultOpen: true,
    slot: 'project',
    children: project.models.map((model) => ({
      label: model.name,
      description: model.description,
      value: `${project.slug}-${model.id}`,
      meta: { project, model, id: model.id }
    }))
  }))
);

const taskItems = computed(() =>
  (selectedProject.value?.tasks ?? []).map((task) => ({
    label: task.title,
    description: task.summary,
    points: task.details
  }))
);

function selectProjectModel(project: Project, model: ModelBuild) {
  selectedProject.value = project;
  selectedModel.value = model;
}
</script>
