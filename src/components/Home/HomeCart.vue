<template>
  <div class="cart-page wrapper">
    <h2 class="page-title">我的购物车</h2>

    <!-- 购物车为空 -->
    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>购物车还是空的哦～</p>
      <router-link to="/" class="btn-primary">去逛逛</router-link>
    </div>

    <!-- 购物车有商品 -->
    <div v-else>
      <div class="cart-list">
        <div class="cart-item" v-for="item in cartItems" :key="item.id">
          <div class="item-checkbox">
            <input 
              type="checkbox" 
              v-model="item.selected" 
              :true-value="true" 
              :false-value="false"
            />
          </div>
          <div class="item-image">
            <img :src="item.image" :alt="item.name" loading="lazy" />
          </div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-desc">{{ item.description || '暂无描述' }}</p>
          </div>
          <div class="item-price">¥{{ formatPrice(item.price) }}</div>
          <div class="item-quantity">
            <!-- 禁用减少按钮（数量为1时） -->
            <button @click="decrease(item)" :disabled="item.count <= 1">-</button>
            <span>{{ item.count }}</span>
            <button @click="increase(item)">+</button>
          </div>
          <div class="item-total">¥{{ formatPrice(item.price * item.count) }}</div>
          <div class="item-actions">
            <button @click="handleDelete(item.id)" class="btn-delete">删除</button>
          </div>
        </div>
      </div>
      <!-- 底部操作栏 -->
      <div class="cart-footer">
        <div class="footer-left">
          <label>
            <input type="checkbox" v-model="allSelected" /> 全选
          </label>
          <!-- 清空选中商品按钮 -->
          <button class="btn-clear" @click="handleClearSelected">清空选中</button>
        </div>
        <div class="footer-right">
          <div class="total">
            总计：<strong>¥{{ formatPrice(totalAmount) }}</strong>
            <!-- 标注不含运费/优惠 -->
            <span class="total-tips">（不含运费/优惠）</span>
          </div>
          <button 
            class="btn-checkout" 
            :disabled="selectedCount === 0 || isLoading" 
            @click="handleCheckout"
          >
            <span v-if="isLoading">处理中...</span>
            <span v-else>去结算 ({{ selectedCount }})</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '@/stores/Cart'
import { useOrderStore } from '@/stores/Order' // 引入订单Store
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

// 初始化Store和路由
const cartStore = useCartStore()
const orderStore = useOrderStore() // 初始化订单Store
const userStore = useUserStore()
const router = useRouter()

// 加载状态
const isLoading = ref(false)

// 关键：用computed包裹，保持响应式，兜底空数组
const cartItems = computed(() => cartStore.items || [])

// 统一价格格式化方法（解决浮点精度问题）
const formatPrice = (price) => {
  // 处理null/undefined，避免报错，保证两位小数
  if (!price && price !== 0) return '0.00'
  return Number(price).toFixed(2)
}

// 全选逻辑（兼容响应式）
const allSelected = computed({
  get() {
    // 空数组时不选中
    return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
  },
  set(value) {
    cartItems.value.forEach(item => {
      // 强制布尔值，避免类型异常
      item.selected = !!value
    })
  }
})

// 已选商品数量
const selectedCount = computed(() =>
  cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.count || 0), 0) // count兜底0
)

// 总金额（统一计算规则：保留2位小数）
const totalAmount = computed(() => {
  const total = cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => {
      // 处理price/count为null/undefined的情况
      const itemPrice = Number(item.price) || 0
      const itemCount = Number(item.count) || 0
      const itemTotal = itemPrice * itemCount
      return sum + itemTotal
    }, 0)
  // 统一保留2位小数
  return Number(total).toFixed(2)
})

// 增加数量（复用cartStore的addItem，保证状态统一）
const increase = (item) => {
  // 校验item有效性
  if (!item) return
  cartStore.addItem(item)
}

// 减少数量（优化边界处理，避免count为0）
const decrease = (item) => {
  if (!item) return
  if (item.count > 1) {
    item.count--
    // 同步更新CartStore（如果CartStore有更新方法）
    if (cartStore.updateItem) {
      cartStore.updateItem(item.id, { count: item.count })
    }
  }
}

// 删除商品
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    cartStore.removeItem(id)
    ElMessage.success('商品已成功删除！')
  } catch (error) {
    ElMessage.info('已取消删除')
  }
}

// 清空选中商品
const handleClearSelected = async () => {
  const selectedIds = cartItems.value
    .filter(item => item.selected)
    .map(item => item.id)
  
  if (selectedIds.length === 0) {
    ElMessage.warning('暂无选中的商品！')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除所有选中的商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    selectedIds.forEach(id => cartStore.removeItem(id))
    ElMessage.success('已删除所有选中的商品！')
  } catch (error) {
    ElMessage.info('已取消清空操作')
  }
}

