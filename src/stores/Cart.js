import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    // 购物车商品数量（商品种类数）
    cartCount: (state) => state.items.length,
    
    // 商品总数量（所有商品的count求和）→ 对应订单的totalCount
    totalCount: (state) => state.items.reduce((sum, item) => sum + (item.count || 0), 0),
    
    // 商品总价（所有商品price*count求和，保留2位小数）→ 对应订单的goodsAmount
    totalAmount: (state) => {
      const total = state.items.reduce((sum, item) => sum + item.price * item.count, 0)
      return total.toFixed(2) // 转为字符串，匹配后端BigDecimal格式
    },
    
    // 实付金额（默认等于商品总价，可扩展优惠/运费逻辑）→ 对应订单的actualAmount
    actualAmount: (state) => {
      const total = state.items.reduce((sum, item) => sum + item.price * item.count, 0)
      return total.toFixed(2)
    },
    
    // 格式化购物车数据（适配订单创建的参数结构）
    orderData: (state) => ({
      goodsList: state.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price.toFixed(2), // 单价保留2位小数，转为字符串
        count: item.count // 商品数量
      })),
      totalCount: state.items.reduce((sum, item) => sum + (item.count || 0), 0), // 商品总数量
      totalAmount: state.items.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(2), // 商品总价
      freight: '0.00', // 运费默认0（可扩展）
      discount: '0.00', // 优惠默认0（可扩展）
      actualAmount: state.items.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(2) // 实付金额
    })
  },
  actions: {
    addItem(product) {
      // 查找购物车中是否已有该商品
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        // 如果存在，则增加数量
        existingItem.count += 1
      } else {
        // 否则添加新商品，默认数量为1（确保count字段存在）
        this.items.push({ ...product, count: 1 })
      }
    },
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id)
    },
    
    // 清空购物车（下单后调用）
    clearCart() {
      this.items = []
    },
    
    // 更新商品数量（可选扩展）
    updateItemCount(id, count) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        item.count = Math.max(1, count) // 确保数量≥1
      }
    }
  }
})