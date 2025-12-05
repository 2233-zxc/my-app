import axios from 'axios'

// 创建axios实例
const requestInstance = axios.create({
  baseURL: 'http://localhost:8088', // 后端接口基础路径
  timeout: 5000, // 请求超时时间
  // 统一请求头
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})
// axios请求拦截器
requestInstance.interceptors.request.use((config) =>{
  return config
},(error) =>{
    return Promise.reject(error)
  }
)

// axios响应拦截器
requestInstance.interceptors.response.use(
  (response) => {
    // 直接返回后端完整响应（包含code/message/data）
    return response.data 
  },
  (error) => {
    console.error('网络异常：', error.message)
    return Promise.reject(error)
  }
)

export default requestInstance