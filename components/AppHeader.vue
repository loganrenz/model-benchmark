<script setup lang="ts">
interface Breadcrumb {
  label: string
  to?: string
  icon?: string
}

const props = defineProps<{
  breadcrumbs?: Breadcrumb[]
  dark?: boolean
}>()

const route = useRoute()

// Determine if we're on the home page
const isHome = computed(() => route.path === '/')
</script>

<template>
  <header 
    class="sticky top-0 z-40 backdrop-blur-xl border-b shadow-sm"
    :class="dark 
      ? 'bg-slate-900/90 border-white/5' 
      : 'bg-white/80 border-gray-200/80'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 min-w-0">
          <!-- Logo/Home link -->
          <NuxtLink 
            to="/" 
            class="flex items-center gap-3 flex-shrink-0 group"
            :class="{ 'pointer-events-none': isHome }"
          >
            <div 
              class="flex size-10 lg:size-12 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-105"
              :class="dark 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'"
            >
              <UIcon name="i-heroicons-cube-transparent" class="size-5 lg:size-6 text-white" />
            </div>
            <div v-if="isHome || !breadcrumbs || breadcrumbs.length === 0">
              <h1 
                class="text-xl lg:text-2xl font-black tracking-tight"
                :class="dark ? 'text-white' : 'text-gray-900'"
              >
                Showcase
              </h1>
              <p 
                class="text-xs lg:text-sm font-medium hidden sm:block"
                :class="dark ? 'text-slate-400' : 'text-gray-600'"
              >
                Compare AI implementations
              </p>
            </div>
          </NuxtLink>

          <!-- Breadcrumbs -->
          <nav v-if="breadcrumbs && breadcrumbs.length > 0" class="flex items-center gap-2 min-w-0">
            <UIcon 
              name="i-heroicons-chevron-right" 
              class="size-4 flex-shrink-0"
              :class="dark ? 'text-slate-600' : 'text-gray-400'"
            />
            
            <template v-for="(crumb, index) in breadcrumbs" :key="index">
              <NuxtLink 
                v-if="crumb.to"
                :to="crumb.to"
                class="flex items-center gap-1.5 text-sm font-semibold transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                :class="dark 
                  ? 'text-slate-400 hover:text-white' 
                  : 'text-gray-500 hover:text-gray-900'"
              >
                <UIcon v-if="crumb.icon" :name="crumb.icon" class="size-4 flex-shrink-0" />
                <span class="truncate">{{ crumb.label }}</span>
              </NuxtLink>
              <span 
                v-else 
                class="flex items-center gap-1.5 text-sm font-bold truncate max-w-[150px] sm:max-w-[250px]"
                :class="dark ? 'text-white' : 'text-gray-900'"
              >
                <UIcon v-if="crumb.icon" :name="crumb.icon" class="size-4 flex-shrink-0" />
                <span class="truncate">{{ crumb.label }}</span>
              </span>
              
              <UIcon 
                v-if="index < breadcrumbs.length - 1"
                name="i-heroicons-chevron-right" 
                class="size-4 flex-shrink-0"
                :class="dark ? 'text-slate-600' : 'text-gray-400'"
              />
            </template>
          </nav>
        </div>
        
        <!-- Right side actions -->
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <slot name="actions">
            <!-- Default navigation links shown on home/project pages -->
            <NuxtLink
              to="/instructions"
              class="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
              :class="dark 
                ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'"
            >
              <UIcon name="i-heroicons-document-text" class="size-4" />
              <span>Instructions</span>
            </NuxtLink>
            <NuxtLink
              to="/submit"
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg active:scale-95 transition-all group"
              :class="dark 
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40' 
                : 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'"
            >
              <span class="hidden sm:inline">Submit</span>
              <UIcon name="i-heroicons-paper-airplane" class="size-4 group-hover:translate-x-0.5 transition-transform" />
            </NuxtLink>
          </slot>
        </div>
      </div>
    </div>
  </header>
</template>


