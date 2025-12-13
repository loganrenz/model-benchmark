<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

interface TreeNode {
  key: string
  label: string
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

// Build tree structure
const tree = computed<TreeNode[]>(() => {
  return props.manifest.projects.map(project => ({
    key: project.id,
    label: project.label,
    children: project.models.map(model => ({
      key: `${project.id}/${model.id}`,
      label: model.label,
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
  <div v-if="tree.length > 0" class="space-y-2">
    <UTree
      v-model="selected"
      v-model:expanded="expanded"
      :items="tree"
      :ui="{
        wrapper: 'space-y-2',
        item: 'py-1',
        link: 'rounded-xl px-4 py-3 hover:bg-gray-50 active:bg-gray-100 w-full text-left text-sm font-medium transition-colors',
        linkActive: 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-900 font-semibold ring-2 ring-blue-200/50'
      }"
      @select="handleSelect"
    />
  </div>
  <div v-else class="flex items-center justify-center p-8">
    <p class="text-sm text-gray-500">No projects available</p>
  </div>
</template>
