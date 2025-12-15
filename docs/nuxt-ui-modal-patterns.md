# Nuxt UI Modal Patterns

This document describes the correct patterns for using modals in this Nuxt 4 + Nuxt UI v4 application.

## Critical: Props Exposure in Vue 3

When using `defineProps()` with an assignment (`const props = defineProps<...>()`), you **must** explicitly expose props for template usage.

### ❌ Incorrect Pattern

```vue
<script setup lang="ts">
const props = defineProps<{
  submission?: Submission | null
  open: boolean
}>()
</script>

<template>
  <!-- ❌ This will NOT work - submission is not exposed -->
  <div v-if="submission">
    {{ submission.projectId }}
  </div>
</template>
```

### ✅ Correct Patterns

#### Option 1: Use `toRefs()` to expose props

```vue
<script setup lang="ts">
const props = defineProps<{
  submission?: Submission | null
  open: boolean
}>()

// Expose props for template usage
const { submission, open } = toRefs(props)
</script>

<template>
  <!-- ✅ Now submission is a ref that works in template -->
  <div v-if="submission">
    {{ submission.projectId }}
  </div>
</template>
```

**Recommended:** Use Option 1 (`toRefs()`) for consistency across the codebase.

## Modal with v-model

### Standard Modal Pattern

```vue
<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { open } = toRefs(props)

const isOpen = computed({
  get: () => open.value,
  set: (value) => emit('update:open', value)
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <UModal v-if="isMounted" v-model:open="isOpen" title="My Modal">
    <template #body>
      <!-- Modal content -->
    </template>
    
    <template #footer>
      <!-- Footer actions -->
    </template>
  </UModal>
</template>
```

## Troubleshooting

### Modal content doesn't render

**Problem:** Modal opens but content is empty or flickers

**Solution:** Check props exposure - use `toRefs()` or `props.` prefix

### Hydration mismatch errors

**Problem:** Console shows hydration errors with modals

**Solution:** Always wrap modal in `v-if="isMounted"` and set `isMounted.value = true` in `onMounted()`

## Examples in Codebase

- `components/admin/SubmissionReviewModal.vue` - Complete modal with form
- `components/admin/ProjectFormModal.vue` - Modal with inputs
- `components/ConfirmModal.vue` - Simple confirmation dialog
