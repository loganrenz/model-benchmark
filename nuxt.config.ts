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
      title: 'AI Showcase — Compare AI Implementations',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'theme-color', content: '#6366f1' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'AI Showcase' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'description', content: 'Compare different AI agent implementations side-by-side. Explore how different AI models approach the same challenges.' },
        { name: 'author', content: 'AI Showcase' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'AI Showcase — Compare AI Implementations' },
        { property: 'og:description', content: 'Compare different AI agent implementations side-by-side.' },
        { property: 'og:site_name', content: 'AI Showcase' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'AI Showcase — Compare AI Implementations' },
        { name: 'twitter:description', content: 'Compare different AI agent implementations side-by-side.' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }
      ]
    }
  }
})
