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
            <input type="checkbox" v-model="item.selected" />
          </div>
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-desc">{{ item.description || '暂无描述' }}</p>
          </div>
          <div class="item-price">¥{{ item.price.toFixed(2) }}</div>
          <div class="item-quantity">
            <button @click="decrease(item)">-</button>
            <span>{{ item.count }}</span>
            <button @click="increase(item)">+</button>
          </div>
          <div class="item-total">¥{{ (item.price * item.count).toFixed(2) }}</div>
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
        </div>
        <div class="footer-right">
          <div class="total">
            总计：<strong>¥{{ totalAmount.toFixed(2) }}</strong>
          </div>
          <button class="btn-checkout" :disabled="selectedCount === 0">
            去结算 ({{ selectedCount }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/Cart'
// 引入UI组件优化体验（可选，需安装element-plus）
// import { ElMessageBox, ElMessage } from 'element-plus'

const cartStore = useCartStore()

// 关键修复：用computed包裹，保持响应式（核心！）
const cartItems = computed(() => cartStore.items)

// 全选逻辑（兼容响应式）
const allSelected = computed({
  get() {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
  },
  set(value) {
    cartItems.value.forEach(item => (item.selected = value))
  }
})

// 已选商品数量
const selectedCount = computed(() =>
  cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.count, 0)
)

// 总金额
const totalAmount = computed(() =>
  cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.count, 0)
)

// 增加数量（复用cartStore的addItem，保证状态统一）
const increase = (item) => {
  cartStore.addItem(item)
}

// 减少数量（优化边界处理，避免count为0）
const decrease = (item) => {
  if (item.count > 1) {
    // 直接修改count，Pinia的数组元素是响应式的
    item.count--
  } else {
    // 数量为1时，删除商品
    handleDelete(item.id)
  }
}

// 删除商品（增加二次确认，优化体验）
const handleDelete = (id) => {
  // 方案1：原生确认框（无需依赖UI库）
  if (confirm('确定要删除该商品吗？')) {
    cartStore.removeItem(id)
    alert('商品已成功删除！')
  }

  // 方案2：Element Plus弹窗（需安装依赖，体验更好）
  // ElMessageBox.confirm(
  //   '确定要删除该商品吗？',
  //   '提示',
  //   {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning'
  //   }
  // ).then(() => {
  //   cartStore.removeItem(id)
  //   ElMessage.success('商品已成功删除！')
  // }).catch(() => {
  //   ElMessage.info('已取消删除')
  // })
}

// 暴露删除方法（兼容原有调用）
const removeItem = handleDelete
</script>

<style scoped>
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

.footer-left label {
  font-size: 14px;
  cursor: pointer;
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
}
.btn-checkout:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
}
</style>