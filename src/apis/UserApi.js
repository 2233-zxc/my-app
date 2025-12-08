import requestInstance from '@/utils/request' // 引入封装的axios

// 登录接口（补充接收参数，后续登录功能也需传递参数）
export const loginApi = (loginData) => {
    return requestInstance.post('/api/login', loginData)
}

// 注册接口：接收参数并传递到POST请求体
export const registerApi = (registerData) => {
  return requestInstance.post('/api/register', registerData);// 传递参数到请求体
};
//验证当前用户登录状态（获取当前用户信息）
export const checkAuthApi = () => {
  return requestInstance.get('/api/user/me')
}