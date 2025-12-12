/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app.{js,ts,vue}',
    './app/**/*.{js,ts,vue}',
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
    './plugins/**/*.{js,ts,vue}',
    './assets/**/*.{js,ts,vue}',
    './node_modules/@nuxt/ui/dist/runtime/**/*.{js,mjs}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
