<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Cookies from 'js-cookie' // 👈 引入 js-cookie

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8088/api',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

const router = useRouter()
const isRegisterMode = ref(false)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '', confirmPassword: '' })

const loginErrors = reactive({ username: '', password: '' })
const registerErrors = reactive({ username: '', password: '' })

const switchToRegister = () => {
  isRegisterMode.value = true
}

const switchToLogin = () => {
  isRegisterMode.value = false
}

// 登录提交
const handleLogin = async () => {
  loginErrors.username = ''
  loginErrors.password = ''

  if (!loginForm.username.trim()) {
    loginErrors.username = '账号不能为空'
    return
  }
  if (!loginForm.password) {
    loginErrors.password = '密码不能为空'
    return
  }

  try {
    const response = await api.post('/login', {
      username: loginForm.username.trim(),
      password: loginForm.password
    })

    console.log('登录成功:', response.data)
    const { token } = response.data

    // 将 JWT 存入 Cookie，设置过期时间（单位：天）
    // 假设 JWT 默认 24 小时过期 → 设置 cookie 过期时间为 1 天
    Cookies.set('token', token, {
      expires: 1, // 1 天后过期（与 JWT exp 对齐）
      path: '/',   // 所有路径可访问
      // secure: true, // 如果是 HTTPS 启用
      sameSite: 'Lax' // 安全性建议
    })

    alert('登录成功！')
    await router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    if (error.response?.status === 401) {
      loginErrors.password = '账号或密码错误'
    } else if (error.response?.status === 400) {
      loginErrors.username = '请求参数错误'
    } else {
      alert('网络错误，请稍后再试')
    }
  }
}

// 注册提交（无需改）
const handleRegister = async () => {
  registerErrors.username = ''
  registerErrors.password = ''

  const un = registerForm.username.trim()
  if (un.length < 5 || un.length > 8) {
    registerErrors.username = '账号需为5-8个字符'
    return
  }
  if (!registerForm.password) {
    registerErrors.password = '密码不能为空'
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.password = '两次密码不一致'
    return
  }

  try {
    const response = await api.post('/register', {
      username: un,
      password: registerForm.password
    })

    console.log('注册成功:', response.data)
    alert('注册成功！即将跳转登录...')

    Object.assign(registerForm, { username: '', password: '', confirmPassword: '' })
    isRegisterMode.value = false
  } catch (error) {
    console.error('注册失败:', error)
    if (error.response?.status === 409) {
      registerErrors.username = '该账号已存在'
    } else if (error.response?.status === 400) {
      registerErrors.username = '请求参数无效'
    } else {
      alert('注册失败，请稍后再试')
    }
  }
}
</script>