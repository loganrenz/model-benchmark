export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  
  modules: ['@nuxt/ui'],
  
  nitro: {
    preset: 'vercel'
  },
  
  colorMode: {
    preference: 'light'
  },

  app: {
    head: {
      title: 'Project Viewer',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'theme-color', content: '#ffffff' }
      ]
    }
  }
})
