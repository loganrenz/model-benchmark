// Nuxt configuration for the rebuilt benchmark shell
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui: {
    primary: 'sky',
    gray: 'slate'
  },
  app: {
    head: {
      title: 'Model Benchmark',
      meta: [
        {
          name: 'description',
          content: 'Responsive scaffold for browsing benchmark projects and model placeholders.'
        }
      ]
    }
  },
  nitro: {
    preset: 'static'
  }
});
