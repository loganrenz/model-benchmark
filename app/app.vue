<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
// Force light mode everywhere (ignore system / stored preference)
const colorMode = useColorMode()
colorMode.preference = 'light'
colorMode.value = 'light'

useHead({
  htmlAttrs: { class: 'light' }
})
</script>
