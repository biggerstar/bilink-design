import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router/index'
// import {createPinia} from 'pinia'
import axios from 'axios'
import {hook_console_warn} from "@/utils/hook";
const app = createApp(App)
axios.defaults.baseURL = __API_BASE_URL__
app.config.globalProperties.http = axios
app.use(router)
// app.use(createPinia())
app.mount('#app')
hook_console_warn()

