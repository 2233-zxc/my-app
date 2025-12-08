// src/utils/request.js
import axios from 'axios'

const requestInstance = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  withCredentials: true // ✅ 全局开启，让所有请求都能携带 Cookie
})

// 请求拦截器：通常不再需要特殊处理 withCredentials
requestInstance.interceptors.request.use((config) => {
  // 可以在这里加 token（如果用 JWT），但你用的是 Session + Cookie，所以无需额外操作
  return config
}, (error) => {
  return Promise.reject(error)
})

// 响应拦截器
requestInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('网络异常：', error.message)
    return Promise.reject(error)
  }
)

export default requestInstance