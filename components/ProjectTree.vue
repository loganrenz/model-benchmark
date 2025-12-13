<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

interface TreeNode {
  key: string
  label: string
  icon?: string
  children?: TreeNode[]
  selectable?: boolean
  src?: string
}

const props = defineProps<{
  manifest: Manifest
  activeKey?: string
}>()

const emit = defineEmits<{
  select: [{ key: string; src: string; label: string }]
}>()

// Build tree structure with icons
const tree = computed<TreeNode[]>(() => {
  return props.manifest.projects.map(project => ({
    key: project.id,
    label: project.label,
    icon: 'i-heroicons-folder',
    children: project.models.map(model => ({
      key: `${project.id}/${model.id}`,
      label: model.label,
      icon: 'i-heroicons-cube',
      src: `/projects/${project.folder}/${model.file}`,
      selectable: true
    }))
  }))
})

const expanded = ref<string[]>([])
const selected = ref<TreeNode>()

// Expand all projects by default
watchEffect(() => {
  expanded.value = props.manifest.projects.map(p => p.id)
})

// Sync selected with activeKey
watch(() => props.activeKey, (key) => {
  if (!key) return
  // Find the node
  for (const project of tree.value) {
    const node = project.children?.find(c => c.key === key)
    if (node) {
      selected.value = node
      return
    }
  }
}, { immediate: true })

function handleSelect(_event: any, node: TreeNode) {
  if (node.selectable && node.src) {
    emit('select', { key: node.key, src: node.src, label: node.label })
  }
}
</script>

<template>
  <div class="space-y-2">
    <UTree
      v-model="selected"
      v-model:expanded="expanded"
      :items="tree"
      :ui="{
        wrapper: 'space-y-2',
        item: 'py-0.5',
        base: 'group relative',
        parent: 'mb-1.5',
        label: 'truncate leading-snug',
        icon: {
          base: 'shrink-0 transition-colors duration-200',
          active: 'text-blue-600',
          inactive: 'text-gray-400 group-hover:text-gray-600'
        },
        link: 'rounded-xl px-4 py-3.5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 active:bg-gray-200/50 w-full text-left text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center gap-3 border border-transparent hover:border-gray-200/50',
        linkActive: 'bg-gradient-to-r from-blue-50 via-purple-50/50 to-blue-50 text-blue-900 font-semibold ring-2 ring-blue-200/60 hover:ring-blue-300/60 hover:from-blue-100 hover:to-purple-100 shadow-md border-blue-200/30',
        linkInactive: 'text-gray-700 hover:text-gray-900',
        button: {
          base: 'p-2 rounded-lg hover:bg-gray-100/80 active:bg-gray-200 transition-all duration-200',
          icon: 'h-4 w-4 text-gray-400 transition-transform duration-200'
        }
      }"
      @select="handleSelect"
    />
  </div>
</template>
