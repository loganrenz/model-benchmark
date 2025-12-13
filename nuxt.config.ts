export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  
  modules: ['@nuxt/ui'],
  
  css: ['~/assets/css/tailwind.css'],
  
  nitro: {
    preset: 'vercel'
  },
  
  colorMode: {
    preference: 'light'
  },

  app: {
    head: {
      title: 'Project Viewer',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Project Viewer' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'description', content: 'View and explore 3D models and projects' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  }
})
