import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
//引入初始化样式
import '@/styles/common.scss'
//引入懒加载组件并注册
import {lazyPlugin} from '@/directive/index'
const app = createApp(App)

// Pinia挂载
app.use(createPinia())
// 路由挂载
app.use(router)

// 注册懒加载组件
app.use(lazyPlugin)

// 应用挂载
app.mount('#app')

