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
          <span>{{ getUserName }}</span>
        </li>
        <li><a href="#" @click="handleLogout">退出登录</a></li>
      </template>
      
      <!-- 公共导航项 -->
      <li><router-link to="/order">我的订单</router-link></li>
      <li><router-link to="/member">会员中心</router-link></li>
      <li><router-link to="/help">帮助中心</router-link></li>
      <li><router-link to="/service">在线客服</router-link></li>
      <li><a href="#"><i class="iconfont icon-mobile-phone">手机版本</i></a></li>
    </ul>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { computed } from 'vue' // 导入 computed！

const userStore = useUserStore()
const router = useRouter()

// 优先显示 nickName，为空时 fallback 到 userName
const getUserName = computed(() => {
  const user = userStore.userInfo
  if (!user) return '用户'

  // 判断 nickName 是否有效（非空且非纯空白）
  const hasNickName = user.nickName && user.nickName.trim() !== ''
  return hasNickName ? user.nickName : user.userName || '用户'
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
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

/* 退出登录按钮 hover 效果 */
.nav-item li a:hover {
  color: #5EB69C;
  transition: color 0.2s;
}

/* 优化路由高亮样式 */
.router-link-exact-active {
  color: #5EB69C !important;
}
</style>