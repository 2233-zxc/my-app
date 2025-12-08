import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/styles/common.scss'
import { lazyPlugin } from '@/directive/index'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useUserStore } from '@/stores/user' // 👈 补充导入

const app = createApp(App)

// 1. 创建唯一的 Pinia 实例
const pinia = createPinia()

// 2. 安装持久化插件到该实例
pinia.use(piniaPluginPersistedstate)

// 3. 将 Pinia 和 Router 注册到 Vue App
app.use(pinia)
app.use(router)
app.use(lazyPlugin)

// 4. 恢复登录状态（此时 useUserStore() 使用的是已安装插件的 pinia 实例）
const userStore = useUserStore()
userStore.restoreLoginState()

// 5. 挂载应用
app.mount('#app')