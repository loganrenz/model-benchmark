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
  <UTree
    v-model="selected"
    v-model:expanded="expanded"
    :items="tree"
    :ui="{
      wrapper: 'space-y-1',
      item: 'py-1',
      link: 'rounded-lg px-3 py-2 hover:bg-gray-100 w-full text-left text-sm',
      linkActive: 'bg-gray-200 font-medium'
    }"
    @select="handleSelect"
  />
</template>
