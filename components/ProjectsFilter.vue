<script setup lang="ts">
import type { Project } from '~/types/prompt'

interface Props {
  projects: Project[]
}

const props = defineProps<Props>()
const { projects } = toRefs(props)

const emit = defineEmits<{
  'update:filtered': [projects: Project[]]
}>()

const searchQuery = ref('')
const sortBy = ref<'name' | 'submissions' | 'newest'>('name')
const showZeroSubmissions = ref(true)

const filteredAndSortedProjects = computed(() => {
  let result = [...projects.value]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(project => 
      project.label.toLowerCase().includes(query) ||
      project.id.toLowerCase().includes(query)
    )
  }

  // Apply zero submissions filter
  if (!showZeroSubmissions.value) {
    result = result.filter(project => (project.models?.length || 0) > 0)
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'submissions':
        return (b.models?.length || 0) - (a.models?.length || 0)
      case 'newest':
        // If we had createdAt, we'd sort by that
        return b.label.localeCompare(a.label)
      case 'name':
      default:
        return a.label.localeCompare(b.label)
    }
  })

  return result
})

// Emit filtered projects whenever they change
watch(filteredAndSortedProjects, (newProjects) => {
  emit('update:filtered', newProjects)
}, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <!-- Search and controls row -->
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Search input -->
      <div class="flex-1 relative">
        <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
        />
      </div>

      <!-- Sort dropdown -->
      <select
        v-model="sortBy"
        class="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
      >
        <option value="name">Sort by Name</option>
        <option value="submissions">Sort by Submissions</option>
        <option value="newest">Sort by Newest</option>
      </select>

      <!-- Filter toggle -->
      <button
        @click="showZeroSubmissions = !showZeroSubmissions"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium"
        :class="showZeroSubmissions 
          ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
          : 'border-indigo-500 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'"
      >
        <UIcon :name="showZeroSubmissions ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'" class="size-4" />
        <span class="hidden sm:inline">{{ showZeroSubmissions ? 'Show All' : 'Hide Empty' }}</span>
      </button>
    </div>

    <!-- Results count -->
    <div class="flex items-center justify-between text-sm">
      <p class="text-gray-600">
        Showing <span class="font-semibold text-gray-900">{{ filteredAndSortedProjects.length }}</span> 
        of <span class="font-semibold text-gray-900">{{ projects.length }}</span> projects
      </p>
      <button
        v-if="searchQuery || !showZeroSubmissions"
        @click="searchQuery = ''; showZeroSubmissions = true"
        class="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        <UIcon name="i-heroicons-x-mark" class="size-4" />
        Clear filters
      </button>
    </div>
  </div>
</template>
