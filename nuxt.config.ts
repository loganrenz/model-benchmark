export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui'
  ],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  },
  ui: {
    primary: 'indigo',
    gray: 'neutral'
  },
  app: {
    head: {
      title: 'Model Project Viewer',
      meta: [
        { name: 'description', content: 'Explore project outputs and prompts for each model in a simple file viewer layout.' }
      ]
    }
  },
  typescript: {
    strict: true,
    shim: false
  }
});
