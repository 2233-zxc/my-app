// src/stores/user.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
// ✅ 导入所有需要的 API，包括 checkAuthApi
import { loginApi, registerApi, checkAuthApi } from '@/apis/UserApi'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const isLogin = ref(false)
  const loginLoading = ref(false)
  const registerLoading = ref(false)
  const userInfo = ref(null) // 存储 UserDto 对象

  // ========== 登录逻辑 ==========
  const login = async (params, redirect = '/') => {
    try {
      loginLoading.value = true
      const res = await loginApi(params)

      // 假设后端返回的是 UserDto 对象（如 { userId, userName, nickName, ... }）
      // 如果你的 requestInstance 已在拦截器中 return response.data，则 res 就是 UserDto
      userInfo.value = res
      isLogin.value = true

      ElMessage.success('登录成功！即将为您跳转到首页')
      setTimeout(() => {
        router.push(redirect)
      }, 1500)
      return true
    } catch (error) {
      console.error('登录接口异常：', error)
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        '登录失败，请检查用户名或密码'
      if (error.response?.status === 401 || error.response?.status === 400) {
        ElMessage.error(errorMsg)
      } else {
        ElMessage.error('网络异常，请稍后重试')
      }
      return false
    } finally {
      loginLoading.value = false
    }
  }

  // ========== 注册逻辑 ==========
  const register = async (params) => {
    try {
      registerLoading.value = true
      const res = await registerApi(params)
      if (res && res.code === 200) {
        ElMessage.success('注册成功！即将为您跳转到登录页面')
        return true
      } else {
        ElMessage.error(res?.message || '注册失败，请更换用户名重试')
        return false
      }
    } catch (error) {
      console.error('注册接口异常：', error)
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        '网络异常，注册失败'
      ElMessage.error(msg)
      return false
    } finally {
      registerLoading.value = false
    }
  }

  // ========== 恢复登录状态（页面刷新时调用）==========
  const restoreLoginState = async () => {
    // Pinia persist 插件已从 localStorage 恢复 isLogin 和 userInfo

    if (isLogin.value && userInfo.value) {
      try {
        // ✅ 调用 /api/user/me 获取最新用户信息
        const freshUserInfo = await checkAuthApi()

        // ✅ 用服务器最新数据覆盖本地缓存（关键！）
        userInfo.value = freshUserInfo

        // 登录状态保持为 true
      } catch (error) {
        // Token 或 Session 失效（401 Unauthorized）
        if (error.response?.status === 401) {
          clearLoginStateSilent()
        }
        // 其他错误（如网络问题）忽略，保留当前状态
      }
    }
  }

  // ========== 静默清除登录状态（不跳转页面）==========
  const clearLoginStateSilent = () => {
    isLogin.value = false
    userInfo.value = null
  }

  // ========== 用户主动退出登录 ==========
  const logout = () => {
    clearLoginStateSilent()
    ElMessage.success('已退出登录')
    router.push('/login')
  }

  return {
    // 状态
    isLogin,
    loginLoading,
    registerLoading,
    userInfo,

    // 方法
    login,
    register,
    restoreLoginState,
    logout,
  }
}, {
  // 启用持久化，保存登录状态和用户信息到 localStorage
  persist: {
    enabled: true,
    storage: localStorage,
    paths: ['isLogin', 'userInfo'] // 只持久化这两个字段
  }
})