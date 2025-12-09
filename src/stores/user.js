import { ref } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, registerApi, checkAuthApi } from '@/apis/UserApi'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const isLogin = ref(false)
  const loginLoading = ref(false)
  const registerLoading = ref(false)
  const userInfo = ref(null)

  // ========== 登录逻辑 ==========
  const login = async (params, redirect = '/') => {
    try {
      loginLoading.value = true
      // 成功时 res = UserDto 对象（即后端返回的 data）
      const user = await loginApi(params)

      // 直接使用 user（无需 res.data 或 res.code）
      userInfo.value = user
      isLogin.value = true
      ElMessage({
        message: '登录成功！即将为您跳转到首页',
        type: 'success',
        duration: 1500,
        showClose: true,
        customClass: 'custom-success-message'
      })
      setTimeout(() => {
        router.push(redirect)
      }, 1500)
      return true
    } catch (error) {
      // 错误已由 request.js 拦截器通过 ElMessage 提示
      console.error('登录失败:', error)
      return false
    } finally {
      loginLoading.value = false
    }
  }

  // ========== 注册逻辑 ==========
  const register = async (params) => {
    try {
      registerLoading.value = true
      // 成功时 res = 后端返回的 data（可能为空对象或简单确认信息）
      await registerApi(params)
      ElMessage({
        message: '注册成功！即将为您跳转到登录页面',
        type: 'success',
        duration: 1500,
        showClose: true,
        customClass: 'custom-success-message'
      })
      return true
    } catch (error) {
      // 错误已由拦截器提示，这里只记录日志
      console.error('注册失败:', error)
      return false
    } finally {
      registerLoading.value = false
    }
  }

  // ========== 恢复登录状态（页面刷新时调用）==========
  const restoreLoginState = async () => {
    if (isLogin.value && userInfo.value) {
      try {
        // 成功时 res = 当前用户信息（UserDto）
        const user = await checkAuthApi()
        userInfo.value = user
        // isLogin 已为 true，无需重复设置
      } catch (error) {
        // 401 或其他错误会触发 catch，此时清空状态
        clearLoginStateSilent()
      }
    }
  }

  // ========== 静默清除登录状态 ==========
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
  persist: {
    enabled: true,
    storage: localStorage,
    paths: ['isLogin', 'userInfo']
  }
})