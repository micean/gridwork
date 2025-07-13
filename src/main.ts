import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import {registerKeys} from "@/keys.ts";

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')

registerKeys()
