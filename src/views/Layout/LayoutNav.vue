<template>
  <nav class="nav-top">
    <ul class="nav-item wrapper">
      <!-- 未登录：显示登录/注册 -->
      <template v-if="!userStore.isLogin">
        <li><router-link to="/login">登录</router-link></li>
        <li><router-link to="/register">免费注册</router-link></li>
      </template>
      <!-- 已登录：显示用户名/退出 -->
      <template v-else>
        <li class="user-info">
          <span>欢迎，{{ getUserName }}</span>
        </li>
        <li><a href="#" @click="handleLogout">退出登录</a></li>
      </template>
      
      <!-- 公共导航项：绑定点击事件校验登录状态 -->
      <li>
        <a href="#" @click.prevent="handleNavClick('/order')">我的订单</a>
      </li>
      <li>
        <a href="#" @click.prevent="handleNavClick('/member')">会员中心</a>
      </li>
      <li>
        <a href="#" @click.prevent="handleNavClick('/help')">帮助中心</a>
      </li>
      <li>
        <a href="#" @click.prevent="handleNavClick('/service')">在线客服</a>
      </li>
      <li><a href="#"><i class="iconfont icon-mobile-phone">手机版本</i></a></li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
// 1. 导入Pinia用户Store
import { useUserStore } from '@/stores/user'
// 2. 导入路由
import { useRouter } from 'vue-router'

// 3. 初始化Store和路由
const userStore = useUserStore()
const router = useRouter()

// 4. 从userStore.userInfo获取用户名
const getUserName = computed(() => {
  return userStore.userInfo?.userName || '用户'
})

// 5. 退出登录方法
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}



// 6. 导航项点击事件：校验登录状态，未登录跳登录页，已登录跳目标页面
const handleNavClick = (targetPath) => {
  // 未登录：跳登录页，并携带目标路径（登录后可返回）
  if (!userStore.isLogin) {
    router.push({
      path: '/login',
      query: { redirect: targetPath } // 记录要访问的页面
    })
  } else {
    // 已登录：正常跳转到目标页面
    router.push(targetPath)
  }
}
</script>

<style scoped>
.nav-top {
  width: 100%;
  height: 55px;
  background-color: #333;
  margin-bottom: 20px;
}

.nav-item {
  height: 100%;
  color: #FFFFFF;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item li {
  border-right: 1px solid #999;
  padding-right: 20px;
  padding-left: 20px;
}

.nav-item li:last-child {
  border-right: 0;
  padding-right: 0;
}

.nav-item a,
.nav-item a.router-link-exact-active {
  color: #FFF;
  text-decoration: none;
  cursor: pointer;
}

/* 未登录时登录按钮样式 */
.nav-item li:first-child a {
  color: #5EB69C;
}

/* 已登录时用户信息样式 */
.user-info {
  color: #5EB69C;
  font-weight: 500;
}

/* 退出登录/导航项 hover 效果 */
.nav-item li a:hover {
  color: #5EB69C;
  transition: color 0.2s;
}

/* 优化路由高亮样式 */
.router-link-exact-active {
  color: #5EB69C !important;
}
</style>