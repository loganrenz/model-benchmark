<script setup lang="ts">
interface Breadcrumb {
  label: string
  to?: string
  icon?: string
}

const props = defineProps<{
  breadcrumbs?: Breadcrumb[]
  dark?: boolean
  fullWidth?: boolean
  noPadding?: boolean
}>()
</script>

<template>
  <div 
    class="min-h-screen flex flex-col"
    :class="dark 
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
      : 'bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100'"
  >
    <AppHeader :breadcrumbs="breadcrumbs" :dark="dark">
      <template #actions>
        <slot name="header-actions">
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
      </template>
    </AppHeader>

    <main 
      class="flex-1"
      :class="[
        fullWidth ? '' : 'max-w-7xl mx-auto w-full',
        noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-8 lg:py-12'
      ]"
    >
      <slot />
    </main>
  </div>
</template>

