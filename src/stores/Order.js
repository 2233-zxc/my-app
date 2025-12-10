// @/stores/Order.js
import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash' // 推荐使用深拷贝，避免引用问题

export const useOrderStore = defineStore('order', {
  state: () => ({
    // 订单基础数据（从购物车传递）
    orderData: {
      goodsList: [], // 选中商品列表
      totalCount: 0, // 商品总数量
      totalAmount: '0.00', // 商品总价
      freight: '0.00', // 运费
      discount: '0.00', // 优惠金额
      actualAmount: '0.00' // 实付金额
    },
    // 支付相关信息
    payInfo: {
      addressId: '', // 收货地址ID
      payMethod: 'alipay', // 默认支付方式
      remark: '' // 订单备注
    },
    // 订单状态
    isOrderComplete: false,
    isOrderExpired: false
  }),

  actions: {
    /**
     * 存储从购物车传递的订单基础数据
     * @param {Object} data - 购物车选中的订单数据
     * @returns {Boolean} 是否存储成功
     */
    setOrderData(data) {
      try {
        if (!data || !Array.isArray(data.goodsList) || data.goodsList.length === 0) {
          console.error('订单数据格式错误：商品列表不能为空')
          return false
        }

        // 深拷贝，避免购物车数据修改影响订单数据
        this.orderData = cloneDeep({
          goodsList: data.goodsList,
          totalCount: Number(data.totalCount) || 0,
          totalAmount: data.totalAmount || '0.00',
          freight: data.freight || '0.00',
          discount: data.discount || '0.00',
          actualAmount: data.actualAmount || '0.00'
        })

        // 初始化订单完成状态
        this.isOrderComplete = false
        return true
      } catch (error) {
        console.error('存储订单数据失败：', error)
        return false
      }
    },

    /**
     * 设置支付相关信息（地址、支付方式、备注等）
     * @param {Object} info - 支付信息
     */
    setPayInfo(info) {
      this.payInfo = { ...this.payInfo, ...info }
      // 更新订单完成状态（地址和支付方式都存在则视为完成）
      this.isOrderComplete = !!this.payInfo.addressId && !!this.payInfo.payMethod
    },

    /**
     * 获取完整的支付参数
     * @returns {Object} 支付参数
     */
    getPayParams() {
      return {
        ...this.orderData,
        ...this.payInfo,
        orderNo: `ORD${Date.now()}` // 临时订单号，实际由后端生成
      }
    },

    /**
     * 清空订单数据（保留支付方式配置）
     * @param {Boolean} keepPayInfo - 是否保留支付信息
     */
    clearOrderData(keepPayInfo = false) {
      this.orderData = {
        goodsList: [],
        totalCount: 0,
        totalAmount: '0.00',
        freight: '0.00',
        discount: '0.00',
        actualAmount: '0.00'
      }
      this.isOrderComplete = false
      if (!keepPayInfo) {
        this.payInfo = {
          addressId: '',
          payMethod: 'alipay',
          remark: ''
        }
      }
    }
  },

  getters: {
    // 校验商品金额是否有效（防篡改）
    isGoodsAmountValid() {
      const calculatedTotal = this.orderData.goodsList.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.count)
      }, 0).toFixed(2)
      return calculatedTotal === this.orderData.totalAmount
    }
  }
})