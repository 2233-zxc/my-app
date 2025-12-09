import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/styles/common.scss'
import { lazyPlugin } from '@/directive/index'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useUserStore } from '@/stores/user'
// 引入全局样式文件
import '@/styles/global.scss' 

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(lazyPlugin)


// 等待 restoreLoginState() 完成后再 mount
const userStore = useUserStore()
userStore.restoreLoginState().then(() => {
  app.mount('#app')
})