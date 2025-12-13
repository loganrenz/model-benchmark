<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

const route = useRoute()
const router = useRouter()

const { data: manifest, error } = await useFetch<Manifest>('/data/manifest.json', { 
  server: false 
})

const drawerOpen = ref(false)
const sidebarCollapsed = ref(false)

interface ActiveModel {
  key: string
  src: string
  label: string
}

const active = ref<ActiveModel | null>(null)

function selectModel(model: ActiveModel) {
  active.value = model
  router.replace({ query: { model: model.key } })
  drawerOpen.value = false
}

watchEffect(() => {
  if (!manifest.value) return
  
  const queryModel = route.query.model as string | undefined
  let found: ActiveModel | null = null

  if (queryModel) {
    for (const project of manifest.value.projects) {
      for (const model of project.models) {
        const key = `${project.id}/${model.id}`
        if (key === queryModel) {
          found = {
            key,
            src: `/projects/${project.folder}/${model.file}`,
            label: model.label
          }
          break
        }
      }
      if (found) break
    }
  }

  if (!found && manifest.value.projects.length > 0) {
    const project = manifest.value.projects[0]
    const model = project.models[0]
    if (project && model) {
      found = {
        key: `${project.id}/${model.id}`,
        src: `/projects/${project.folder}/${model.file}`,
        label: model.label
      }
    }
  }

  if (found && active.value?.key !== found.key) {
    active.value = found
  }
})
</script>

<template>
  <div class="flex min-h-screen h-dvh w-full bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
    <!-- Error State -->
    <div v-if="error" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100/50">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-9 text-red-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Failed to load</h1>
        <p class="mt-3 text-sm text-gray-600">
          Could not load manifest.json
        </p>
        <button 
          class="mt-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/25 active:scale-95 transition-all hover:shadow-xl hover:shadow-gray-900/30"
          @click="$router.go(0)"
        >
          Try again
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!manifest" class="flex flex-1 items-center justify-center">
      <div class="text-center">
        <div class="mx-auto mb-6 size-12 animate-spin rounded-full border-[3px] border-gray-200 border-t-indigo-600 shadow-lg"></div>
        <p class="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Desktop Sidebar -->
      <aside 
        class="hidden lg:flex lg:flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/80 shadow-2xl shadow-black/5 transition-all duration-500 ease-out"
        :class="sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'"
      >
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div v-if="!sidebarCollapsed" class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <UIcon name="i-heroicons-cube-transparent" class="size-5 text-white" />
            </div>
            <div>
              <h1 class="text-base font-bold text-gray-900 tracking-tight">
                Showcase
              </h1>
              <p class="text-xs text-gray-500 font-medium">
                {{ manifest.projects.length }} projects
              </p>
            </div>
          </div>
          <button 
            class="flex size-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            :class="sidebarCollapsed ? 'mx-auto' : ''"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <UIcon 
              :name="sidebarCollapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'" 
              class="size-4 text-gray-600"
            />
          </button>
        </div>

        <!-- Sidebar Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="!sidebarCollapsed">
            <ProjectTree
              v-if="manifest"
              :manifest="manifest"
              :active-key="active?.key"
              @select="selectModel"
            />
          </div>
          <div v-else class="flex flex-col items-center gap-4 py-2">
            <div 
              v-for="project in manifest.projects" 
              :key="project.id"
              class="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              :title="project.label"
            >
              <UIcon name="i-heroicons-folder" class="size-5 text-gray-600" />
            </div>
          </div>
        </div>

        <!-- Active Model Info (Desktop) -->
        <div v-if="active && !sidebarCollapsed" class="border-t border-gray-200/50 p-4">
          <div class="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 shadow-inner">
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <UIcon name="i-heroicons-play" class="size-4 text-indigo-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-indigo-600/70 uppercase tracking-wide">
                  Now Viewing
                </p>
                <p class="text-sm font-bold text-gray-900 truncate">
                  {{ active.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Viewer -->
      <main class="relative flex-1 flex flex-col overflow-hidden">
        <!-- Content Area -->
        <div class="flex-1 overflow-hidden rounded-tl-3xl lg:rounded-tl-none bg-white shadow-2xl shadow-black/10 relative">
          <iframe
            v-if="active"
            :key="active.src"
            :src="active.src"
            :title="active.label"
            class="size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          
          <!-- Empty State -->
          <div v-else class="flex h-full items-center justify-center p-8">
            <div class="max-w-md text-center">
              <div class="mx-auto mb-8 flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl shadow-indigo-100/50">
                <UIcon name="i-heroicons-cube-transparent" class="size-12 text-indigo-600" />
              </div>
              <h2 class="text-3xl font-bold tracking-tight text-gray-900 mb-3">
                Welcome
              </h2>
              <p class="text-gray-600 text-lg">
                Compare different AI implementations side by side
              </p>
              <button
                class="mt-10 lg:hidden inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-gray-900/30 active:scale-95 transition-all hover:shadow-gray-900/40"
                @click="drawerOpen = true"
              >
                <span>Browse projects</span>
                <UIcon name="i-heroicons-arrow-right" class="size-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Active Model Badge -->
        <div v-if="active" class="lg:hidden absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div class="rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl shadow-black/10 border border-gray-200/50 px-5 py-3">
            <div class="flex items-center gap-3">
              <div class="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <UIcon name="i-heroicons-cube" class="size-4 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                  Now Viewing
                </p>
                <p class="text-sm font-bold text-gray-900 truncate">
                  {{ active.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Mobile Drawer -->
      <div class="lg:hidden">
        <ProjectExplorerDrawer
          v-model:open="drawerOpen"
          :manifest="manifest"
          :active-key="active?.key"
          @select="selectModel"
        />
      </div>
    </template>
  </div>
</template>
