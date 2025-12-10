import axios from 'axios'
import { ElMessage } from 'element-plus'

const requestInstance = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  withCredentials: true
})

// 请求拦截器
requestInstance.interceptors.request.use((config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

// 响应拦截器
requestInstance.interceptors.response.use(
  (response) => {
    const res = response.data

    // 成功状态码为 200
    if (res.code === 200) {
      return res.data // 只返回 data 部分
    } else {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        plain: true,
        duration: 2000,
        showClose: true,
        customClass:'custom-error-message'
      })
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  (error) => {
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