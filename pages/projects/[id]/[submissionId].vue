<script setup lang="ts">
import type { Submission } from '~/types/submission'
import type { Project, Model } from '~/types/prompt'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const submissionId = route.params.submissionId as string

// Fetch project info with models to find the submission
const { data: project } = await useFetch<Project>(
  `/api/projects/${projectId}?includeModels=true`
)

// Fetch submission info
const { data: submission, error: submissionError } = await useFetch<Submission>(
  `/api/submissions/${submissionId}`
)

// Breadcrumbs
const breadcrumbs = computed(() => {
  const crumbs = []
  if (project.value) {
    crumbs.push({
      label: project.value.label,
      to: `/projects/${projectId}`
    })
  }
  if (submission.value) {
    crumbs.push({
      label: submission.value.label
    })
  }
  return crumbs
})

const backUrl = computed(() => `/projects/${projectId}`)

// Navigation state
const allSubmissions = computed(() => project.value?.models || [])
const currentIndex = computed(() => {
  return allSubmissions.value.findIndex(m => m.submissionId === submissionId)
})
const totalCount = computed(() => allSubmissions.value.length)
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < totalCount.value - 1)

const previousSubmission = computed(() => {
  if (hasPrevious.value) {
    return allSubmissions.value[currentIndex.value - 1]
  }
  return null
})

const nextSubmission = computed(() => {
  if (hasNext.value) {
    return allSubmissions.value[currentIndex.value + 1]
  }
  return null
})

// Transition state
const isTransitioning = ref(false)
const transitionDirection = ref<'left' | 'right'>('right')

function navigateTo(model: Model | null, direction: 'left' | 'right') {
  if (!model?.submissionId || isTransitioning.value) return
  transitionDirection.value = direction
  isTransitioning.value = true
  
  setTimeout(() => {
    router.push(`/projects/${projectId}/${model.submissionId}`)
  }, 150)
}

function goToPrevious() {
  navigateTo(previousSubmission.value, 'right')
}

function goToNext() {
  navigateTo(nextSubmission.value, 'left')
}

// Keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' && hasPrevious.value) {
    goToPrevious()
  } else if (e.key === 'ArrowRight' && hasNext.value) {
    goToNext()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const submissionSrc = computed(() => {
  if (submission.value && submission.value.status === 'approved') {
    return `/api/submissions/${submissionId}/content`
  }
  return null
})

const submissionHtmlContent = computed(() => {
  if (submission.value && submission.value.htmlContent) {
    return submission.value.htmlContent
  }
  return null
})

const submissionLabel = computed(() => {
  if (submission.value) {
    return submission.value.label
  }
  return 'Submission'
})

const hasError = computed(() => {
  return !!submissionError.value
})

function openInNewTab() {
  if (submissionSrc.value) {
    window.open(submissionSrc.value, '_blank')
  } else if (submissionHtmlContent.value) {
    const blob = new Blob([submissionHtmlContent.value], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // Clean up the URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
}

// Mobile scaling for wide content
const iframeContainerRef = ref<HTMLElement | null>(null)
const iframeScale = ref(1)
const scaledHeight = ref('100%')
const isMobile = ref(false)
const DESIGN_WIDTH = 1024 // Assume content designed for this width

function updateScale() {
  if (typeof window === 'undefined') return
  
  isMobile.value = window.innerWidth < 1024
  
  if (isMobile.value && iframeContainerRef.value) {
    const containerWidth = iframeContainerRef.value.clientWidth
    const containerHeight = iframeContainerRef.value.clientHeight
    // Scale down if viewport is smaller than design width
    if (containerWidth < DESIGN_WIDTH) {
      iframeScale.value = containerWidth / DESIGN_WIDTH
      // Height needs to be the container height divided by the scale factor
      // so that when scaled, it fits the container exactly
      scaledHeight.value = `${containerHeight / iframeScale.value}px`
    } else {
      iframeScale.value = 1
      scaledHeight.value = '100%'
    }
  } else {
    iframeScale.value = 1
    scaledHeight.value = '100%'
  }
}

onMounted(() => {
  // Initial update after DOM is ready
  nextTick(() => {
    updateScale()
  })
  window.addEventListener('resize', updateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<template>
  <div class="min-h-screen h-dvh w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 flex-shrink-0">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Logo/Home -->
            <NuxtLink 
              to="/" 
              class="flex items-center flex-shrink-0 group"
            >
              <div class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <UIcon name="i-heroicons-cube-transparent" class="size-4 text-white" />
              </div>
            </NuxtLink>

            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-2 min-w-0">
              <UIcon name="i-heroicons-chevron-right" class="size-4 text-slate-600 flex-shrink-0" />
              
              <NuxtLink 
                :to="backUrl"
                class="text-sm font-semibold text-slate-400 hover:text-white transition-colors truncate max-w-[100px] sm:max-w-[150px]"
              >
                {{ project?.label || 'Project' }}
              </NuxtLink>
              
              <UIcon name="i-heroicons-chevron-right" class="size-4 text-slate-600 flex-shrink-0" />
              
              <span class="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[200px]">
                {{ submissionLabel }}
              </span>
            </nav>
          </div>

          <!-- Center Navigation -->
          <div v-if="totalCount > 1" class="hidden sm:flex items-center gap-2">
            <button
              @click="goToPrevious"
              :disabled="!hasPrevious"
              class="flex size-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 active:scale-95"
              title="Previous (←)"
            >
              <UIcon name="i-heroicons-chevron-left" class="size-5 text-white" />
            </button>
            
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <span class="text-sm font-mono text-white">{{ currentIndex + 1 }}</span>
              <span class="text-sm text-slate-500">/</span>
              <span class="text-sm font-mono text-slate-400">{{ totalCount }}</span>
            </div>
            
            <button
              @click="goToNext"
              :disabled="!hasNext"
              class="flex size-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 active:scale-95"
              title="Next (→)"
            >
              <UIcon name="i-heroicons-chevron-right" class="size-5 text-white" />
            </button>
          </div>

          <button
            v-if="submissionSrc || submissionHtmlContent"
            @click="openInNewTab"
            class="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm font-medium text-white transition-all active:scale-95 flex-shrink-0"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4" />
            <span class="hidden sm:inline">Open</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Error State -->
    <div v-if="hasError" class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20">
          <UIcon name="i-heroicons-exclamation-triangle" class="size-9 text-red-400" />
        </div>
        <h2 class="text-2xl font-bold text-white">Submission not found</h2>
        <p class="mt-3 text-sm text-slate-400">
          The submission you're looking for doesn't exist or isn't approved.
        </p>
        <NuxtLink
          :to="backUrl"
          class="mt-8 inline-block rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-8 py-3 text-sm font-semibold text-white active:scale-95 transition-all"
        >
          Go back
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!submissionSrc && !submissionHtmlContent" class="flex flex-1 items-center justify-center">
      <div class="text-center">
        <div class="mx-auto mb-6 size-12 animate-spin rounded-full border-[3px] border-white/10 border-t-cyan-400"></div>
        <p class="text-sm font-medium text-slate-400">Loading submission...</p>
      </div>
    </div>

    <!-- Carousel Viewer -->
    <div v-else class="flex-1 overflow-hidden relative">
      <!-- Previous Preview (Desktop) -->
      <div 
        v-if="previousSubmission && totalCount > 1"
        class="hidden lg:block absolute left-0 top-0 bottom-0 w-20 z-20 group cursor-pointer"
        @click="goToPrevious"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
          <div class="flex size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <UIcon name="i-heroicons-chevron-left" class="size-6 text-white" />
          </div>
          <span class="text-[10px] font-medium text-white/70 max-w-16 text-center truncate">{{ previousSubmission.label }}</span>
        </div>
      </div>

      <!-- Next Preview (Desktop) -->
      <div 
        v-if="nextSubmission && totalCount > 1"
        class="hidden lg:block absolute right-0 top-0 bottom-0 w-20 z-20 group cursor-pointer"
        @click="goToNext"
      >
        <div class="absolute inset-0 bg-gradient-to-l from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <div class="flex size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <UIcon name="i-heroicons-chevron-right" class="size-6 text-white" />
          </div>
          <span class="text-[10px] font-medium text-white/70 max-w-16 text-center truncate">{{ nextSubmission.label }}</span>
        </div>
      </div>

      <!-- Main Content -->
      <div 
        class="absolute inset-0 lg:inset-x-4 lg:inset-y-3 transition-all duration-300"
        :class="{
          'opacity-0 scale-[0.98]': isTransitioning,
          'translate-x-8': isTransitioning && transitionDirection === 'left',
          '-translate-x-8': isTransitioning && transitionDirection === 'right'
        }"
      >
        <div 
          ref="iframeContainerRef"
          class="size-full rounded-none lg:rounded-2xl overflow-hidden bg-white shadow-2xl shadow-black/50 ring-1 ring-white/10"
        >
          <!-- Scaled iframe wrapper for mobile -->
          <div 
            class="origin-top-left lg:size-full"
            :style="isMobile ? {
              width: `${DESIGN_WIDTH}px`,
              height: scaledHeight,
              transform: `scale(${iframeScale})`,
            } : {
              width: '100%',
              height: '100%'
            }"
          >
            <iframe
              v-if="submissionSrc"
              :src="submissionSrc"
              :title="submissionLabel"
              class="size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            <iframe
              v-else-if="submissionHtmlContent"
              :srcdoc="submissionHtmlContent"
              :title="submissionLabel"
              class="size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Dots -->
      <div v-if="totalCount > 1" class="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-sm border border-white/10">
          <button
            @click="goToPrevious"
            :disabled="!hasPrevious"
            class="flex size-8 items-center justify-center rounded-full bg-white/10 transition-all disabled:opacity-30 active:scale-95"
          >
            <UIcon name="i-heroicons-chevron-left" class="size-4 text-white" />
          </button>
          
          <div class="flex items-center gap-1 px-2">
            <template v-for="(_, idx) in totalCount" :key="idx">
              <div 
                v-if="Math.abs(idx - currentIndex) < 3 || idx === 0 || idx === totalCount - 1"
                class="transition-all duration-300"
                :class="{
                  'w-6 h-2 rounded-full bg-cyan-400': idx === currentIndex,
                  'w-2 h-2 rounded-full bg-white/30': idx !== currentIndex,
                  'hidden': Math.abs(idx - currentIndex) >= 3 && idx !== 0 && idx !== totalCount - 1
                }"
              ></div>
              <div 
                v-else-if="idx === currentIndex - 3 || idx === currentIndex + 3"
                class="w-1 h-1 rounded-full bg-white/20"
              ></div>
            </template>
          </div>
          
          <button
            @click="goToNext"
            :disabled="!hasNext"
            class="flex size-8 items-center justify-center rounded-full bg-white/10 transition-all disabled:opacity-30 active:scale-95"
          >
            <UIcon name="i-heroicons-chevron-right" class="size-4 text-white" />
          </button>
        </div>
      </div>

      <!-- Keyboard hint -->
      <div class="hidden lg:block absolute bottom-4 right-6 z-10">
        <div class="flex items-center gap-2 text-[10px] text-slate-500">
          <kbd class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">←</kbd>
          <kbd class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">→</kbd>
          <span>to navigate</span>
        </div>
      </div>
    </div>
  </div>
</template>
