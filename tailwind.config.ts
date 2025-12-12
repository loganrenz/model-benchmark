import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app.vue',
    './error.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.config.{js,ts}',
    './node_modules/@nuxt/ui/**/*.{js,ts,vue}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
