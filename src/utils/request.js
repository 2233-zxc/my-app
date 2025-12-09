// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus' // 如果你用 Element Plus 做全局错误提示

const requestInstance = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  withCredentials: true
})

requestInstance.interceptors.request.use((config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

// 统一处理响应结构：{ code, message, data }
requestInstance.interceptors.response.use(
  (response) => {
    const res = response.data // 后端返回的完整对象：{ code, message, data }

    // 成功状态码为 200
    if (res.code === 200) {
      return res.data // 👈 只返回 data 部分
    } else {
      // 业务逻辑错误（如用户名已存在、密码错误等）
      ElMessage({
        message: res.message || '请求失败', // 错误提示文案（适配res.message）
        type: 'error', // 关键：指定类型为error（示例中是success，这里改为error匹配错误场景）
        plain: true, // 和示例按钮的:plain="true" 对应，显示简约样式
        center: false, // 示例未居中，默认false（如需居中可改为true）
        duration: 2000, // 默认3秒自动关闭（可自定义）
        showClose: true, // 显示关闭按钮（默认true）
        customClass:'custom-error-message'
      })
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  (error) => {
    // 网络错误、404、500、超时等
    console.error('请求异常:', error)
    let message = '网络错误，请稍后重试'

    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        message = '未授权，请重新登录'
      } else if (status === 403) {
        message = '拒绝访问'
      } else if (status === 404) {
        message = '请求资源不存在'
      } else if (status >= 500) {
        message = '服务器内部错误'
      }
    } else if (error.request) {
      message = '网络连接失败'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default requestInstance