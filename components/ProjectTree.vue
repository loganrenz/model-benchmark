<script setup lang="ts">
import type { Manifest } from '~/types/manifest'

type NodeKind = 'root' | 'project' | 'model'

type TreeNode = {
  kind: NodeKind
  key: string
  label: string
  children?: TreeNode[]
  icon?: string
  projectId?: string
  modelId?: string
  src?: string
}

const props = defineProps<{
  manifest: Manifest
  activeKey?: string
}>()

const emit = defineEmits<{
  (e: 'select', payload: { key: string; src: string; label: string }): void
}>()

const nodes = computed<TreeNode[]>(() => {
  const root: TreeNode = {
    kind: 'root',
    key: 'root:projects',
    label: 'projects/',
    children: props.manifest.projects.map((p) => ({
      kind: 'project',
      key: `project:${p.id}`,
      label: `${p.folder}/`,
      projectId: p.id,
      children: p.models.map((m) => ({
        kind: 'model',
        key: `model:${p.id}/${m.id}`,
        label: m.label,
        projectId: p.id,
        modelId: m.id,
        src: `/projects/${p.folder}/${m.file}`,
        icon: 'i-heroicons-document-text'
      }))
    }))
  }

  return [root]
})

const getKey = (item: TreeNode) => item.key

const expanded = ref<string[]>(['root:projects'])
const selected = ref<TreeNode | undefined>()

watch(
  () => props.activeKey,
  (key) => {
    if (!key) return
    // Find and set selected node object so UTree highlights correctly
    const stack: TreeNode[] = [...nodes.value]
    while (stack.length) {
      const node = stack.shift()!
      if (node.key === key) {
        selected.value = node
        return
      }
      if (node.children?.length) stack.unshift(...node.children)
    }
  },
  { immediate: true }
)

function onSelect(_e: unknown, item: TreeNode) {
  if (item.kind !== 'model' || !item.src) return
  selected.value = item
  emit('select', { key: item.key, src: item.src, label: item.label })
}
</script>

<template>
  <UTree
    v-model="selected"
    v-model:expanded="expanded"
    :items="nodes"
    :get-key="getKey"
    size="lg"
    color="neutral"
    :ui="{
      link: 'min-h-11 w-full rounded-md px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 data-[state=selected]:bg-gray-100 data-[state=selected]:text-gray-950',
      linkLeadingIcon: 'text-gray-500',
      linkLabel: 'truncate',
      itemWithChildren: 'py-0.5',
      item: 'py-0.5',
      listWithChildren: 'mt-1',
      root: 'select-none'
    }"
    @select="onSelect"
  />
</template>