// 核心改造：结算逻辑 - 仅存储选中商品到OrderStore，跳转确认订单页
const handleCheckout = async () => {
  // 校验登录状态，未登录跳登录页
  if (!userStore.isLogin) {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.fullPath } // 登录后返回购物车
    })
    ElMessage.warning('请先登录后再结算！')
    return
  }

  // 校验是否有选中商品
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择需要结算的商品！')
    return
  }

  isLoading.value = true

  try {
    // 1. 筛选选中的商品，组装订单数据格式（对齐确认订单页）
    const selectedGoods = cartItems.value.filter(item => item.selected).map(item => ({
      id: Number(item.id) || 0, // 商品ID
      name: item.name || '未知商品', // 商品名称
      image: item.image || '', // 商品图片
      spec: item.description || '默认规格', // 商品规格
      price: formatPrice(item.price), // 商品单价（字符串，保留2位小数）
      count: Number(item.count) || 1, // 购买数量
      totalPrice: formatPrice(item.price * item.count) // 商品小计
    }))

    // 2. 组装订单基础数据（供确认订单页使用）
    const orderData = {
      goodsList: selectedGoods, // 选中商品列表
      totalCount: Number(selectedCount.value), // 商品总数量
      totalAmount: totalAmount.value, // 商品总价（字符串，保留2位小数）
      freight: '0.00', // 运费（默认免运费）
      discount: '0.00', // 优惠金额（默认无优惠）
      actualAmount: totalAmount.value // 实付金额（初始等于商品总价）
    }

    // 3. 存储订单数据到OrderStore（关键：深拷贝避免引用问题）
    const setResult = orderStore.setOrderData(orderData)
    
    if (!setResult) {
      ElMessage.error('订单数据处理失败，请重试！')
      return
    }

    // 4. 跳转至确认订单页
    ElMessage.success('已选择商品，即将进入确认订单页面！')
    setTimeout(() => {
      router.push('/order') // 跳转确认订单页
    }, 800)

  } catch (error) {
    // 异常处理
    ElMessage.error(`处理失败：${error.message || '数据处理异常，请稍后重试'}`)
    console.error('结算处理失败：', error)
  } finally {
    // 关闭加载状态
    isLoading.value = false
  }
}

// 页面挂载时校验购物车数据，兜底处理
onMounted(() => {
  // 确保购物车数据是数组
  if (!Array.isArray(cartStore.items)) {
    cartStore.items = []
  }
  // 确保每个商品有selected字段
  cartStore.items.forEach(item => {
    if (item.selected === undefined) {
      item.selected = false
    }
  })
})

// 暴露删除方法（兼容原有调用）
const removeItem = handleDelete
</script>

<style scoped>
/* 基础样式 */
.cart-page {
  padding: 20px 0;
}

.page-title {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}
.empty-cart .btn-primary {
  margin-top: 20px;
  display: inline-block;
  padding: 10px 24px;
  background-color: #5eb69c;
  color: white;
  border-radius: 4px;
  text-decoration: none;
}

/* 商品项 */
.cart-item {
  display: grid;
  grid-template-columns: 30px 80px 1fr 80px 100px 80px 80px;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.item-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info h3 {
  font-size: 16px;
  margin: 0;
  color: #333;
}
.item-desc {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}

.item-price,
.item-total {
  font-size: 16px;
  color: #e26237;
  font-weight: bold;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}
.item-quantity button {
  width: 24px;
  height: 24px;
  font-size: 14px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  cursor: pointer;
}
/* 禁用状态样式 */
.item-quantity button:disabled {
  background: #eee;
  color: #999;
  cursor: not-allowed;
  border-color: #ccc;
}
.item-quantity span {
  min-width: 20px;
  text-align: center;
}

.btn-delete {
  color: #e26237;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.btn-delete:hover {
  color: #d1481f;
}

/* 底部操作栏 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid #f5f5f5;
}

.footer-left {
  display: flex; /* 横向排列 */
  align-items: center;
  gap: 16px; /* 间距 */
}
.footer-left label {
  font-size: 14px;
  cursor: pointer;
}
/* 清空选中按钮样式 */
.btn-clear {
  font-size: 14px;
  color: #e26237;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}
.btn-clear:hover {
  color: #d1481f;
  text-decoration: underline;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total {
  font-size: 18px;
  color: #333;
}
/* 总计提示文字 */
.total-tips {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
  font-weight: normal;
}
.total strong {
  color: #e26237;
  font-size: 20px;
}

.btn-checkout {
  padding: 10px 24px;
  background-color: #e26237;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-checkout:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.btn-checkout:not(:disabled):hover {
  background-color: #d1481f;
}

/* 响应式：小屏调整布局 */
@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 30px 60px 1fr 80px;
    gap: 10px;
  }
  .item-price,
  .item-total,
  .item-actions {
    display: none;
  }
  .footer-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
  /* 响应式：调整清空按钮位置 */
  .footer-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>