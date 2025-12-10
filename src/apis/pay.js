import requestInstance from '@/utils/request'

/**
 * 获取微信支付二维码
 * @param {Object} params - 支付参数
 * @param {string} params.orderNo - 订单编号
 * @param {number} params.totalAmount - 支付金额
 * @param {string} params.notifyUrl - 回调地址
 * @returns {Promise}
 */
export const getWxPayQrApi = (params) => {
  return requestInstance.post('/api/pay/wx/qr', params)
}

/**
 * 检查微信支付状态
 * @param {Object} params - 校验参数
 * @param {string} params.orderNo - 订单编号
 * @param {string} params.prepayId - 预支付ID
 * @returns {Promise}
 */
export const checkWxPayStatusApi = (params) => {
  return requestInstance.get('/api/pay/wx/status', { params })
}