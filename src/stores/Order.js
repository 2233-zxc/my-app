import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'
import { createOrderApi } from '@/apis/orderApi'
import { useUserStore } from '@/stores/user' 

// 工具函数抽离
const safeNumber = (val) => {
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

// 手机号格式校验
const validateMobile = (mobile) => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(mobile)
}

// 订单数据默认值抽离
const DEFAULT_ORDER_DATA = {
  goodsList: [],
  totalCount: 0,
  totalAmount: '0.00',
  freight: '0.00',
  discount: '0.00',
  actualAmount: '0.00'
}

const DEFAULT_PAY_INFO = {
  receiverName: '',
  receiverMobile: '',
  provinceName: '',
  cityName: '',
  districtName: '',
  detailAddress: '',
  payMethod: 'alipay',
  deliveryType: 'express',
  payServiceFee: '0.00',
  remark: ''
}

const DEFAULT_ORDER_INFO = {
  totalAmount: '0.00',
  payMethod: 'alipay',
  deliveryType: 'express'
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderData: { ...DEFAULT_ORDER_DATA },
    payInfo: { ...DEFAULT_PAY_INFO },
    realOrderNo: '',
    orderInfo: { ...DEFAULT_ORDER_INFO }
  }),

  actions: {
    // 设置订单编号
    setRealOrderNo(orderNo) {
      this.realOrderNo = orderNo || ''
    },
    
    // 获取订单编号
    getRealOrderNo() {
      return this.realOrderNo
    },

    // 设置订单数据
    setOrderData(data) {
      if (!data || !Array.isArray(data.goodsList) || data.goodsList.length === 0) {
        console.error('订单数据错误：商品列表不能为空')
        return false
      }

      // 计算商品总数
      const calcTotalCount = data.goodsList.reduce((sum, item) => {
        return sum + safeNumber(item.count)
      }, 0)

      if (calcTotalCount <= 0) {
        console.error('商品总数量必须大于0')
        return false
      }

      // 计算商品总价
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

    // 设置收货地址
    setReceiverAddress(address) {
      if (!address) return false
      
      const { receiverName, receiverMobile, provinceName, cityName, districtName, detailAddress } = address
      
      // 手机号校验
      if (receiverMobile && !validateMobile(receiverMobile)) {
        console.error('手机号格式错误，请输入11位有效手机号')
        return false
      }
      
      // 核心字段非空校验
      const requiredFields = [
        { name: '收货人姓名', value: receiverName },
        { name: '省份', value: provinceName },
        { name: '城市', value: cityName },
        { name: '详细地址', value: detailAddress }
      ]
      
      const emptyField = requiredFields.find(item => !item.value)
      if (emptyField) {
        console.error(`${emptyField.name}不能为空`)
        return false
      }

      // 更新地址信息
      this.payInfo.receiverName = receiverName || ''
      this.payInfo.receiverMobile = receiverMobile || ''
      this.payInfo.provinceName = provinceName || ''
      this.payInfo.cityName = cityName || ''
      this.payInfo.districtName = districtName || ''
      this.payInfo.detailAddress = detailAddress || ''
      
      return true
    },

    // 设置支付信息
    setPayInfo(info) {
      this.payInfo = { ...this.payInfo, ...info }
      this.orderInfo = {
        ...this.orderInfo,
        payMethod: info.payMethod || this.orderInfo.payMethod,
        deliveryType: info.deliveryType || this.orderInfo.deliveryType
      }
    },

    // 组装订单DTO
    assembleOrderDto() {
      const userStore = useUserStore()
      const userId = safeNumber(userStore.userInfo?.userId)
      
      // 校验用户ID
      if (!userId) {
        throw new Error('用户未登录，请先登录')
      }

      // 解构支付信息
      const { 
        receiverName, receiverMobile, provinceName, 
        cityName, districtName, detailAddress,
        payMethod, deliveryType, remark, payServiceFee
      } = this.payInfo

      // 校验收货地址
      const validateAddress = () => {
        const errors = []
        if (!receiverName) errors.push('收货人姓名不能为空')
        if (!receiverMobile) errors.push('收货人手机号不能为空')
        else if (!validateMobile(receiverMobile)) errors.push('手机号格式错误（11位有效手机号）')
        if (!provinceName) errors.push('省份名称不能为空')
        if (!cityName) errors.push('城市名称不能为空')
        if (!districtName) errors.push('区县名称不能为空')
        if (!detailAddress) errors.push('详细地址不能为空')
        return errors
      }

      const addressErrors = validateAddress()
      if (addressErrors.length > 0) {
        throw new Error(addressErrors.join('；'))
      }

      // 计算商品总数
      const finalTotalCount = this.orderData.totalCount > 0 
        ? this.orderData.totalCount 
        : this.orderData.goodsList.reduce((sum, item) => sum + safeNumber(item.count), 0)

      if (finalTotalCount <= 0) {
        throw new Error('商品总数量无效')
      }

      // 处理商品列表
      const goodsList = this.orderData.goodsList.map(item => ({
        productId: safeNumber(item.id),
        goodsName: (item.name || '').toString().trim() || '未命名商品',
        goodsImage: item.image || '',
        goodsSpec: item.spec || '',
        price: (safeNumber(item.price) || 0).toFixed(2),
        quantity: safeNumber(item.count) || 1,
        itemAmount: (safeNumber(item.price) * safeNumber(item.count)).toFixed(2)
      }))

      // 组装DTO
      return {
        userId,
        receiverName: receiverName.trim(),
        receiverMobile: receiverMobile.trim(),
        provinceName: provinceName.trim(),
        cityName: cityName.trim(),
        districtName: districtName.trim(),
        detailAddress: detailAddress.trim(),
        totalCount: finalTotalCount,
        goodsAmount: (safeNumber(this.orderData.totalAmount) || 0).toFixed(2),
        freight: (safeNumber(this.orderData.freight) || 0).toFixed(2),
        discount: (safeNumber(this.orderData.discount) || 0).toFixed(2),
        totalAmount: (safeNumber(this.orderData.actualAmount) || 0).toFixed(2),
        payMethod: payMethod || 'alipay',
        deliveryType: deliveryType || 'express',
        remark: remark || '',
        productName: goodsList.map(g => g.goodsName).join(',').substring(0, 128),
        payServiceFee: (safeNumber(payServiceFee) || 0).toFixed(2),
        goodsList
      }
    },

    // 创建订单
    async createOrder() {
      // 前置校验
      if (this.orderData.goodsList.length === 0) {
        return { success: false, error: '商品列表为空' }
      }

      // 校验收货地址
      const addressErrors = []
      const { receiverName, receiverMobile, provinceName, cityName, districtName, detailAddress } = this.payInfo
      
      if (!receiverName) addressErrors.push('请填写收货人姓名')
      if (!receiverMobile) addressErrors.push('请填写收货人手机号')
      else if (!validateMobile(receiverMobile)) addressErrors.push('手机号格式错误（11位有效手机号）')
      if (!provinceName) addressErrors.push('请选择省份')
      if (!cityName) addressErrors.push('请选择城市')
      if (!districtName) addressErrors.push('请选择区县')
      if (!detailAddress) addressErrors.push('请填写详细地址')
      
      if (addressErrors.length > 0) {
        return { success: false, error: addressErrors.join('；') }
      }

      try {
        const orderDto = this.assembleOrderDto()
        console.log('提交订单参数:', JSON.stringify(orderDto, null, 2))

        const response = await createOrderApi(orderDto)
        
        // 修复：response已经是res.data，不需要再访问.data
        this.realOrderNo = response?.orderNo || ''
        this.orderInfo.totalAmount = orderDto.totalAmount
        
        return {
          success: true,
          orderNo: this.realOrderNo,
          message: '订单创建成功'
        }
      } catch (error) {
        console.error('创建订单异常:', error)
        return {
          success: false,
          error: error.message || error.response?.data?.msg || '网络错误，请重试'
        }
      }
    }
  },
  
  // 持久化配置
  persist: {
    enabled: true,
    storage: localStorage,
    paths: ['realOrderNo', 'orderInfo']
  }
})