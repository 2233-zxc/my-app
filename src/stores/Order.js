import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'
import { createOrderApi } from '@/apis/orderApi'

// 安全数字转换
const safeNumber = (val) => {
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderData: {
      goodsList: [],
      totalCount: 0,
      totalAmount: '0.00',
      freight: '0.00',
      discount: '0.00',
      actualAmount: '0.00'
    },
    payInfo: {
      addressId: '',
      payMethod: 'alipay',
      deliveryType: 'express',
      payServiceFee: '0.00',
      remark: ''
    },
    realOrderNo: ''
  }),

  actions: {
    // 设置订单商品数据（来自购物车）
    setOrderData(data) {
      if (!data || !Array.isArray(data.goodsList) || data.goodsList.length === 0) {
        console.error('订单数据错误：商品列表不能为空')
        return false
      }

      const calcTotalCount = data.goodsList.reduce((sum, item) => {
        return sum + safeNumber(item.count)
      }, 0)

      if (calcTotalCount <= 0) {
        console.error('商品总数量必须大于0')
        return false
      }

      const calcTotalAmount = data.goodsList.reduce((sum, item) => {
        return sum + safeNumber(item.price) * safeNumber(item.count)
      }, 0).toFixed(2)

      this.orderData = cloneDeep({
        goodsList: data.goodsList,
        totalCount: calcTotalCount,
        totalAmount: data.totalAmount || calcTotalAmount,
        freight: data.freight || '0.00',
        discount: data.discount || '0.00',
        actualAmount: data.actualAmount || '0.00'
      })

      return true
    },

    // 设置支付相关参数（地址、支付方式等）
    setPayInfo(info) {
      this.payInfo = { ...this.payInfo, ...info }
    },

    // 组装提交给后端的 OrderDto（关键：补全 goodsName）
    assembleOrderDto() {
      const finalTotalCount = this.orderData.totalCount > 0 
        ? this.orderData.totalCount 
        : this.orderData.goodsList.reduce((sum, item) => sum + safeNumber(item.count), 0)

      if (finalTotalCount <= 0) {
        throw new Error('商品总数量无效')
      }

      // 关键修复：确保 goodsName 不为 null 或 undefined
      const goodsList = this.orderData.goodsList.map(item => {
        // 防御性处理：name 可能是 undefined / null / 空字符串
        const goodsName = (item.name || '').toString().trim() || '未命名商品'

        return {
          productId: safeNumber(item.id),
          goodsName: goodsName, // ←←← 这里保证非 null
          goodsImage: item.image || '',
          goodsSpec: item.spec || '',
          price: (item.price || 0).toFixed(2),
          quantity: safeNumber(item.count) || 1,
          itemAmount: (safeNumber(item.price) * safeNumber(item.count)).toFixed(2)
        }
      })

      return {
        userId: 1, // 实际应从用户状态获取
        addressId: safeNumber(this.payInfo.addressId) || 0,
        totalCount: finalTotalCount,
        goodsAmount: this.orderData.totalAmount,
        freight: this.orderData.freight,
        discount: this.orderData.discount,
        totalAmount: this.orderData.actualAmount,
        payMethod: this.payInfo.payMethod,
        deliveryType: this.payInfo.deliveryType,
        remark: this.payInfo.remark || '',
        productName: goodsList.map(g => g.goodsName).join(','), // 商品名称拼接
        payServiceFee: this.payInfo.payServiceFee,
        goodsList: goodsList // 包含 goodsName 的完整列表
      }
    },

    // 提交订单到后端
    async createOrder() {
      if (!this.payInfo.addressId) {
        return { success: false, error: '请选择收货地址' }
      }
      if (this.orderData.goodsList.length === 0) {
        return { success: false, error: '商品列表为空' }
      }

      try {
        const orderDto = this.assembleOrderDto()
        console.log('提交订单参数:', JSON.stringify(orderDto, null, 2))

        const response = await createOrderApi(orderDto)
        
        // 修复：直接使用 response 作为数据（因为拦截器已处理状态码）
        this.realOrderNo = response?.orderNo || ''
        return {
          success: true,
          orderNo: this.realOrderNo,
          message: '订单创建成功'
        }
      } catch (error) {
        console.error('创建订单异常:', error)
        return {
          success: false,
          error: error.message || '网络错误，请重试'
        }
      }
    }
  }
})