<template>
  <div class="login-container">
    <div class="container">
      <!-- 登录表单容器 -->
      <div 
        class="presentation-container"
        :style="{ transform: isLoginView ? 'translateX(0)' : 'translateX(-100%)' }"
      >
        <div class="user_login">
          <form @submit.prevent="handleLogin">
            <h2>用户登录</h2>
            <!-- 用户名输入框 -->
            <input 
              type="text" 
              v-model="loginForm.username" 
              placeholder="请输入用户名"
              @input="clearLoginTip('username')"
              :disabled="userStore.loginLoading"
            >
            <div class="tips" id="usernameTips">{{ loginTips.username }}</div>
            
            <!-- 密码输入框 -->
            <input 
              type="password" 
              v-model="loginForm.password" 
              placeholder="请输入密码"
              @input="clearLoginTip('password')"
              :disabled="userStore.loginLoading"
            >
            <div class="tips" id="passwordTips">{{ loginTips.password }}</div>
            
            <a href="#" class="forget-pwd">忘记密码？</a>
            
            <!-- 登录按钮（加载状态从Pinia获取） -->
            <button 
              type="button" 
              @click="handleLogin"
              :disabled="userStore.loginLoading"
              class="login-btn"
            >
              <span v-if="!userStore.loginLoading">登录</span>
              <span v-else>登录中...</span>
            </button>
          </form>
        </div>
        <div class="goregister">
          <h2>没有账号?</h2>
          <p>点击注册一个账号吧。</p>
          <button @click="switchToRegister" :disabled="userStore.loginLoading">注册</button>
        </div>
      </div>

      <!-- 注册表单容器 -->
      <div 
        class="overlay-container"
        :style="{ transform: isLoginView ? 'translateX(100%)' : 'translateX(0)' }"
      >
        <div class="gologin">
          <h2>已有账号？</h2>
          <p>点击登录账号吧。</p>
          <button @click="switchToLogin" :disabled="userStore.registerLoading">登录</button>
        </div>
        <div class="user_register">
          <form @submit.prevent="handleRegister">
            <h2>用户注册</h2>
            <input 
              type="text" 
              v-model="registerForm.username" 
              placeholder="请输入5-8个字符的用户名"
              @input="clearRegisterTip('username')"
              :disabled="userStore.registerLoading"
            >
            <div class="tips" id="rusernameTips">{{ registerTips.username }}</div>
            <input 
              type="password" 
              v-model="registerForm.password" 
              placeholder="请输入密码"
              @input="clearRegisterTip('password')"
              :disabled="userStore.registerLoading"
            >
            <div class="tips" id="rpasswordTips">{{ registerTips.password }}</div>
            <input 
              type="tel" 
              v-model="registerForm.phone" 
              placeholder="请输入11位手机号"
              @input="clearRegisterTip('phone')"
              :disabled="userStore.registerLoading"
            >
            <div class="tips" id="rphoneTips">{{ registerTips.phone }}</div>
            <button 
              type="button" 
              @click="handleRegister"
              :disabled="userStore.registerLoading"
            >
              <span v-if="!userStore.registerLoading">注册</span>
              <span v-else>注册中...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router' 
