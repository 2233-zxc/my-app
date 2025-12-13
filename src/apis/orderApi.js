import requestInstance from '@/utils/request'

// 创建订单
export const createOrderApi = (orderDto) => {
  if (!orderDto) return Promise.reject(new Error('订单参数不能为空'))
  if (!orderDto.userId || orderDto.userId <= 0) return Promise.reject(new Error('用户ID必须为正整数'))
  if (!orderDto.goodsList || !orderDto.goodsList.length) return Promise.reject(new Error('订单项列表不能为空'))
  
  return requestInstance.post('/api/order/create', orderDto)
}

// 查询待付款订单详情
export const getUnpaidOrderDetailApi = (orderNo, userId) => {
  if (!orderNo || !userId || userId <= 0) {
    return Promise.reject(new Error('订单编号和用户ID不能为空，用户ID需为正整数'))
  }
  
  return requestInstance.get('/api/order/unpaid/detail', {
    params: { orderNo: orderNo.trim(), userId }
  })
}

// 下载支付二维码
export const downloadQrCodeApi = (orderNo, userId) => {
  if (!orderNo || !userId || userId <= 0) {
    return Promise.reject(new Error('订单编号和用户ID不能为空'))
  }
  
  return requestInstance.get(`/api/order/qr-code/download/${orderNo}/${userId}`, {
    responseType: 'blob'
  })
}

// 获取二维码Base64
export const getQrCodeBase64Api = (orderNo, userId) => {
  if (!orderNo || !userId || userId <= 0) {
    return Promise.reject(new Error('订单编号和用户ID不能为空'))
  }
  
  return requestInstance.get(`/api/order/qr-code/base64/${orderNo}/${userId}`)
}

// 新增：查询订单支付状态（前端轮询专用）
export const getOrderPayStatusApi = (orderNo, userId) => {
  // 保持与其他接口一致的参数校验规则
  if (!orderNo || !userId || userId <= 0) {
    return Promise.reject(new Error('订单编号和用户ID不能为空，用户ID需为正整数'))
  }
  
  // 调用后端新增的支付状态接口，参数格式与查询详情接口一致
  return requestInstance.get('/api/order/pay/status', {
    params: { 
      orderNo: orderNo.trim(), // 去除订单号前后空格，避免无效请求
      userId 
    }
  })
}