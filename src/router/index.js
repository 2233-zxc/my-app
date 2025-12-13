import { createRouter, createWebHistory } from 'vue-router'
import index from '@/views/index.vue'
import HomePage from '@/views/HomePage.vue'
import category from '@/views/category/category.vue'
import HomeCart from '@/components/Home/HomeCart.vue'
import LoginPage from '@/views/LoginPage.vue'
import HomeOrder from '@/components/Home/HomeOrder.vue'
import Homepay from '@/components/Home/Homepay.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 首页
    {
      path:'/',
      component:index,
      children:[
        // 默认子路由（访问 / 时显示）
        {
          path: '',
          component: HomePage
        },
        //其他子路由
        {
          path: 'category/:id',       // 完整路径是 /category/id
          component: category
        },
        //购物车
        {
          path:'cart',
          component:HomeCart,
        },
        //订单页面
        {
          path:'order',
          component:HomeOrder
        },
        //待付款页面
        {
          path:'pay',
          component:Homepay
        }
      ]
    },
    // 登录页面
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage
    }
  ],
})

export default router
