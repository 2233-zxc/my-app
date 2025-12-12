import requestInstance from '@/utils/request'

/**
 * 创建订单
 * @param {Object} orderDto - 订单创建参数（与后端OrderDto字段对应）
 * @param {number} orderDto.userId - 用户ID
 * @param {number} orderDto.totalAmount - 订单总金额
 * @param {string} orderDto.productName - 商品名称
 * @param {number} [orderDto.productId] - 商品ID（可选，根据OrderDto实际字段调整）
 * @param {number} [orderDto.quantity] - 商品数量（可选，根据OrderDto实际字段调整）
 * @returns {Promise} - 包含订单信息的响应结果
 */
export const createOrderApi = (orderDto) => {
  return requestInstance.post('/api/order/create', orderDto)
}

/**
 * 根据订单编号查询订单
 * @param {string} orderNo - 订单编号
 * @returns {Promise} - 包含订单详情的响应结果
 */
export const getOrderByOrderNoApi = (orderNo) => {
  return requestInstance.get(`/api/order/${orderNo}`)
}

/**
 * 根据用户ID查询订单列表（可筛选订单状态）
 * @param {number} userId - 用户ID
 * @param {number} [status] - 订单状态（可选参数，不传则查询全部状态）
 * @returns {Promise} - 包含订单列表的响应结果
 */
export const listOrdersByUserIdApi = (userId, status) => {
  return requestInstance.get(`/api/order/user/${userId}`, {
    params: { status }
  })
}

/**
 * 微信支付回调 - 更新订单支付状态
 * @param {Object} params - 支付回调参数
 * @param {string} params.orderNo - 订单编号
 * @param {string} params.wxTradeNo - 微信交易号
 * @param {string} params.wxPrepayId - 微信预支付ID
 * @returns {Promise} - 支付状态更新结果
 */
export const updateOrderPayStatusApi = (params) => {
  return requestInstance.post('/api/order/pay/callback', null, {
    params: params
  })
}

/**
 * 关闭超时订单
 * @param {string} orderNo - 订单编号
 * @returns {Promise} - 订单关闭结果
 */
export const closeTimeoutOrderApi = (orderNo) => {
  return requestInstance.post(`/api/order/close/${orderNo}`)
}