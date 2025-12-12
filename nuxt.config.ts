export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['@/assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    storageKey: 'project-viewer-color-mode',
    classSuffix: ''
  },
  app: {
    head: {
      title: 'Project Viewer',
      meta: [
        { name: 'description', content: 'Mobile-first project viewer for exploring model outputs.' }
      ]
    }
  },
  ui: {
    global: true
  },
  fonts: {
    provider: 'none'
  },
  typescript: {
    strict: true
  }
})
