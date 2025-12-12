import requestInstance from '@/utils/request'

/**
 * 支付宝沙箱支付回调通知接口（支付宝服务器调用，前端一般无需主动调用，仅封装参考）
 * 注：该接口是支付宝后台异步回调后端的，前端通常只封装「创建支付订单」接口供业务调用
 */
export const alipayNotifyApi = (params) => {
  return requestInstance.post('/api/alipay/notify', params)
}

// 补充：实际业务中前端更常用的「创建支付宝支付订单」接口封装（配套后端支付生成接口）
/**
 * 创建支付宝沙箱支付订单（获取支付链接/参数）
 * @param {Object} orderInfo - 订单信息（包含订单号、金额、标题等）
 * @returns {Promise} - 返回支付链接/参数
 */
export const createAlipayOrderApi = (orderInfo) => {
  return requestInstance.post('/api/alipay/createOrder', orderInfo)
}

/**
 * 查询订单支付状态（前端主动轮询，补充回调的可靠性）
 * @param {String} outTradeNo - 商户订单号（自己系统的订单号）
 * @returns {Promise} - 返回订单支付状态
 */
export const queryAlipayOrderStatusApi = (outTradeNo) => {
  return requestInstance.get(`/api/alipay/queryOrder/${outTradeNo}`)
}