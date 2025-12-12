import { createApp } from 'vue'
import NuxtUI from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import './styles.css'

const app = createApp(App)

document.documentElement.classList.remove('dark')
document.documentElement.style.colorScheme = 'light'

app.use(NuxtUI)

app.mount('#app')
