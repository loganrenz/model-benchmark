<script setup lang="ts">
import type { Project } from '~/types/prompt'

const { data: projectsData, error, pending } = await useFetch<{
  projects: Project[]
  total: number
}>('/api/projects?includeModels=true')
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <UIcon name="i-heroicons-cube-transparent" class="size-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                Showcase
              </h1>
              <p class="text-sm text-gray-600 font-medium">
                Compare AI implementations side by side
              </p>
            </div>
          </div>
          
          <NuxtLink
            to="/submit"
            class="hidden sm:flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all group"
          >
            <span>Submit</span>
            <UIcon name="i-heroicons-paper-airplane" class="size-4 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <!-- Error State -->
      <div v-if="error" class="flex flex-1 items-center justify-center p-8">
        <div class="w-full max-w-sm text-center">
          <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100/50">
            <UIcon name="i-heroicons-exclamation-triangle" class="size-9 text-red-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Failed to load</h2>
          <p class="mt-3 text-sm text-gray-600">
            Could not load projects. Please try again.
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
      <div v-else-if="pending" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="rounded-3xl bg-white/80 border border-gray-200/80 p-6 lg:p-8 animate-pulse">
            <div class="h-8 bg-gray-200 rounded-xl mb-4 w-3/4"></div>
            <div class="aspect-video bg-gray-200 rounded-2xl mb-4"></div>
            <div class="h-4 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-else-if="projectsData && projectsData.projects.length > 0">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ projectsData.total }} {{ projectsData.total === 1 ? 'Project' : 'Projects' }}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Browse implementations by project
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard
            v-for="project in projectsData.projects"
            :key="project.id"
            :project="project"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-1 items-center justify-center p-8">
        <div class="w-full max-w-md text-center">
          <div class="relative mx-auto mb-8">
            <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-3xl animate-pulse"></div>
            <div class="relative flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl shadow-indigo-200/50 border border-indigo-100/50">
              <UIcon name="i-heroicons-cube-transparent" class="size-14 text-indigo-600" />
            </div>
          </div>
          <h2 class="text-3xl font-black tracking-tight bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            No projects yet
          </h2>
          <p class="text-gray-600 text-lg font-medium mb-8">
            Projects will appear here once they're added to the showcase
          </p>
          <NuxtLink
            to="/submit"
            class="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 group"
          >
            <span>Submit Implementation</span>
            <UIcon name="i-heroicons-paper-airplane" class="size-5 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>
