import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router/index'
import {createPinia} from 'pinia'
import axios from 'axios'

const app = createApp(App)
const BASE_URL = 'http://localhost:6060'

axios.defaults.baseURL = BASE_URL
app.config.globalProperties.http = axios
app.use(router)
app.use(createPinia())
app.mount('#app')
