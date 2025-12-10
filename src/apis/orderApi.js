import requestInstance from '@/utils/request' // 引入封装的axios
import { ElMessage } from 'element-plus' // 按需引入（如果需要额外提示）

/**
 * 创建订单接口
 * @param {Object} orderData - 订单请求参数（对应后端OrderDto结构）
 * @param {number} orderData.userId - 用户ID（正整数）
 * @param {number} orderData.addressId - 收货地址ID（正整数）
 * @param {number} orderData.totalCount - 商品总数量（大于0）
 * @param {number} orderData.goodsAmount - 商品总价（大于0，保留2位小数）
 * @param {number} [orderData.freight=0] - 运费（默认0，保留2位小数）
 * @param {number} [orderData.discount=0] - 优惠金额（默认0，保留2位小数）
 * @param {number} orderData.totalAmount - 实付金额（大于0，保留2位小数）
 * @param {number} [orderData.payType=1] - 支付方式（默认1=微信支付）
 * @param {string} [orderData.remark] - 订单备注（最多200字符）
 * @param {Array} orderData.goodsList - 订单项列表
 * @param {number} orderData.goodsList[].goodsId - 商品ID
 * @param {string} orderData.goodsList[].goodsName - 商品名称
 * @param {string} [orderData.goodsList[].goodsImage] - 商品图片地址
 * @param {string} [orderData.goodsList[].goodsSpec] - 商品规格
 * @param {number} orderData.goodsList[].goodsPrice - 商品单价（大于0）
 * @param {number} orderData.goodsList[].goodsCount - 购买数量（大于0）
 * @param {number} orderData.goodsList[].itemAmount - 订单项金额（大于0）
 * @returns {Promise} - 返回Promise对象，resolve结果为后端返回的订单数据（仅data部分）
 */
export const createApi = (orderData) => {
  // 1. 前端参数前置校验（补充更细致的规则，和后端DTO校验对齐）
  if (!orderData) {
    ElMessage.error('订单数据不能为空！')
    return Promise.reject(new Error('订单数据不能为空'))
  }
  // 校验核心必传字段
  const requiredFields = [
    { key: 'userId', name: '用户ID' },
    { key: 'addressId', name: '收货地址ID' },
    { key: 'totalCount', name: '商品总数量' },
    { key: 'goodsAmount', name: '商品总价' },
    { key: 'totalAmount', name: '实付金额' }
  ]
  for (const field of requiredFields) {
    if (orderData[field.key] === undefined || orderData[field.key] === null) {
      ElMessage.error(`${field.name}不能为空！`)
      return Promise.reject(new Error(`${field.name}不能为空`))
    }
  }
  // 校验数量/金额大于0
  if (orderData.totalCount <= 0) {
    ElMessage.error('商品总数量必须大于0！')
    return Promise.reject(new Error('商品总数量必须大于0'))
  }
  if (orderData.goodsAmount <= 0) {
    ElMessage.error('商品总价必须大于0！')
    return Promise.reject(new Error('商品总价必须大于0'))
  }
  if (orderData.totalAmount <= 0) {
    ElMessage.error('实付金额必须大于0！')
    return Promise.reject(new Error('实付金额必须大于0'))
  }
  // 校验订单项列表
  if (!Array.isArray(orderData.goodsList) || orderData.goodsList.length === 0) {
    ElMessage.error('订单商品明细不能为空！')
    return Promise.reject(new Error('订单商品明细不能为空'))
  }
  // 校验每个订单项的必传字段
  orderData.goodsList.forEach((item, index) => {
    if (!item.goodsId || item.goodsId <= 0) {
      ElMessage.error(`第${index + 1}个商品的ID不能为空且必须大于0！`)
      throw new Error(`第${index + 1}个商品的ID异常`)
    }
    if (!item.goodsName) {
      ElMessage.error(`第${index + 1}个商品的名称不能为空！`)
      throw new Error(`第${index + 1}个商品的名称异常`)
    }
    if (item.goodsPrice <= 0 || item.goodsCount <= 0 || item.itemAmount <= 0) {
      ElMessage.error(`第${index + 1}个商品的单价/数量/金额必须大于0！`)
      throw new Error(`第${index + 1}个商品的金额/数量异常`)
    }
  })

  // 2. 发送请求（注意：requestInstance响应拦截器已处理，成功时只返回res.data）
  return requestInstance.post('/api/order/create', orderData)
}

/**
 * 根据订单编号查询订单
 * @param {string} orderNo - 订单编号
 * @returns {Promise} - resolve结果为订单数据（仅data部分）
 */
export const getOrderByNoApi = (orderNo) => {
  if (!orderNo) {
    ElMessage.error('订单编号不能为空！')
    return Promise.reject(new Error('订单编号不能为空'))
  }
  return requestInstance.get(`/api/order/${orderNo}`)
}

/**
 * 根据用户ID查询订单列表
 * @param {number} userId - 用户ID
 * @param {number} [status] - 订单状态（1-待付款 2-支付成功 3-支付失败 4-已关闭）
 * @returns {Promise} - resolve结果为订单列表（仅data部分）
 */
export const getOrderListByUserIdApi = (userId, status) => {
  if (!userId || userId <= 0) {
    ElMessage.error('用户ID不能为空且必须大于0！')
    return Promise.reject(new Error('用户ID异常'))
  }
  const params = {}
  if (status !== undefined && status !== null) {
    params.status = status
  }
  return requestInstance.get(`/api/order/user/${userId}`, { params })
}

/**
 * 更新订单支付状态（微信支付回调适配）
 * @param {Object} payData - 支付回调参数
 * @param {string} payData.orderNo - 订单编号
 * @param {string} payData.wxTradeNo - 微信交易号
 * @param {string} payData.wxPrepayId - 微信预支付ID
 * @returns {Promise} - resolve结果为更新状态（仅data部分）
 */
export const updateOrderPayStatusApi = (payData) => {
  if (!payData || !payData.orderNo || !payData.wxTradeNo || !payData.wxPrepayId) {
    ElMessage.error('订单编号/微信交易号/预支付ID不能为空！')
    return Promise.reject(new Error('支付回调参数异常'))
  }
  return requestInstance.post('/api/order/pay/callback', payData)
}

/**
 * 关闭超时未支付订单
 * @param {string} orderNo - 订单编号
 * @returns {Promise} - resolve结果为关闭状态（仅data部分）
 */
export const closeTimeoutOrderApi = (orderNo) => {
  if (!orderNo) {
    ElMessage.error('订单编号不能为空！')
    return Promise.reject(new Error('订单编号不能为空'))
  }
  return requestInstance.post(`/api/order/close/${orderNo}`)
}