import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    cartCount: (state) => state.items.length,
    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.price * item.count, 0)
  },
  actions: {
    addItem(product) {
      // 查找购物车中是否已有该商品
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        // 如果存在，则增加数量
        existingItem.count += 1
      } else {
        // 否则添加新商品，默认数量为1
        this.items.push({ ...product, count: 1 })
      }
    },
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id)
    }
  }
})