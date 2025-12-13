export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  
  devServer: {
    port: 2029
  },
  
  modules: ['@nuxt/ui'],
  
  css: ['~/assets/css/tailwind.css'],
  
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      wasm: true
    },
    d1: {
      databases: ['DB']
    }
  },
  
  colorMode: {
    preference: 'light'
  },

  app: {
    head: {
      title: 'Showcase',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Showcase' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'description', content: 'Compare AI implementations side by side' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  }
})