import { useUserStore } from '@/stores/user' // 导入Pinia Store
// 防抖函数（避免重复点击）
const debounce = (fn, delay = 500) => {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// ========== 1. 初始化 ==========
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// ========== 2. 页面交互状态 ==========
const isLoginView = ref(true)
const loginForm = ref({ username: '', password: '' })
const loginTips = ref({ username: '', password: '' })
const registerForm = ref({ username: '', password: '', phone: '' })
const registerTips = ref({ username: '', password: '', phone: '' })

// ========== 3. 视图切换 ==========
const switchToRegister = () => {
  isLoginView.value = false
  clearAllTips()
  loginForm.value = { username: '', password: '' }
}
const switchToLogin = () => {
  isLoginView.value = true
  clearAllTips()
  registerForm.value = { username: '', password: '', phone: '' }
}

// ========== 4. 表单校验 ==========
const clearAllTips = () => {
  loginTips.value = { username: '', password: '' }
  registerTips.value = { username: '', password: '', phone: '' }
}
const clearLoginTip = (type) => {
  loginTips.value[type] = ''
}
const clearRegisterTip = (type) => {
  registerTips.value[type] = ''
}

// ========== 5. 登录逻辑（防抖 + 严格校验） ==========
const handleLogin = debounce(async () => {
  const username = loginForm.value.username.trim()
  const password = loginForm.value.password.trim()
  let isValid = true

  // 前端表单校验
  if (!username) {
    loginTips.value.username = '请输入用户名'
    isValid = false
  }
  if (!password) {
    loginTips.value.password = '请输入密码'
    isValid = false
  }

  if (isValid) {
    // 清空之前的提示
    clearLoginTip('username')
    clearLoginTip('password')
    // 调用Pinia的登录方法
    const redirect = route.query.redirect || '/'
    const loginSuccess = await userStore.login({ 
      userName: username, 
      password: password 
    }, redirect)
    
    // 登录失败时清空密码框（保留用户名）
    if (!loginSuccess) {
      loginForm.value.password = ''
    }
  }
}, 500, true)

// ========== 6. 注册逻辑（防抖 + 严格校验） ==========
const handleRegister = debounce(async () => {
  const username = registerForm.value.username.trim()
  const password = registerForm.value.password.trim()
  const phone = registerForm.value.phone.trim()
  let isValid = true

  // 前端表单校验
  if (!username) {
    registerTips.value.username = '请输入用户名'
    isValid = false
  } else if (username.length < 5 || username.length > 8) {
    registerTips.value.username = '用户名长度需为5-8个字符'
    isValid = false
  }
  if (!password) {
    registerTips.value.password = '请输入密码'
    isValid = false
  } else if (password.length < 6) {
    registerTips.value.password = '密码长度不能少于6位'
    isValid = false
  }
  if (!phone) {
    registerTips.value.phone = '请输入手机号'
    isValid = false
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    registerTips.value.phone = '请输入有效的11位手机号'
    isValid = false
  }

  if (isValid) {
    // 清空之前的提示
    clearRegisterTip('username')
    clearRegisterTip('password')
    clearRegisterTip('phone')
    // 调用Pinia的注册方法
    const success = await userStore.register({
      userName: username,
      password: password,
      phone: phone
    })
    // 注册成功后切换到登录页
    if (success) {
      registerForm.value = { username: '', password: '', phone: '' }
      setTimeout(() => {
        switchToLogin()
        loginForm.value.username = username
      }, 1500)
    }
  }
}, 500, true)

// ========== 7. 页面挂载 ==========
onMounted(() => {
  // 自动填充本地存储的用户名
  const savedUsername = localStorage.getItem('username')
  if (savedUsername) {
    loginForm.value.username = savedUsername
  }
})
</script>

<style scoped>
/* 样式部分无变化，保留原有代码 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.container {
  width: 900px;
  height: 500px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.presentation-container, .overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  transition: transform 0.6s ease-in-out;
}

/* 登录表单样式 */
.user_login {
  width: 450px;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
}
.user_login form {
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 8px;
}
.user_login h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
.user_login input {
  width: 100%;
  height: 45px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  outline: none;
  background-color: #ffffff;
  padding: 0 12px;
  font-size: 14px;
}
.user_login input:focus {
  border-color: #417dff;
}
.user_login input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
.user_login .login-btn {
  width: 100%;
  height: 45px;
  background-color: #417dff;
  cursor: pointer;
  border-radius: 6px;
  border: none;
  color: white;
  font-size: 16px;
  margin-top: 15px;
  transition: background-color 0.2s;
}
.user_login .login-btn:disabled {
  background-color: #99b9ff;
  cursor: not-allowed;
}
.user_login .login-btn:hover:not(:disabled) {
  background-color: #3066e0;
}
.user_login .login-btn:active:not(:disabled) {
  transform: scale(0.98);
}
.user_login .forget-pwd {
  text-align: right;
  color: #417dff;
  font-size: 13px;
  margin-top: 5px;
  text-decoration: none;
}
.user_login .forget-pwd:hover {
  color: #3066e0;
  text-decoration: underline;
}

/* 注册引导区 */
.goregister {
  width: 450px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #417dff;
  color: white;
  text-align: center;
  padding: 0 60px;
}
.goregister h2 {
  font-size: 24px;
  margin-bottom: 15px;
}
.goregister p {
  font-size: 14px;
  margin-bottom: 30px;
  opacity: 0.9;
}
.goregister button {
  width: 120px;
  height: 38px;
  border: 1px solid #fff;
  background-color: transparent;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: background-color 0.2s;
}
.goregister button:disabled {
  background-color: rgba(255,255,255,0.1);
  cursor: not-allowed;
}
.goregister button:hover:not(:disabled) {
  background-color: rgba(255,255,255,0.1);
}

/* 登录引导区 */
.gologin {
  width: 450px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #417dff;
  color: white;
  text-align: center;
  padding: 0 60px;
}
.gologin h2 {
  font-size: 24px;
  margin-bottom: 15px;
}
.gologin p {
  font-size: 14px;
  margin-bottom: 30px;
  opacity: 0.9;
}
.gologin button {
  width: 120px;
  height: 38px;
  border: 1px solid #fff;
  background-color: transparent;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: background-color 0.2s;
}
.gologin button:disabled {
  background-color: rgba(255,255,255,0.1);
  cursor: not-allowed;
}
.gologin button:hover:not(:disabled) {
  background-color: rgba(255,255,255,0.1);
}

/* 注册表单样式 */
.user_register {
  width: 450px;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
}
.user_register form {
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 8px;
}
.user_register h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
.user_register input {
  width: 100%;
  height: 45px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  outline: none;
  background-color: #ffffff;
  padding: 0 12px;
  font-size: 14px;
}
.user_register input:focus {
  border-color: #417dff;
}
.user_register input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
.user_register button {
  width: 100%;
  height: 45px;
  background-color: #417dff;
  cursor: pointer;
  border-radius: 6px;
  border: none;
  color: white;
  font-size: 16px;
  margin-top: 15px;
  transition: background-color 0.2s;
}
.user_register button:disabled {
  background-color: #99b9ff;
  cursor: not-allowed;
}
.user_register button:hover:not(:disabled) {
  background-color: #3066e0;
}
.user_register button:active:not(:disabled) {
  transform: scale(0.98);
}

/* 错误提示 */
.tips {
  color: #ff4d4f;
  font-size: 12px;
  height: 16px;
  line-height: 16px;
  margin-left: 2px;
}
</style>